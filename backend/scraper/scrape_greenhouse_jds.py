#!/usr/bin/env python3
"""
Greenhouse Job Description Scraper
Scrapes full job descriptions from Greenhouse job boards using Playwright
"""

import asyncio
import json
import logging
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
from urllib.parse import urlparse

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Paths
ROOT_DIR = Path(__file__).parent.parent.parent
SEED_FILE = ROOT_DIR / "data" / "seed-jobs.json"
OUTPUT_DIR = ROOT_DIR / "data" / "scraped-jobs"

# Scraping config
REQUEST_TIMEOUT = 15000  # 15 seconds
RATE_LIMIT_DELAY = 2  # 2 seconds between requests


def extract_job_id(url: str) -> str:
    """Extract job ID from Greenhouse URL"""
    # Pattern: https://job-boards.greenhouse.io/{company}/jobs/{id}
    match = re.search(r'/jobs/(\d+)', url)
    return match.group(1) if match else "unknown"


def clean_text(text: str) -> str:
    """Clean and normalize text"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove zero-width spaces and other invisible characters
    text = re.sub(r'[\u200b-\u200f\u2028-\u202f\u3000]', '', text)
    return text.strip()


def extract_sections(raw_text: str) -> Dict[str, any]:
    """
    Parse job description into structured sections
    This is a heuristic approach - may need refinement per job board
    """
    sections = {
        "about": None,
        "responsibilities": [],
        "requirements": [],
        "nice_to_have": [],
        "tech_stack": [],
        "benefits": []
    }
    
    # Common tech keywords to extract
    tech_keywords = [
        'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'Ruby',
        'React', 'Vue', 'Angular', 'Node.js', 'Django', 'FastAPI', 'Flask',
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
        'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
        'Git', 'CI/CD', 'GraphQL', 'REST', 'gRPC'
    ]
    
    # Extract tech stack mentions
    for tech in tech_keywords:
        if re.search(rf'\b{re.escape(tech)}\b', raw_text, re.IGNORECASE):
            sections["tech_stack"].append(tech)
    
    # Split by common section headers (case-insensitive)
    text_lower = raw_text.lower()
    
    # Find responsibilities section
    resp_match = re.search(
        r'(?:responsibilities|what you\'ll do|your role|you will)[\s:]*(.{0,1000}?)(?=\n\n|requirements|qualifications|what we|$)',
        raw_text,
        re.IGNORECASE | re.DOTALL
    )
    if resp_match:
        resp_text = resp_match.group(1)
        # Split into bullet points
        responsibilities = re.findall(r'[•\-\*]\s*(.+?)(?=[•\-\*]|$)', resp_text)
        sections["responsibilities"] = [clean_text(r) for r in responsibilities if r.strip()]
    
    # Find requirements section
    req_match = re.search(
        r'(?:requirements|qualifications|what we\'re looking for|ideal candidate)[\s:]*(.{0,1000}?)(?=\n\n|nice to have|benefits|$)',
        raw_text,
        re.IGNORECASE | re.DOTALL
    )
    if req_match:
        req_text = req_match.group(1)
        requirements = re.findall(r'[•\-\*]\s*(.+?)(?=[•\-\*]|$)', req_text)
        sections["requirements"] = [clean_text(r) for r in requirements if r.strip()]
    
    # Find nice-to-have section
    nice_match = re.search(
        r'(?:nice to have|bonus|preferred|plus)[\s:]*(.{0,500}?)(?=\n\n|benefits|$)',
        raw_text,
        re.IGNORECASE | re.DOTALL
    )
    if nice_match:
        nice_text = nice_match.group(1)
        nice_to_have = re.findall(r'[•\-\*]\s*(.+?)(?=[•\-\*]|$)', nice_text)
        sections["nice_to_have"] = [clean_text(n) for n in nice_to_have if n.strip()]
    
    # Find benefits section
    benefits_match = re.search(
        r'(?:benefits|perks|what we offer|why join)[\s:]*(.{0,500}?)(?=\n\n|$)',
        raw_text,
        re.IGNORECASE | re.DOTALL
    )
    if benefits_match:
        benefits_text = benefits_match.group(1)
        benefits = re.findall(r'[•\-\*]\s*(.+?)(?=[•\-\*]|$)', benefits_text)
        sections["benefits"] = [clean_text(b) for b in benefits if b.strip()]
    
    return sections


async def scrape_job_description(page, job_data: Dict) -> Dict:
    """
    Scrape a single job description from Greenhouse
    """
    apply_url = job_data["apply_url"]
    company_slug = job_data["company_slug"]
    job_id = extract_job_id(apply_url)
    
    logger.info(f"Scraping {company_slug}/{job_id}: {job_data['title']}")
    
    result = {
        "company_name": job_data["company_name"],
        "company_slug": company_slug,
        "company_logo_url": job_data["company_logo_url"],
        "job": {
            "title": job_data["title"],
            "apply_url": apply_url,
            "location_display": job_data["location_display"],
            "work_mode": job_data["work_mode"],
            "role_department": job_data["role_department"],
            "posted_date": job_data["posted_date"]
        },
        "jd": {
            "raw_text": "",
            "sections": {}
        },
        "scrape_metadata": {
            "scraped_at": datetime.utcnow().isoformat() + "Z",
            "success": False,
            "error": None
        }
    }
    
    try:
        # Navigate to the job page
        await page.goto(apply_url, timeout=REQUEST_TIMEOUT, wait_until="domcontentloaded")
        
        # Wait for content to load - try multiple possible selectors
        selectors = [
            "#content",
            ".content",
            "[data-testid='job-description']",
            ".job-description",
            "#main-content"
        ]
        
        content_loaded = False
        for selector in selectors:
            try:
                await page.wait_for_selector(selector, timeout=5000)
                content_loaded = True
                break
            except PlaywrightTimeoutError:
                continue
        
        if not content_loaded:
            logger.warning(f"No content selector found for {apply_url}, trying to extract anyway")
        
        # Extract the job description text
        # Try to get the main content area
        try:
            content = await page.locator("#content, .content, #main-content").first.inner_text()
        except:
            # Fallback: get body text
            content = await page.inner_text("body")
        
        raw_text = clean_text(content)
        
        if len(raw_text) < 100:
            raise Exception("Job description too short - page may not have loaded correctly")
        
        # Extract structured sections
        sections = extract_sections(raw_text)
        
        result["jd"]["raw_text"] = raw_text
        result["jd"]["sections"] = sections
        result["scrape_metadata"]["success"] = True
        
        logger.info(f"✓ Successfully scraped {company_slug}/{job_id} ({len(raw_text)} chars)")
        
    except PlaywrightTimeoutError as e:
        error_msg = f"Timeout after {REQUEST_TIMEOUT}ms"
        result["scrape_metadata"]["error"] = error_msg
        logger.error(f"✗ {company_slug}/{job_id}: {error_msg}")
        
    except Exception as e:
        error_msg = str(e)
        result["scrape_metadata"]["error"] = error_msg
        logger.error(f"✗ {company_slug}/{job_id}: {error_msg}")
    
    return result, job_id


async def scrape_all_jobs():
    """
    Main scraper function - processes all jobs from seed file
    """
    # Load seed jobs
    logger.info(f"Loading seed jobs from {SEED_FILE}")
    with open(SEED_FILE, 'r') as f:
        seed_jobs = json.load(f)
    
    logger.info(f"Found {len(seed_jobs)} jobs to scrape")
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Launch browser
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
        page = await context.new_page()
        
        successes = 0
        failures = 0
        
        for idx, job_data in enumerate(seed_jobs, 1):
            logger.info(f"\n[{idx}/{len(seed_jobs)}] Processing job...")
            
            # Scrape the job
            result, job_id = await scrape_job_description(page, job_data)
            
            # Save to file
            output_filename = f"{job_data['company_slug']}_{job_id}.json"
            output_path = OUTPUT_DIR / output_filename
            
            with open(output_path, 'w') as f:
                json.dump(result, f, indent=2)
            
            if result["scrape_metadata"]["success"]:
                successes += 1
            else:
                failures += 1
            
            # Rate limiting (except for last job)
            if idx < len(seed_jobs):
                await asyncio.sleep(RATE_LIMIT_DELAY)
        
        await browser.close()
    
    # Summary
    logger.info("\n" + "="*60)
    logger.info("SCRAPING COMPLETE")
    logger.info("="*60)
    logger.info(f"Total jobs: {len(seed_jobs)}")
    logger.info(f"Successes: {successes}")
    logger.info(f"Failures: {failures}")
    logger.info(f"Success rate: {(successes/len(seed_jobs)*100):.1f}%")
    logger.info(f"Output directory: {OUTPUT_DIR}")
    logger.info("="*60)


if __name__ == "__main__":
    asyncio.run(scrape_all_jobs())
