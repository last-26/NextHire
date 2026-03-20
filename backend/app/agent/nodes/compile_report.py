"""Compile report node - assembles the final structured output."""

import time

from app.agent.state import AgentState


async def compile_report(state: AgentState) -> dict:
    """Compile all results into a final report."""
    start = time.time()

    report = {
        "job_analysis": {
            "parsed_job": state.get("parsed_job", {}),
            "job_keywords": state.get("job_keywords", []),
        },
        "cv_analysis": {
            "parsed_cv": state.get("parsed_cv", {}),
            "cv_keywords": state.get("cv_keywords", []),
        },
        "match_analysis": {
            "match_result": state.get("match_result", {}),
            "overall_score": state.get("overall_score", 0),
        },
        "gap_analysis": state.get("gap_analysis", {}),
        "cover_letter": state.get("cover_letter", ""),
        "quality_check": state.get("reflection", {}),
        "execution": {
            "steps": state.get("steps_log", []),
            "total_steps": len(state.get("steps_log", [])),
        },
    }

    duration_ms = int((time.time() - start) * 1000)

    return {
        "current_step": "compile_report",
        "steps_log": state.get("steps_log", []) + [
            {
                "step": "compile_report",
                "status": "completed",
                "duration_ms": duration_ms,
                "output_summary": "Final report compiled",
            }
        ],
    }
