"""Agent state schema for the LangGraph pipeline."""

from typing import TypedDict


class AgentState(TypedDict, total=False):
    """State that flows through the agent graph."""

    # Inputs
    job_description: str
    job_url: str | None
    cv_content: str
    cv_filename: str

    # Parsed data
    parsed_job: dict
    parsed_cv: dict
    job_keywords: list[dict]
    cv_keywords: list[dict]

    # Analysis results
    match_result: dict
    gap_analysis: dict
    overall_score: float

    # Cover letter
    cover_letter: str
    cover_letter_tone: str

    # Reflection
    reflection: dict
    reflection_count: int

    # Agent execution metadata
    agent_run_id: str
    current_step: str
    steps_log: list[dict]
    error: str | None
