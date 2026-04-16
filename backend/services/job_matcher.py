"""
Job Matching Service - Production-Grade Architecture
Uses LLM to match resumes against job descriptions with structured scoring
Based on battle-tested HighValueTeam matching engine
"""

import logging
import json
import re
import asyncio
from typing import List, Dict
from openai import AsyncOpenAI

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

# Scoring weights for Technology:Individual Contributor framework
SCORING_WEIGHTS = {
    'Spark Factor': 17,
    'Role Alignment': 10,
    'Technical Depth': 20,
    'Quantified Impact': 10,
    'Skills Match': 10,
    'Problem Solving': 10,
    'Ownership': 5,
    'Career Growth': 8,
    'Context Matching': 10,
}

SCORING_SYSTEM_PROMPT = """
As an expert member of a hiring evaluation committee, your task is to evaluate and score a resume against a job description based on specific categories.

You will be provided with a candidate's resume and a Job Description. You must assign a score out of 100 for each category listed below in the context of the provided Job Description.

**Categories to Evaluate:**

- **Spark Factor**
  Pedigree + Selection Bar: Tier-1 colleges (IIT, IIM, ISB, Ivy League), FAANG or equivalent companies, founding experience, standout open-source projects, patents/publications. Signal of "selected by top selectors" and high raw ability.

- **Role Alignment**
  Functional Fit: IC-level engineering roles in similar org stages (startup vs enterprise), business models (B2B SaaS, consumer tech), and tech functions (frontend/backend). Penalize mismatched IC/EM tracks or stage gaps.

- **Technical Depth**
  System Mastery: Evidence of deep work in architecture, infra, scalability, performance, or frontend frameworks. Includes migrations, system design, low-level optimization, or platform work.

- **Quantified Impact**
  Data-Backed Results: Resume includes metrics — ARR impact, latency reduction, DAU, uptime, infra cost saved, funnel conversions. Vague "contributions" or "improved performance" get lower scores.

- **Skills Match**
  Tech Stack Overlap: How well the candidate's tools, languages, and platforms align with the JD. Check semantic and tool-level closeness, even if not 1:1 match.

- **Problem Solving**
  0-to-1 Thinking: Evidence of owning ambiguous problems, system design under tradeoffs, fixing bottlenecks, or proposing new solutions. Look for creative engineering beyond maintenance or feature factory work.

- **Ownership**
  End-to-End Delivery: Drove a project from design to deployment, ensured performance/monitoring, handled rollout. Distinguish leaders from contributors.

- **Career Growth**
  Trajectory Over Time: Promotions, increasing scope, or evolution in responsibilities (e.g., IC to Staff). Penalize stagnation or repetitive roles.

- **Context Matching**
  Relevance to Job Description: Do the candidate's most recent roles mirror the JD's key asks? Consider domain (fintech, ecommerce), stage (early vs scaled), and problem space.

For each category, provide:
- A score from 0 to 100.
- A detailed reason explaining your score, including evidence and specific examples from the resume.

In the end, attach a 2-3 line summary of all the category scoring reasons without revealing any of the category names.

# Output Format

Return ONLY a JSON object:
{
  "scores": [
    {"category": "Spark Factor", "score": 85, "reason": "IIT graduate, worked at Flipkart and Google — strong pedigree signal"},
    {"category": "Role Alignment", "score": 72, "reason": "Backend IC at B2B SaaS companies, good stage match but limited frontend exposure"},
    ...all 9 categories
  ],
  "summary": "2-3 line summary combining all reasons without mentioning category names"
}
"""


