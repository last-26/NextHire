"""Settings API — returns current LLM configuration and tests connectivity."""

import time

from fastapi import APIRouter

from app.config import settings
from app.llm.router import ModelRouter

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
