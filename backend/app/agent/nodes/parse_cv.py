"""Parse CV node - extracts structured data from CV content."""

import json
import time

from app.agent.state import AgentState
from app.agent.tools.keyword_extractor import extract_keywords
from app.llm.router import ModelRouter

PARSE_CV_PROMPT = """Analyze the following CV/resume and extract structured information.
Return a JSON object with these fields:
- name: Candidate's full name
- email: Email if present, null otherwise
- phone: Phone if present, null otherwise
- location: Location if present, null otherwise
- summary: Professional summary/objective
- skills: List of all skills/technologies mentioned
- experience: List of work experiences, each with: company, title, duration, highlights
- education: List of education entries, each with: institution, degree, field, year
- certifications: List of certifications if any
- languages: List of languages if mentioned
- total_years_experience: Estimated total years of experience

Return ONLY valid JSON, no other text.

CV Content:
{cv_content}"""


async def parse_cv(state: AgentState) -> dict:
    """Extract structured data from CV using LLM."""
    start = time.time()

    router = ModelRouter()
    cv_text = state["cv_content"]

    messages = [
        {"role": "system", "content": "You are a CV/resume analyzer. Return only valid JSON."},
        {"role": "user", "content": PARSE_CV_PROMPT.format(cv_content=cv_text)},
    ]

    response = await router.invoke("parse_cv", messages, temperature=0.1)

    try:
        parsed = json.loads(response)
    except json.JSONDecodeError:
        start_idx = response.find("{")
        end_idx = response.rfind("}") + 1
        if start_idx != -1 and end_idx > start_idx:
            parsed = json.loads(response[start_idx:end_idx])
        else:
            parsed = {"raw_response": response, "error": "Failed to parse JSON"}

    keywords = extract_keywords(cv_text)

    duration_ms = int((time.time() - start) * 1000)

    return {
        "parsed_cv": parsed,
        "cv_keywords": keywords,
        "current_step": "parse_cv",
        "steps_log": state.get("steps_log", []) + [
            {
                "step": "parse_cv",
                "status": "completed",
                "duration_ms": duration_ms,
                "output_summary": f"Extracted {len(parsed.get('skills', []))} skills",
            }
        ],
    }
