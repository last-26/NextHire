from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.models.application import Application
from app.models.cover_letter import CoverLetter
from app.models.job_analysis import JobAnalysis
from app.schemas.job_analysis import JobAnalysisResponse

router = APIRouter()


@router.get("/dashboard/stats")
async def get_dashboard_stats(session: AsyncSession = Depends(get_session)):
    """Get summary statistics for the dashboard."""
    analyses_count = await session.scalar(select(func.count(JobAnalysis.id)))
    applications_count = await session.scalar(select(func.count(Application.id)))
    cover_letters_count = await session.scalar(select(func.count(CoverLetter.id)))
    cvs_count = await session.scalar(
        select(func.count(func.distinct(JobAnalysis.cv_filename))).where(
            JobAnalysis.cv_filename.is_not(None)
        )
    )
    avg_score = await session.scalar(
        select(func.avg(JobAnalysis.overall_score)).where(
            JobAnalysis.overall_score.is_not(None)
        )
    )

    return {
        "analyses_count": analyses_count or 0,
        "applications_count": applications_count or 0,
        "cover_letters_count": cover_letters_count or 0,
        "cvs_parsed_count": cvs_count or 0,
        "avg_score": round(avg_score, 1) if avg_score else 0,
    }


@router.get("/dashboard/recent-analyses", response_model=list[JobAnalysisResponse])
async def get_recent_analyses(
    limit: int = 10,
    session: AsyncSession = Depends(get_session),
):
    """Get recent analyses for the dashboard."""
    result = await session.execute(
        select(JobAnalysis)
        .where(JobAnalysis.overall_score.is_not(None))
        .order_by(JobAnalysis.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()
