# NextHire - AI-Powered Job Application Agent

An agentic AI system that helps job seekers analyze job postings, evaluate CV compatibility, generate personalized cover letters, identify CV gaps, and track applications.

## Architecture

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: FastAPI + Python 3.11
- **Agent**: LangGraph (state machine-based orchestration)
- **LLM**: AWS Bedrock (Claude Haiku 4.5 + Claude Sonnet) with multi-model routing
- **Database**: PostgreSQL + SQLAlchemy + Alembic
- **NLP**: sentence-transformers (all-MiniLM-L6-v2) for semantic similarity

## Quick Start

```bash
# Clone and configure
cp .env.example .env
# Edit .env with your AWS credentials

# Run with Docker
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
pytest -v
ruff check .
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features

- **Job Analysis**: Upload CV + paste job posting -> AI agent analyzes compatibility
- **ATS Score**: Semantic + keyword matching with weighted scoring
- **Gap Analysis**: Identifies missing skills and suggests improvements
- **Cover Letter**: AI-generated personalized cover letters with quality reflection
- **Application Tracking**: Kanban board (Wishlist -> Applied -> Interview -> Offer/Rejected)
- **Real-time Streaming**: Watch the agent think step-by-step via SSE

## License

MIT
