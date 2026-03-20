import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class JobAnalysis(Base):
    __tablename__ = "job_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    job_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)
    job_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    parsed_job: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    parsed_cv: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    match_result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    gap_analysis: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    cv_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    agent_run_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("agent_runs.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
