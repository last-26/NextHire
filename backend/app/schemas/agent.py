from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AgentRunResponse(BaseModel):
    id: UUID
    status: str
    steps: list | dict
    total_tokens_used: int
    total_cost_usd: float
    started_at: datetime
    completed_at: datetime | None
    error_message: str | None

    model_config = {"from_attributes": True}


class AgentStreamEvent(BaseModel):
    step: str
    status: str
    message: str | None = None
    duration_ms: int | None = None
    output: dict | None = None
