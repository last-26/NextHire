from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, analyze, applications, cover_letter, cv_review, agent
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown


app = FastAPI(
    title="NextHire API",
    description="AI-Powered Job Application Agent",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
origins = [origin.strip() for origin in settings.BACKEND_CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(analyze.router, prefix="/api/v1", tags=["analyze"])
app.include_router(applications.router, prefix="/api/v1", tags=["applications"])
app.include_router(cover_letter.router, prefix="/api/v1", tags=["cover-letter"])
app.include_router(cv_review.router, prefix="/api/v1", tags=["cv-review"])
app.include_router(agent.router, prefix="/api/v1", tags=["agent"])
