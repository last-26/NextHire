from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application


class ApplicationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_status(self, status: str) -> list[Application]:
        """Get applications filtered by status."""
        result = await self.session.execute(
            select(Application).where(Application.status == status)
        )
        return list(result.scalars().all())

    async def update_status(self, application_id: UUID, new_status: str) -> Application:
        """Update application status (kanban move)."""
        application = await self.session.get(Application, application_id)
        if not application:
            raise ValueError(f"Application {application_id} not found")
        application.status = new_status
        await self.session.flush()
        await self.session.refresh(application)
        return application
