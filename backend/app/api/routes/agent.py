from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.api.deps import get_session
from app.models.agent_run import AgentRun
from app.schemas.agent import AgentRunResponse

router = APIRouter()


@router.get("/agent/runs/{run_id}", response_model=AgentRunResponse)
async def get_agent_run(
    run_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get agent run status and results."""
    agent_run = await session.get(AgentRun, run_id)
    if not agent_run:
        raise HTTPException(status_code=404, detail="Agent run not found")
    return agent_run


@router.get("/agent/stream/{run_id}")
async def stream_agent_run(run_id: UUID):
    """Stream agent execution steps via SSE."""

    async def event_generator():
        # TODO: Connect to actual agent execution
        yield {
            "event": "status",
            "data": f'{{"run_id": "{run_id}", "status": "pending"}}',
        }

    return EventSourceResponse(event_generator())
