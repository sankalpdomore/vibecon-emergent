"""
Job Matching Service
Uses LLM to match resumes against job descriptions and generate insights
"""

import logging
import json
from typing import List, Dict
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)


class JobMatcher:
    """
    Matches resumes against job descriptions using LLM-based analysis
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def match_resume_to_job(self, resume_text: str, parsed_resume: dict, job_data: dict) -> Dict:
        """
        Match a single resume against a job description
        
        Args:
            resume_text: Raw text from the resume
            parsed_resume: Structured resume data (skills, experience, etc.)
            job_data: Job data from scraped JSON
            
        Returns:
            Dictionary with score and insights
        """
        try:
            # Extract job details
            jd_text = job_data.get("jd", {}).get("raw_text", "")
            job_title = job_data.get("job", {}).get("title", "Unknown")
            company_name = job_data.get("company_name", "Unknown")
            location = job_data.get("job", {}).get("location_display", "")
            work_mode = job_data.get("job", {}).get("work_mode", "")
            
            # Create matching prompt
            prompt = f"""You are an experienced recruiter analyzing job-candidate fit.

RESUME SUMMARY:
- Skills: {', '.join(parsed_resume.get('skills', [])[:10])}
- Experience: {len(parsed_resume.get('experience', []))} positions
- Education: {', '.join([e.get('degree', '') for e in parsed_resume.get('education', [])])}

FULL RESUME TEXT:
{resume_text[:3000]}

JOB DETAILS:
Company: {company_name}
Title: {job_title}
Location: {location}
Work Mode: {work_mode}

JOB DESCRIPTION:
{jd_text[:4000]}

Analyze the fit between this candidate and job role. Consider:
1. Tech stack overlap - Does their experience match the required technologies?
2. Domain relevance - Does their industry background align (B2B vs B2C, fintech vs healthtech, etc.)?
3. Seniority match - Are they too junior or too senior for this role?
4. Work mode compatibility - Remote candidate for on-site role or vice versa?
5. Company stage fit - Startup experience for a startup role?

Return ONLY a JSON object (no markdown, no extra text):
{{
  "score": 75,
  "insights": [
    "Specific reason 1 explaining fit — direct relevance to their tech stack",
    "Specific reason 2 showing alignment — prior experience matches"
  ]
}}

IMPORTANT:
- Score: 0-100 (be realistic, not everyone is 80+)
- Insights: 2-3 short, specific sentences in recruiter-speak
- Focus on WHY they match, not just that they do
- Be specific: mention actual technologies, experience, or qualifications
- Bad: "Has relevant experience" | Good: "Built distributed systems at scale — directly relevant to their microservices architecture"
"""

            # Initialize LLM chat
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"match-{company_name}-{job_title}",
                system_message="You are a recruiter analyzing job-candidate fit. Return only JSON."
            ).with_model("openai", "gpt-4o-mini")
            
            # Send message
            response = await chat.send_message(UserMessage(text=prompt))
            
            # Parse response
            response_text = response.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
                response_text = response_text.strip()
            
            result = json.loads(response_text)
            
            # Validate response
            if 'score' not in result or 'insights' not in result:
                logger.error(f"Invalid response format for {company_name}: {result}")
                return {"score": 0, "insights": []}
            
            # Cap insights at 3
            result['insights'] = result['insights'][:3]
            
            return result
            
        except Exception as e:
            logger.error(f"Error matching job {job_data.get('company_name')}: {e}")
            return {"score": 0, "insights": []}
    
    async def match_resume_to_jobs(self, resume_text: str, parsed_resume: dict, jobs: List[Dict]) -> List[Dict]:
        """
        Match resume against multiple jobs and return top matches
        
        Args:
            resume_text: Raw text from resume
            parsed_resume: Structured resume data
            jobs: List of job data dictionaries
            
        Returns:
            List of matched jobs with scores and insights, sorted by score
        """
        matches = []
        
        logger.info(f"Matching resume against {len(jobs)} jobs...")
        
        for idx, job in enumerate(jobs):
            try:
                # Match resume to job
                result = await self.match_resume_to_job(resume_text, parsed_resume, job)
                
                score = result.get('score', 0)
                insights = result.get('insights', [])
                
                # Only include matches above 40%
                if score >= 40:
                    # Determine ranking
                    if score >= 80:
                        ranking = 'highly_recommended'
                    elif score >= 60:
                        ranking = 'good_fit'
                    else:
                        ranking = 'needs_discussion'
                    
                    # Format company logo URL
                    logo_path = job.get("company_logo_url", "")
                    if logo_path and not logo_path.startswith("http"):
                        logo_url = f"https://nextdoor.company{logo_path}"
                    else:
                        logo_url = logo_path
                    
                    # Get company initials for fallback
                    company_name = job.get("company_name", "")
                    company_initials = ''.join([word[0].upper() for word in company_name.split()[:2]])
                    
                    match_data = {
                        "company_name": company_name,
                        "company_slug": job.get("company_slug", ""),
                        "company_logo_url": logo_url,
                        "companyInitials": company_initials,
                        "title": job.get("job", {}).get("title", ""),
                        "apply_url": job.get("job", {}).get("apply_url", ""),
                        "location": job.get("job", {}).get("location_display", ""),
                        "departments": job.get("job", {}).get("role_department", "Engineering").title(),
                        "ranking": ranking,
                        "match_insights": insights,
                        "score": score
                    }
                    
                    matches.append(match_data)
                    logger.info(f"  [{idx+1}/{len(jobs)}] {company_name} - {job.get('job', {}).get('title', '')} : {score}% ({ranking})")
                else:
                    logger.info(f"  [{idx+1}/{len(jobs)}] {job.get('company_name', '')} : {score}% (rejected)")
                    
            except Exception as e:
                logger.error(f"Error processing job {idx}: {e}")
                continue
        
        # Sort by score descending and return top 8-10
        matches.sort(key=lambda x: x['score'], reverse=True)
        top_matches = matches[:10]
        
        logger.info(f"Returning {len(top_matches)} top matches out of {len(matches)} total matches")
        
        return top_matches
