from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.llm.router import ModelRouter


async def get_session(session: AsyncSession = Depends(get_db)) -> AsyncSession:
    return session


def get_model_router() -> ModelRouter:
    return ModelRouter()
