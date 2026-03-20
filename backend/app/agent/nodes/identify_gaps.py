"""Identify gaps node - finds missing skills and improvement areas."""

import json
import time

from app.agent.state import AgentState
from app.llm.router import ModelRouter

GAPS_PROMPT = """You are a career advisor analyzing the gap between a job posting and a candidate's CV.

Job Posting (parsed):
{parsed_job}

CV (parsed):
{parsed_cv}

Match Result:
{match_result}

Identify ALL gaps and provide actionable improvement suggestions.
Return a JSON object with:
- critical_gaps: List of objects with {{skill, importance (critical/high/medium), suggestion}}
- experience_gaps: List of objects with {{area, current_level, required_level, suggestion}}
- education_gaps: List of objects with {{requirement, status (met/partial/unmet), suggestion}}
- quick_wins: List of things the candidate could add/improve quickly (courses, certs, projects)
- long_term_improvements: List of skills/experiences that would take longer to develop
- cv_formatting_tips: List of specific CV formatting improvements

Return ONLY valid JSON."""


async def identify_gaps(state: AgentState) -> dict:
    """Identify gaps between job requirements and CV."""
    start = time.time()

    router = ModelRouter()

    messages = [
        {"role": "system", "content": "You are an expert career advisor. Return only valid JSON."},
        {
            "role": "user",
            "content": GAPS_PROMPT.format(
                parsed_job=json.dumps(state.get("parsed_job", {}), indent=2),
                parsed_cv=json.dumps(state.get("parsed_cv", {}), indent=2),
                match_result=json.dumps(state.get("match_result", {}), indent=2),
            ),
        },
    ]

    response = await router.invoke("identify_gaps", messages, temperature=0.3)

    try:
        gap_analysis = json.loads(response)
    except json.JSONDecodeError:
        start_idx = response.find("{")
        end_idx = response.rfind("}") + 1
        if start_idx != -1 and end_idx > start_idx:
            gap_analysis = json.loads(response[start_idx:end_idx])
        else:
            gap_analysis = {"error": "Failed to parse gap analysis"}

    duration_ms = int((time.time() - start) * 1000)

    return {
        "gap_analysis": gap_analysis,
        "current_step": "identify_gaps",
        "steps_log": state.get("steps_log", []) + [
            {
                "step": "identify_gaps",
                "status": "completed",
                "duration_ms": duration_ms,
                "output_summary": f"Found {len(gap_analysis.get('critical_gaps', []))} critical gaps",
            }
        ],
    }
