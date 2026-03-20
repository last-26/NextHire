from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.models.application import Application
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
)

router = APIRouter()


@router.get("/applications", response_model=list[ApplicationResponse])
async def list_applications(session: AsyncSession = Depends(get_session)):
    """List all applications."""
    result = await session.execute(
        select(Application).order_by(Application.updated_at.desc())
    )
    return result.scalars().all()


@router.post("/applications", response_model=ApplicationResponse, status_code=201)
async def create_application(
    data: ApplicationCreate,
    session: AsyncSession = Depends(get_session),
):
    """Create a new application."""
    application = Application(**data.model_dump())
    session.add(application)
    await session.flush()
    await session.refresh(application)
    return application


@router.get("/applications/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get a single application."""
    application = await session.get(Application, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.patch("/applications/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: UUID,
    data: ApplicationUpdate,
    session: AsyncSession = Depends(get_session),
):
    """Update an application (status, notes, etc.)."""
    application = await session.get(Application, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(application, field, value)

    await session.flush()
    await session.refresh(application)
    return application


@router.delete("/applications/{application_id}", status_code=204)
async def delete_application(
    application_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Delete an application."""
    application = await session.get(Application, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    await session.delete(application)
