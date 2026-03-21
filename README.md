# NextHire — AI-Powered Job Application Agent

An **agentic AI system** that analyzes job postings against your CV, generates ATS compatibility scores, identifies skill gaps, writes personalized cover letters, and tracks applications — all orchestrated by an autonomous multi-step AI pipeline.

This is not a simple prompt wrapper. It is a **7-node LangGraph agent** that parses, reasons, evaluates its own output, and iterates — using multi-model routing (cheap model for parsing, powerful model for reasoning) with real-time SSE streaming to the frontend.

## How It Works

```
CV Upload + Job Description
        │
        ▼
┌─────────────────────────────────────────┐
│         LangGraph Agent Pipeline        │
│                                         │
│  1. Parse Job    ← Haiku (fast/cheap)   │
│  2. Parse CV     ← Haiku               │
│  3. Analyze Match ← Sonnet (reasoning)  │
│  4. Identify Gaps ← Sonnet             │
│  5. Generate Cover Letter ← Sonnet     │
│  6. Reflect (quality gate) ← Sonnet    │
│     └─ score < threshold? → retry (5)  │
│  7. Compile Report                      │
└─────────────────────────────────────────┘
        │
        ▼
Hybrid ATS Score + Gap Analysis + Cover Letter + Kanban Entry
```

**Pipeline runs in ~50-70 seconds**, streaming each step to the UI in real-time.

## Features

- **Hybrid ATS Scoring** — Combines algorithmic metrics (semantic similarity + keyword matching) with LLM holistic judgment (transferable skills, experience depth, cultural fit). Final score = 50% algorithmic + 50% AI evaluation.
- **Real-time SSE Streaming** — Watch the agent think step-by-step as each pipeline node completes.
- **Gap Analysis** — Critical skill gaps, experience gaps, quick wins, and long-term improvement suggestions.
- **Cover Letter Generation** — Personalized cover letters with a reflection loop that self-evaluates quality and retries if needed.
- **Application Tracking** — Kanban board (Wishlist → Applied → Interview → Offer/Rejected). Auto-creates entries after analysis.
- **PDF Export** — Download analysis reports as formatted PDFs.
- **Settings & DB Management** — LLM provider config, connection testing, database stats, and data reset.
- **Mobile Responsive** — Collapsible sidebar, touch-friendly on all screen sizes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui |
| Backend | FastAPI + Python 3.11 (async) |
| Agent | LangGraph — state machine with cycles, conditional edges, reflection |
| LLM | AWS Bedrock — Claude Haiku 4.5 (fast tasks) + Claude Sonnet 4 (reasoning) |
| Database | PostgreSQL + SQLAlchemy + Alembic |
| NLP | sentence-transformers (all-MiniLM-L6-v2) — local semantic similarity |
| PDF Parsing | PyMuPDF + python-docx |
| CI/CD | GitHub Actions (lint → test → Docker build) |
| Containerization | Docker + Docker Compose |

## Architecture

```
Next.js Frontend ──SSE──▶ FastAPI Backend ──▶ LangGraph Agent ──▶ AWS Bedrock
                                │                    │                (Haiku + Sonnet)
                                │                    │
                                ▼                    ├── cv_parser (PyMuPDF/docx)
                           PostgreSQL                ├── keyword_extractor (TF-IDF)
                           (JSONB)                   ├── semantic_scorer (sentence-transformers)
                                                     └── job_scraper
```

### Scoring System (Hybrid)

```
Algorithmic Layer (deterministic, repeatable):
  ├── Semantic similarity (sentence-transformers cosine)  ─┐
  └── Keyword skill matching (fuzzy substring)            ─┤── Algorithmic Score
                                                           │
LLM Layer (nuanced, contextual):                           │
  └── Sonnet evaluates transferable skills, experience     │
      depth, education fit, industry alignment,            ├── Final Score
      soft skills, overall competitiveness                 │   (50/50 weighted)
      → returns 0-100 score + reasoning                   ─┘
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- AWS credentials with Bedrock access (Claude Haiku 4.5 + Sonnet 4)

### Setup

```bash
# 1. Clone
git clone https://github.com/last-26/NextHire.git
cd NextHire

# 2. Configure environment
cp .env.example .env
# Edit .env with your AWS credentials:
#   AWS_ACCESS_KEY_ID=...
#   AWS_SECRET_ACCESS_KEY=...
#   AWS_DEFAULT_REGION=eu-central-1

# 3. Run
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development (without Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
ruff check .      # lint
pytest -v         # test

# Frontend
cd frontend
npm install
npm run dev       # http://localhost:3000
npm run lint
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/analyze` | Run full agent pipeline (CV + job description) |
| POST | `/api/v1/analyze/stream` | Same, but streams steps via SSE |
| GET | `/api/v1/analyze/{id}/pdf` | Export analysis as PDF |
| GET | `/api/v1/applications` | List all tracked applications |
| POST | `/api/v1/applications` | Create application |
| PATCH | `/api/v1/applications/{id}` | Update application (status, notes) |
| GET | `/api/v1/dashboard/stats` | Dashboard summary statistics |
| GET | `/api/v1/settings` | Current LLM provider config |
| POST | `/api/v1/settings/test-connection` | Test LLM connectivity |
| GET | `/api/v1/settings/db-stats` | Database table row counts |
| DELETE | `/api/v1/settings/reset-db` | Clear all application data |

## Project Structure

```
NextHire/
├── backend/
│   ├── app/
│   │   ├── agent/              # LangGraph agent core
│   │   │   ├── graph.py        # State machine definition
│   │   │   ├── state.py        # Agent state schema
│   │   │   ├── nodes/          # Pipeline steps (parse, analyze, gaps, cover letter, reflect)
│   │   │   └── tools/          # cv_parser, keyword_extractor, semantic_scorer, job_scraper
│   │   ├── llm/                # LLM abstraction layer
│   │   │   ├── router.py       # Task → model routing (fast/power)
│   │   │   ├── base.py         # Provider interface
│   │   │   └── providers/      # Bedrock, Anthropic, OpenAI (extensible)
│   │   ├── api/routes/         # FastAPI endpoints
│   │   ├── models/             # SQLAlchemy ORM
│   │   └── services/           # Business logic
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js pages (dashboard, analyze, applications, settings)
│   │   ├── components/         # UI components (agent stream, score card, kanban, etc.)
│   │   └── lib/                # API client, SSE helper, utilities
│   └── public/
├── docker-compose.yml
└── CLAUDE.md                   # Detailed architecture & development guide
```

## Key Design Decisions

- **LangGraph** over plain chains — needed cycles (reflect → retry), conditional edges, state persistence
- **Multi-model routing** — Haiku for cheap parsing (~$0.001/call), Sonnet for reasoning (~$0.01/call)
- **Hybrid scoring** — algorithmic for repeatability, LLM for nuance (transferable skills, context)
- **SSE over WebSocket** — unidirectional streaming, simpler, auto-reconnects
- **Local embeddings** — sentence-transformers runs locally, no API cost for semantic similarity
- **JSONB storage** — flexible analysis results without schema migrations per field change

## License

MIT
