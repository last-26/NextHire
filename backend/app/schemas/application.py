from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ApplicationCreate(BaseModel):
    company_name: str
    position_title: str
    job_url: str | None = None
    status: str = "wishlist"
    priority: str = "medium"
    notes: str | None = None
    match_score: float | None = None
    analysis_id: UUID | None = None
    cover_letter_id: UUID | None = None


class ApplicationUpdate(BaseModel):
    company_name: str | None = None
    position_title: str | None = None
    job_url: str | None = None
    status: str | None = None
    priority: str | None = None
    notes: str | None = None
    match_score: float | None = None
    applied_at: datetime | None = None


class ApplicationResponse(BaseModel):
    id: UUID
    company_name: str
    position_title: str
    job_url: str | None
    status: str
    priority: str
    notes: str | None
    match_score: float | None
    analysis_id: UUID | None
    cover_letter_id: UUID | None
    applied_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
