from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException, Form, Request
from fastapi.responses import JSONResponse
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
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType

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


# LLM Retry Logic Helper
async def call_llm_with_retry(chat, message, max_retries=2, timeout=30):
    """
    Call LLM with timeout and retry logic
    
    Args:
        chat: LlmChat instance
        message: UserMessage to send
        max_retries: Maximum number of retry attempts
        timeout: Timeout in seconds for each attempt
        
    Returns:
        Response string from LLM
        
    Raises:
        Exception if all retries fail
    """
    for attempt in range(max_retries):
        try:
            response = await asyncio.wait_for(
                chat.send_message(message),
                timeout=timeout
            )
            return response
        except (asyncio.TimeoutError, Exception) as e:
            if attempt == max_retries - 1:
                logger.error(f"LLM call failed after {max_retries} attempts: {e}")
                raise e
            logger.warning(f"LLM attempt {attempt + 1} failed: {e}, retrying...")
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
        
        # Get LLM API key
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            logger.error("EMERGENT_LLM_KEY not found in environment")
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        logger.info(f"Using API key: {api_key[:20]}...")
        
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
        
        # Initialize LLM chat with selected model
        chat = LlmChat(
            api_key=api_key,
            session_id=f"resume-parse-{uuid.uuid4()}",
            system_message="You are a resume parsing assistant. Extract structured information from resumes accurately."
        ).with_model(model_provider, model_name)
        
        # Create parsing prompt
        parsing_prompt = f"""
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
        
        Return ONLY the JSON object, no additional text or markdown formatting.
        """
        
        # Send message with retry logic
        user_message = UserMessage(text=parsing_prompt)
        
        response = await call_llm_with_retry(chat, user_message, timeout=30)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        # Parse the JSON response
        try:
            response_text = response.strip()
            
            # Extract JSON from any wrapper format (markdown fences, leading text, etc.)
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                response_text = json_match.group()
            
            parsed_data = json.loads(response_text)
            
            # Add raw text to response
            parsed_data['raw_text'] = pdf_text
            
            return {
                "success": True,
                "data": parsed_data
            }
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse LLM response as JSON: {e}")
            logging.error(f"Response was: {response}")
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
        # Get API key
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        # Load all scraped jobs
        logger.info("Loading scraped jobs...")
        jobs = load_all_jobs(only_successful=True)
        
        if not jobs:
            raise HTTPException(status_code=404, detail="No jobs found in database")
        
        logger.info(f"Loaded {len(jobs)} jobs successfully")
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