from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CoverLetterCreate(BaseModel):
    analysis_id: UUID | None = None
    content: str
    tone: str = "professional"


class CoverLetterResponse(BaseModel):
    id: UUID
    analysis_id: UUID | None
    content: str
    tone: str
    version: int
    is_edited: bool
    created_at: datetime

    model_config = {"from_attributes": True}
