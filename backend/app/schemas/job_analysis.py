from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class JobAnalysisResponse(BaseModel):
    id: UUID
    job_title: str | None
    company_name: str | None
    job_description: str
    job_url: str | None
    parsed_job: dict | None
    parsed_cv: dict | None
    match_result: dict | None
    gap_analysis: dict | None
    overall_score: float | None
    cv_filename: str | None
    agent_run_id: UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}
