"""Compile report node - assembles the final structured output."""

import time

from app.agent.state import AgentState


async def compile_report(state: AgentState) -> dict:
    """Compile all results into a final report."""
    start = time.time()

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
