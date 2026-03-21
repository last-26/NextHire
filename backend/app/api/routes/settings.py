"""Settings API — returns current LLM configuration and tests connectivity."""

import time

from fastapi import APIRouter, Depends
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.config import settings
from app.llm.router import ModelRouter
from app.models.agent_run import AgentRun
from app.models.application import Application
from app.models.cover_letter import CoverLetter
from app.models.job_analysis import JobAnalysis

router = APIRouter()


@router.get("/settings")
async def get_settings():
    """Return current LLM provider configuration (no secrets)."""
    return {
        "provider": settings.LLM_PROVIDER,
        "region": settings.AWS_DEFAULT_REGION,
        "fast_model": settings.LLM_FAST_MODEL,
        "power_model": settings.LLM_POWER_MODEL,
        "aws_configured": bool(settings.AWS_ACCESS_KEY_ID),
    }


@router.post("/settings/test-connection")
async def test_connection():
    """Test connectivity to the configured LLM provider."""
    router_inst = ModelRouter()
    results = {}

    # Test fast model
    try:
        start = time.time()
        response = await router_inst.provider.invoke(
            messages=[{"role": "user", "content": "Reply with only: OK"}],
            model=settings.LLM_FAST_MODEL,
            max_tokens=10,
            temperature=0,
        )
        latency_ms = int((time.time() - start) * 1000)
        results["fast_model"] = {
            "status": "connected",
            "model": settings.LLM_FAST_MODEL,
            "latency_ms": latency_ms,
            "response": response.strip()[:50],
        }
    except Exception as e:
        results["fast_model"] = {
            "status": "error",
            "model": settings.LLM_FAST_MODEL,
            "error": str(e),
        }

    # Test power model
    try:
        start = time.time()
        response = await router_inst.provider.invoke(
            messages=[{"role": "user", "content": "Reply with only: OK"}],
            model=settings.LLM_POWER_MODEL,
            max_tokens=10,
            temperature=0,
        )
        latency_ms = int((time.time() - start) * 1000)
        results["power_model"] = {
            "status": "connected",
            "model": settings.LLM_POWER_MODEL,
            "latency_ms": latency_ms,
            "response": response.strip()[:50],
        }
    except Exception as e:
        results["power_model"] = {
            "status": "error",
            "model": settings.LLM_POWER_MODEL,
            "error": str(e),
        }

    return results


@router.get("/settings/db-stats")
async def get_db_stats(session: AsyncSession = Depends(get_session)):
    """Return counts for each table."""
    analyses = await session.scalar(select(func.count()).select_from(JobAnalysis))
    applications = await session.scalar(select(func.count()).select_from(Application))
    cover_letters = await session.scalar(select(func.count()).select_from(CoverLetter))
    agent_runs = await session.scalar(select(func.count()).select_from(AgentRun))
    return {
        "analyses": analyses or 0,
        "applications": applications or 0,
        "cover_letters": cover_letters or 0,
        "agent_runs": agent_runs or 0,
    }


@router.delete("/settings/reset-db")
async def reset_database(session: AsyncSession = Depends(get_session)):
    """Delete all data from application tables (analyses, applications, cover letters, agent runs)."""
    # Order matters due to foreign keys
    await session.execute(delete(Application))
    await session.execute(delete(CoverLetter))
    await session.execute(delete(JobAnalysis))
    await session.execute(delete(AgentRun))
    await session.commit()
    return {"status": "ok", "message": "All data cleared"}
