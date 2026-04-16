"""
Job Data Loader Utility
Loads scraped job descriptions from the data directory
"""

import json
import logging
from pathlib import Path
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# Path to scraped jobs directory
ROOT_DIR = Path(__file__).parent.parent.parent
SCRAPED_JOBS_DIR = ROOT_DIR / "data" / "scraped-jobs"


def load_all_jobs(only_successful: bool = True) -> List[Dict]:
    """
    Load all scraped job descriptions from the data directory
    
    Args:
        only_successful: If True, only return jobs that were successfully scraped
        
    Returns:
        List of job data dictionaries
    """
    if not SCRAPED_JOBS_DIR.exists():
        logger.warning(f"Scraped jobs directory does not exist: {SCRAPED_JOBS_DIR}")
        return []
    
    jobs = []
    job_files = list(SCRAPED_JOBS_DIR.glob("*.json"))
    
    logger.info(f"Found {len(job_files)} job files in {SCRAPED_JOBS_DIR}")
    
    for job_file in job_files:
        try:
            with open(job_file, 'r') as f:
                job_data = json.load(f)
            
            # Filter by success status if requested
            if only_successful and not job_data.get("scrape_metadata", {}).get("success", False):
                continue
            
            jobs.append(job_data)
            
        except Exception as e:
            logger.error(f"Error loading job file {job_file}: {e}")
            continue
    
    logger.info(f"Loaded {len(jobs)} jobs successfully")
    return jobs


def get_job_by_company_and_id(company_slug: str, job_id: str) -> Optional[Dict]:
    """
    Load a specific job by company slug and job ID
    
    Args:
        company_slug: Company slug (e.g., 'emergent')
        job_id: Job ID (e.g., '4111446009')
        
    Returns:
        Job data dictionary or None if not found
    """
    job_file = SCRAPED_JOBS_DIR / f"{company_slug}_{job_id}.json"
    
    if not job_file.exists():
        logger.warning(f"Job file not found: {job_file}")
        return None
    
    try:
        with open(job_file, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading job file {job_file}: {e}")
        return None


def get_jobs_summary() -> Dict:
    """
    Get summary statistics about scraped jobs
    
    Returns:
        Dictionary with stats: total, successful, failed, by_company, etc.
    """
    all_jobs = []
    job_files = list(SCRAPED_JOBS_DIR.glob("*.json"))
    
    for job_file in job_files:
        try:
            with open(job_file, 'r') as f:
                all_jobs.append(json.load(f))
        except:
            continue
    
    successful = [j for j in all_jobs if j.get("scrape_metadata", {}).get("success", False)]
    failed = [j for j in all_jobs if not j.get("scrape_metadata", {}).get("success", False)]
    
    # Count by company
    by_company = {}
    for job in successful:
        company = job.get("company_name", "Unknown")
        by_company[company] = by_company.get(company, 0) + 1
    
    return {
        "total": len(all_jobs),
        "successful": len(successful),
        "failed": len(failed),
        "success_rate": f"{(len(successful)/len(all_jobs)*100):.1f}%" if all_jobs else "0%",
        "by_company": by_company,
        "companies_count": len(by_company)
    }


if __name__ == "__main__":
    # Test the loader
    logging.basicConfig(level=logging.INFO)
    
    print("Loading all jobs...")
    jobs = load_all_jobs()
    print(f"Loaded {len(jobs)} jobs\n")
    
    print("Summary:")
    summary = get_jobs_summary()
    for key, value in summary.items():
        print(f"  {key}: {value}")
