from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException, Form, Request
from fastapi.responses import JSONResponse
from starlette.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import tempfile
import json
import asyncio
from openai import AsyncOpenAI

# Import utilities
import sys
sys.path.append(str(Path(__file__).parent))
from utils.load_jobs import load_all_jobs
from services.job_matcher import JobMatcher


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# LLM Retry Logic Helper for OpenAI
async def call_openai_with_retry(client, messages, model, max_retries=2, timeout=30):
    """
    Call OpenAI with timeout and retry logic
    
    Args:
        client: AsyncOpenAI client instance
        messages: List of message dicts for chat completion
        model: Model name (e.g., 'gpt-4o-mini')
        max_retries: Maximum number of retry attempts
        timeout: Timeout in seconds for each attempt
        
    Returns:
        Response content string from OpenAI
        
    Raises:
        Exception if all retries fail
    """
    for attempt in range(max_retries):
        try:
            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=model,
                    messages=messages,
                    response_format={"type": "json_object"}
                ),
                timeout=timeout
            )
            return response.choices[0].message.content
        except (asyncio.TimeoutError, Exception) as e:
            if attempt == max_retries - 1:
                logger.error(f"OpenAI call failed after {max_retries} attempts: {e}")
                raise e
            logger.warning(f"OpenAI attempt {attempt + 1} failed: {e}, retrying...")
            await asyncio.sleep(1)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ParsedResume(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    experience: List[dict] = []
    education: List[dict] = []
    raw_text: Optional[str] = None

class MatchJobsRequest(BaseModel):
    resume_text: str
    parsed_data: dict
    openai_key: str = ''
    model_provider: str = 'openai'
    model_name: str = 'gpt-4o-mini'

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/parse-resume")
async def parse_resume(
    request: Request,
    file: UploadFile = File(...)
):
    """
    Parse uploaded resume PDF using LLM with configurable model
    """
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Get model parameters from form data
        form_data = await request.form()
        model_provider = form_data.get('model_provider', 'openai')
        model_name = form_data.get('model_name', 'gpt-4o-mini')
        
        logger.info(f"Using model: {model_provider}:{model_name}")
        
        # Create temporary file to store uploaded PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Get OpenAI API key from request header or env
        api_key = request.headers.get('X-OpenAI-Key') or os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=400, detail="OpenAI API key required. Add your key in Settings.")
        
        # Read PDF content as text (simple approach for OpenAI)
        import PyPDF2
        pdf_text = ""
        try:
            with open(temp_file_path, 'rb') as pdf_file:
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                for page in pdf_reader.pages:
                    pdf_text += page.extract_text()
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            os.unlink(temp_file_path)
            raise HTTPException(status_code=400, detail="Failed to read PDF file")
        
        # Initialize OpenAI client
        client = AsyncOpenAI(api_key=api_key)
        
        # Create parsing prompt - ensure JSON-only response
        system_message = "You are a resume parsing assistant. Extract structured information from resumes accurately. Always respond with valid JSON only, no markdown or additional text."
        
        user_prompt = f"""
Please analyze this resume text and extract the following information in JSON format:
{{
    "name": "Full name of the candidate",
    "email": "Email address",
    "phone": "Phone number",
    "summary": "Professional summary or objective (2-3 sentences)",
    "skills": ["skill1", "skill2", "skill3", ...],
    "experience": [
        {{
            "company": "Company name",
            "role": "Job title",
            "duration": "Time period (e.g., Jan 2020 - Dec 2022)",
            "description": "Brief description of responsibilities"
        }}
    ],
    "education": [
        {{
            "institution": "School/University name",
            "degree": "Degree name",
            "year": "Graduation year or period",
            "field": "Field of study"
        }}
    ]
}}

Resume text:
{pdf_text}

Return ONLY the JSON object.
"""
        
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_prompt}
        ]
        
        # Send message with retry logic
        response = await call_openai_with_retry(client, messages, model_name, timeout=30)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        # Parse the JSON response (response_format ensures valid JSON)
        try:
            parsed_data = json.loads(response)
            
            # Add raw text to response
            parsed_data['raw_text'] = pdf_text
            
            return {
                "success": True,
                "data": parsed_data
            }
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response as JSON: {e}")
            logger.error(f"Response was: {response}")
            return {
                "success": True,
                "data": {
                    "raw_response": response,
                    "error": "Failed to parse structured data, showing raw response"
                }
            }
            
    except Exception as e:
        logging.error(f"Error parsing resume: {str(e)}")
        logging.error(f"Error type: {type(e).__name__}")
        import traceback
        logging.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

