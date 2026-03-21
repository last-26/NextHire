
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.schemas.job_analysis import JobAnalysisResponse
from app.services.analysis_service import AnalysisService

router = APIRouter()


@router.post("/analyze", response_model=JobAnalysisResponse)
async def analyze_job(
    job_description: str = Form(...),
    job_url: str | None = Form(None),
    cv_file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
):
    """Run full agent analysis: parse job + CV, match, gaps, cover letter."""
    service = AnalysisService(session)
    result = await service.run_analysis(
        job_description=job_description,
        job_url=job_url,
        cv_file=cv_file,
    )
    return result
