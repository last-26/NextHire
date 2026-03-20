"""Reflect node - self-evaluation and quality gate for cover letter."""

import json
import time

from app.agent.state import AgentState
from app.llm.router import ModelRouter

REFLECT_PROMPT = """You are a quality reviewer for cover letters. Evaluate the following cover letter
against the job requirements and candidate profile.

Cover Letter:
{cover_letter}

Job Title: {job_title}
Company: {company}
Key Requirements: {requirements}
Candidate Skills: {skills}

Score the cover letter on these criteria (each 1-10):
1. relevance: How well it addresses the specific job requirements
2. personalization: How personalized it is (vs generic)
3. tone: How appropriate the tone is
4. structure: How well organized and flowing
5. impact: How compelling and memorable

Return a JSON object with:
- scores: Object with each criterion score (1-10)
- overall_score: Average score (1-10)
- passed: Boolean (true if overall_score >= 7)
- feedback: Specific feedback for improvement if score < 7
- suggestions: List of specific improvement suggestions

Return ONLY valid JSON."""

MAX_RETRIES = 2


async def reflect(state: AgentState) -> dict:
    """Evaluate cover letter quality and decide whether to retry."""
    start = time.time()

    router = ModelRouter()
    parsed_job = state.get("parsed_job", {})
    parsed_cv = state.get("parsed_cv", {})

    messages = [
        {
            "role": "system",
            "content": "You are a quality reviewer. Return only valid JSON.",
        },
        {
            "role": "user",
            "content": REFLECT_PROMPT.format(
                cover_letter=state.get("cover_letter", ""),
                job_title=parsed_job.get("title", ""),
                company=parsed_job.get("company", ""),
                requirements=", ".join(parsed_job.get("required_skills", [])[:10]),
                skills=", ".join(parsed_cv.get("skills", [])[:10]),
            ),
        },
    ]

    response = await router.invoke("reflect", messages, temperature=0.2)

    try:
        reflection = json.loads(response)
    except json.JSONDecodeError:
        start_idx = response.find("{")
        end_idx = response.rfind("}") + 1
        if start_idx != -1 and end_idx > start_idx:
            reflection = json.loads(response[start_idx:end_idx])
        else:
            reflection = {"overall_score": 7, "passed": True, "error": "Failed to parse"}

    duration_ms = int((time.time() - start) * 1000)
    reflection_count = state.get("reflection_count", 0) + 1

    return {
        "reflection": reflection,
        "reflection_count": reflection_count,
        "current_step": "reflect",
        "steps_log": state.get("steps_log", []) + [
            {
                "step": "reflect",
                "status": "completed",
                "duration_ms": duration_ms,
                "output_summary": (
                    f"Quality score: {reflection.get('overall_score', 'N/A')}/10 "
                    f"({'PASSED' if reflection.get('passed') else 'NEEDS RETRY'})"
                ),
            }
        ],
    }


def should_retry(state: AgentState) -> str:
    """Conditional edge: decide whether to retry cover letter generation."""
    reflection = state.get("reflection", {})
    count = state.get("reflection_count", 0)

    if reflection.get("passed", True) or count >= MAX_RETRIES:
        return "compile"
    return "retry"
