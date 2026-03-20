"""Generate cover letter node - creates a personalized cover letter."""

import time

from app.agent.state import AgentState
from app.llm.router import ModelRouter

COVER_LETTER_PROMPT = """Write a personalized cover letter for the following job application.

Job Details:
- Title: {job_title}
- Company: {company}
- Key Requirements: {requirements}

Candidate Profile:
- Name: {candidate_name}
- Key Skills: {skills}
- Experience Summary: {experience}

Match Strengths: {strengths}
Areas to Address: {gaps}

Tone: {tone}

Guidelines:
1. Open with a compelling hook that shows genuine interest in the role
2. Highlight 2-3 specific experiences that directly match key requirements
3. Acknowledge any gaps honestly but frame them positively (eagerness to learn, transferable skills)
4. Show knowledge of the company/role
5. Close with a clear call to action
6. Keep it concise (3-4 paragraphs, under 400 words)
7. Use natural language, avoid generic phrases like "I am writing to apply for..."

Write ONLY the cover letter text, no metadata or labels."""


async def generate_cover_letter(state: AgentState) -> dict:
    """Generate a personalized cover letter."""
    start = time.time()

    router = ModelRouter()
    parsed_job = state.get("parsed_job", {})
    parsed_cv = state.get("parsed_cv", {})
    match_result = state.get("match_result", {})
    gap_analysis = state.get("gap_analysis", {})

    # Extract relevant info
    strengths = match_result.get("llm_analysis", {}).get("strengths", [])
    critical_gaps = gap_analysis.get("critical_gaps", [])

    messages = [
        {
            "role": "system",
            "content": "You are an expert cover letter writer. Write compelling, personalized cover letters.",
        },
        {
            "role": "user",
            "content": COVER_LETTER_PROMPT.format(
                job_title=parsed_job.get("title", "the position"),
                company=parsed_job.get("company", "the company"),
                requirements=", ".join(parsed_job.get("required_skills", [])[:10]),
                candidate_name=parsed_cv.get("name", "the candidate"),
                skills=", ".join(parsed_cv.get("skills", [])[:10]),
                experience=parsed_cv.get("summary", ""),
                strengths=", ".join(strengths[:5]) if isinstance(strengths, list) else str(strengths),
                gaps=", ".join(g.get("skill", "") for g in critical_gaps[:3]),
                tone=state.get("cover_letter_tone", "professional"),
            ),
        },
    ]

    cover_letter = await router.invoke(
        "generate_cover_letter", messages, temperature=0.7, max_tokens=2048
    )

    duration_ms = int((time.time() - start) * 1000)

    return {
        "cover_letter": cover_letter.strip(),
        "current_step": "generate_cover_letter",
        "steps_log": state.get("steps_log", []) + [
            {
                "step": "generate_cover_letter",
                "status": "completed",
                "duration_ms": duration_ms,
                "output_summary": f"Generated {len(cover_letter.split())} word cover letter",
            }
        ],
    }
