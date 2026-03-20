from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.models.cover_letter import CoverLetter
from app.schemas.cover_letter import CoverLetterCreate, CoverLetterResponse

router = APIRouter()


@router.get("/cover-letters", response_model=list[CoverLetterResponse])
async def list_cover_letters(session: AsyncSession = Depends(get_session)):
    """List all cover letters."""
    result = await session.execute(
        select(CoverLetter).order_by(CoverLetter.created_at.desc())
    )
    return result.scalars().all()


@router.get("/cover-letters/{cover_letter_id}", response_model=CoverLetterResponse)
async def get_cover_letter(
    cover_letter_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get a single cover letter."""
    cover_letter = await session.get(CoverLetter, cover_letter_id)
    if not cover_letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return cover_letter


@router.post("/cover-letters", response_model=CoverLetterResponse, status_code=201)
async def create_cover_letter(
    data: CoverLetterCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a cover letter manually."""
    cover_letter = CoverLetter(**data.model_dump())
    session.add(cover_letter)
    await session.flush()
    await session.refresh(cover_letter)
    return cover_letter