class JobMatcher:
    """
    Matches resumes against job descriptions using structured LLM-based scoring
    """
    
    def __init__(self, api_key: str, model_provider: str = 'openai', model_name: str = 'gpt-4o-mini'):
        self.api_key = api_key
        self.model_provider = model_provider
        self.model_name = model_name
        self.client = AsyncOpenAI(api_key=api_key)
        logger.info(f"JobMatcher initialized with model: {model_provider}:{model_name}")
    
    def calculate_final_score(self, llm_scores: list) -> float:
        """
        Takes LLM category scores (0-100 each) and weights,
        returns final score on 0-5 scale.
        
        Args:
            llm_scores: List of {"category": str, "score": int, "reason": str}
            
        Returns:
            Final score between 0-5
        """
        weighted_sum = 0
        for score_entry in llm_scores:
            category = score_entry['category']
            score = score_entry['score']
            weight = SCORING_WEIGHTS.get(category, 0)
            weighted_sum += (score * weight) / 100
        
        # Normalize: max possible weighted_sum is 100, divide by 20 to get 0-5 scale
        final_score = round(weighted_sum / 20, 1)
        return final_score
    
    def generate_insights(self, llm_scores: list, summary: str) -> list:
        """
        Generate match insights from top scoring categories
        
        Args:
            llm_scores: List of category scores
            summary: Overall summary from LLM
            
        Returns:
            List of 2-3 insight strings
        """
        # Sort by score and pick top 3 categories
        sorted_scores = sorted(llm_scores, key=lambda x: x['score'], reverse=True)
        insights = []
        
        for entry in sorted_scores[:3]:
            reason = entry['reason']
            # Clean up the reason to be concise recruiter-speak
            if len(reason) > 120:
                reason = reason[:117] + '...'
            insights.append(reason)
        
        return insights
    
    def score_to_ranking(self, score: float) -> str:
        """
        Convert 0-5 score to ranking category
        
        Args:
            score: Score between 0-5
            
        Returns:
            Ranking string: highly_recommended, good_fit, or needs_discussion
        """
        if score >= 4.4:
            return 'highly_recommended'
        elif score >= 4.0:
            return 'good_fit'
        elif score >= 3.5:
            return 'needs_discussion'
        else:
            return 'reject'
    
    async def score_single_job(self, resume_text: str, parsed_resume: dict, job_data: dict) -> Dict:
        """
        Score a single job using structured category evaluation
        
        Args:
            resume_text: Raw text from the resume
            parsed_resume: Structured resume data
            job_data: Job data from scraped JSON
            
        Returns:
            Dictionary with score, ranking, and insights
        """
        try:
            # Extract job details
            jd_text = job_data.get("jd", {}).get("raw_text", "")
            job_title = job_data.get("job", {}).get("title", "Unknown")
            company_name = job_data.get("company_name", "Unknown")
            
            # Create structured scoring prompt
            user_prompt = f"""
RESUME SUMMARY:
- Skills: {', '.join(parsed_resume.get('skills', [])[:10])}
- Experience: {len(parsed_resume.get('experience', []))} positions
- Education: {', '.join([e.get('degree', '') for e in parsed_resume.get('education', [])])}

FULL RESUME TEXT:
{resume_text[:3000]}

JOB DESCRIPTION:
Company: {company_name}
Title: {job_title}
{jd_text[:4000]}

Evaluate this candidate against the job using all 9 categories defined in your system prompt. Return structured JSON with category scores and reasons.
"""

            messages = [
                {"role": "system", "content": SCORING_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ]
            
            # Send message with retry logic - uses response_format for guaranteed JSON
            response = await call_openai_with_retry(self.client, messages, self.model_name, timeout=30)
            
            # Parse response (response_format ensures valid JSON, no regex needed)
            result = json.loads(response)
            
            # Validate response structure
            if 'scores' not in result:
                logger.error(f"Invalid response format for {company_name}: missing 'scores'")
                return None
            
            # Calculate final score from category scores
            llm_scores = result['scores']
            final_score = self.calculate_final_score(llm_scores)
            
            # Determine ranking
            ranking = self.score_to_ranking(final_score)
            
            # Generate insights from top categories
            summary = result.get('summary', '')
            insights = self.generate_insights(llm_scores, summary)
            
            # Format company logo URL
            logo_path = job_data.get("company_logo_url", "")
            if logo_path and not logo_path.startswith("http"):
                logo_url = f"https://nextdoor.company{logo_path}"
            else:
                logo_url = logo_path
            
            # Get company initials for fallback
            company_initials = ''.join([word[0].upper() for word in company_name.split()[:2]])
            
            return {
                "company_name": company_name,
                "company_slug": job_data.get("company_slug", ""),
                "company_logo_url": logo_url,
                "companyInitials": company_initials,
                "title": job_data.get("job", {}).get("title", ""),
                "apply_url": job_data.get("job", {}).get("apply_url", ""),
                "location": job_data.get("job", {}).get("location_display", ""),
                "departments": job_data.get("job", {}).get("role_department", "Engineering").title(),
                "ranking": ranking,
                "score": final_score,
                "match_insights": insights
            }
            
        except Exception as e:
            logger.error(f"Error scoring job {job_data.get('company_name')}: {e}")
            return None
    
    async def match_resume_to_jobs(self, resume_text: str, parsed_resume: dict, jobs: List[Dict]) -> List[Dict]:
        """
        Match resume against multiple jobs in parallel batches
        
        Args:
            resume_text: Raw text from resume
            parsed_resume: Structured resume data
            jobs: List of job data dictionaries
            
        Returns:
            List of matched jobs with scores and insights, sorted by score
        """
        BATCH_SIZE = 10
        all_results = []
        
        logger.info(f"Matching resume against {len(jobs)} jobs in batches of {BATCH_SIZE}...")
        
        # Process jobs in parallel batches
        for i in range(0, len(jobs), BATCH_SIZE):
            batch = jobs[i:i + BATCH_SIZE]
            batch_num = (i // BATCH_SIZE) + 1
            total_batches = (len(jobs) + BATCH_SIZE - 1) // BATCH_SIZE
            
            logger.info(f"Processing batch {batch_num}/{total_batches} ({len(batch)} jobs)...")
            
            # Create tasks for parallel execution
            tasks = [
                self.score_single_job(resume_text, parsed_resume, job)
                for job in batch
            ]
            
            # Execute batch in parallel
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for job, result in zip(batch, batch_results):
                if isinstance(result, Exception):
                    logger.error(f"Error matching {job.get('company_name')}: {result}")
                    continue
                
                if result is None:
                    continue
                
                score = result.get('score', 0)
                ranking = result.get('ranking', 'reject')
                
                # Only include matches with score >= 3.5 (not rejected)
                if ranking != 'reject':
                    all_results.append(result)
                    logger.info(f"  {result['company_name']} - {result['title']}: {score}/5.0 ({ranking})")
                else:
                    logger.info(f"  {job.get('company_name')}: {score}/5.0 (rejected - below 3.5)")
        
        # Sort by score descending and return top 10
        all_results.sort(key=lambda x: x['score'], reverse=True)
        top_matches = all_results[:10]
        
        logger.info(f"Returning {len(top_matches)} top matches out of {len(all_results)} total matches")
        
        return top_matches
