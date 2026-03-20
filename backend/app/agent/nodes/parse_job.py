"""Parse job posting node - extracts structured data from job description."""

import json
import time

from app.agent.state import AgentState
from app.agent.tools.keyword_extractor import extract_keywords
from app.llm.router import ModelRouter

PARSE_JOB_PROMPT = """Analyze the following job posting and extract structured information.
Return a JSON object with these fields:
- title: Job title
- company: Company name
- location: Job location
- type: Job type (full-time, part-time, contract, etc.)
- experience_level: Required experience level (junior, mid, senior, lead, etc.)
- required_skills: List of required skills/technologies
- preferred_skills: List of preferred/nice-to-have skills
- responsibilities: List of key responsibilities
- requirements: List of requirements (education, certifications, etc.)
- salary_range: Salary range if mentioned, null otherwise
- summary: Brief 2-3 sentence summary of the role

Return ONLY valid JSON, no other text.

Job Posting:
{job_description}"""


async def parse_job(state: AgentState) -> dict:
    """Extract structured data from job posting using LLM."""
    start = time.time()

    router = ModelRouter()
    job_desc = state["job_description"]

    # Use LLM to parse job posting
    messages = [
        {"role": "system", "content": "You are a job posting analyzer. Return only valid JSON."},
        {"role": "user", "content": PARSE_JOB_PROMPT.format(job_description=job_desc)},
    ]

    response = await router.invoke("parse_job", messages, temperature=0.1)

    # Parse JSON response
    try:
        parsed = json.loads(response)
    except json.JSONDecodeError:
        # Try to extract JSON from response
        start_idx = response.find("{")
        end_idx = response.rfind("}") + 1
        if start_idx != -1 and end_idx > start_idx:
            parsed = json.loads(response[start_idx:end_idx])
        else:
            parsed = {"raw_response": response, "error": "Failed to parse JSON"}

    # Extract keywords
    keywords = extract_keywords(job_desc)

    duration_ms = int((time.time() - start) * 1000)

    return {
        "parsed_job": parsed,
        "job_keywords": keywords,
        "current_step": "parse_job",
        "steps_log": state.get("steps_log", []) + [
            {
                "step": "parse_job",
                "status": "completed",
                "duration_ms": duration_ms,
                "output_summary": f"Extracted {len(parsed.get('required_skills', []))} required skills",
            }
        ],
    }