@api_router.post("/match-jobs")
async def match_jobs(request: MatchJobsRequest):
    """
    Match resume against scraped job descriptions using LLM with configurable model
    """
    try:
        # Get OpenAI API key from request body or env
        api_key = request.openai_key or os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=400, detail="OpenAI API key required. Add your key in Settings.")
        
        # Load all scraped jobs
        logger.info("Loading scraped jobs...")
        all_jobs = load_all_jobs(only_successful=True)

        if not all_jobs:
            raise HTTPException(status_code=404, detail="No jobs found in database")

        jobs = all_jobs
        logger.info(f"Loaded {len(jobs)} jobs for matching")
        logger.info(f"Using model: {request.model_provider}:{request.model_name}")
        
        # Initialize job matcher with model configuration
        matcher = JobMatcher(
            api_key=api_key,
            model_provider=request.model_provider,
            model_name=request.model_name
        )
        
        # Match resume against jobs
        matches = await matcher.match_resume_to_jobs(
            resume_text=request.resume_text,
            parsed_resume=request.parsed_data,
            jobs=jobs
        )
        
        return {
            "success": True,
            "matches": matches,
            "total_jobs_analyzed": len(jobs),
            "matches_found": len(matches)
        }
        
    except Exception as e:
        logger.error(f"Error matching jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/match-jobs-stream")
async def match_jobs_stream(request: MatchJobsRequest):
    """
    Stream match results one by one as they are scored via SSE.
    Each event is a JSON object with a single match result.
    Final event has type 'done'.
    """
    api_key = request.openai_key or os.environ.get('OPENAI_API_KEY')
    if not api_key:
        raise HTTPException(status_code=400, detail="OpenAI API key required.")

    all_jobs = load_all_jobs(only_successful=True)
    if not all_jobs:
        raise HTTPException(status_code=404, detail="No jobs found")

    matcher = JobMatcher(
        api_key=api_key,
        model_provider=request.model_provider,
        model_name=request.model_name
    )

    async def event_stream():
        from services.job_matcher import prescreen_job, COMPANY_DETAILS

        # Pre-screen
        screened_jobs = []
        for job in all_jobs:
            passed, reason = prescreen_job(request.parsed_data, request.resume_text, job)
            if passed:
                screened_jobs.append(job)

        # Send total count so frontend knows how many to expect
        yield f"data: {json.dumps({'type': 'info', 'total_jobs': len(screened_jobs)})}\n\n"

        match_count = 0
        # Process in small batches of 5 for parallelism
        BATCH_SIZE = 5
        for i in range(0, len(screened_jobs), BATCH_SIZE):
            batch = screened_jobs[i:i + BATCH_SIZE]
            tasks = [
                matcher.score_single_job(request.resume_text, request.parsed_data, job)
                for job in batch
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for job, result in zip(batch, results):
                if isinstance(result, Exception) or result is None:
                    continue
                if result.get('ranking', 'reject') != 'reject':
                    match_count += 1
                    yield f"data: {json.dumps({'type': 'match', 'match': result})}\n\n"

            # Small delay between batches
            if i + BATCH_SIZE < len(screened_jobs):
                await asyncio.sleep(0.5)

        yield f"data: {json.dumps({'type': 'done', 'total_matches': match_count})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()