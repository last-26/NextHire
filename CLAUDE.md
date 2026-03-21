# NextHire — AI-Powered Job Application Agent

## Project Overview

NextHire is an **agentic AI system** that helps job seekers analyze job postings, evaluate CV compatibility, generate personalized cover letters, identify CV gaps, and track applications — all orchestrated by an autonomous LangGraph agent pipeline.

This is NOT a simple "prompt-in, text-out" wrapper. It is a **multi-step agent** that plans, executes tools, evaluates its own output, and iterates. The agent uses **multi-model routing** (cheap model for simple tasks, powerful model for reasoning) and streams its execution steps to the frontend in real-time.

**Live Architecture:** Next.js frontend → FastAPI backend → LangGraph Agent → AWS Bedrock (Claude Haiku 4.5 + Claude Sonnet 4)

**Current Status (March 2026):** Core pipeline fully operational and verified. Analysis flow works end-to-end: CV upload + job description → 7-node agent pipeline (~50-70s) → ATS score, gap analysis, cover letter → auto-creates kanban application. Dashboard shows live stats. CI/CD passes. Bedrock connection stable (Haiku + Sonnet both responding). Next: SSE streaming, settings page, PDF export, UX polish.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | **Next.js 14 (App Router)** + TypeScript + TailwindCSS + shadcn/ui | Modern React framework, SSR support, great DX |
| Backend | **FastAPI** + Python 3.11 | Async, fast, great for AI workloads |
| Agent | **LangGraph** | State machine-based agent orchestration with cycles, reflection, human-in-the-loop |
| LLM | **AWS Bedrock** (Claude Haiku 4.5 → simple tasks, Claude Sonnet → complex reasoning) | Cost-effective multi-model routing |
| Database | **PostgreSQL** + SQLAlchemy + Alembic | Relational data, JSONB for flexible analysis storage |
| NLP | **sentence-transformers** (all-MiniLM-L6-v2) | Local embedding for semantic similarity (no API cost) |
| PDF/DOCX | **PyMuPDF + python-docx** | CV parsing without external APIs |
| Containerization | **Docker + Docker Compose** | Consistent dev/prod environment |
| CI/CD | **GitHub Actions** | Lint → Test → Docker Build |

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│  ┌──────────┐ ┌───────────┐ ┌────────────┐ ┌────────────┐  │
│  │Dashboard │ │  Analyze  │ │   Kanban   │ │  Settings  │  │
│  │          │ │  + Agent  │ │   Board    │ │  (future)  │  │
│  │          │ │  Stream   │ │            │ │            │  │
│  └──────────┘ └─────┬─────┘ └────────────┘ └────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │ SSE (Server-Sent Events)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  REST API    │  │  Agent API   │  │  Application     │  │
│  │  /analyze    │  │  /agent/run  │  │  CRUD /apps      │  │
│  │  /cv-review  │  │  (SSE stream)│  │  (kanban)        │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │             │
│  ┌──────▼─────────────────▼────────────────────▼─────────┐  │
│  │                  Service Layer                         │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │              LangGraph Agent Engine                    │  │
│  │  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐  │  │
│  │  │  parse  │→│ analyze  │→│  gaps  │→│  generate  │  │  │
│  │  │  job    │ │  match   │ │ detect │ │  cover_ltr │  │  │
│  │  └─────────┘ └──────────┘ └────────┘ └──────┬─────┘  │  │
│  │                                              │        │  │
│  │                                      ┌───────▼─────┐  │  │
│  │                                      │   reflect   │  │  │
│  │                                      │  (quality   │  │  │
│  │                                      │   check)    │──┤  │
│  │                                      └─────────────┘  │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │              LLM Abstraction Layer                     │  │
│  │  ┌──────────────┐  ┌────────┐  ┌─────────────────┐   │  │
│  │  │ ModelRouter  │  │ Haiku  │  │    Sonnet        │   │  │
│  │  │ (task→model) │→ │ (fast) │  │ (reasoning)     │   │  │
│  │  └──────────────┘  └────────┘  └─────────────────┘   │  │
│  │                                                       │  │
│  │  Future Providers (interface ready):                   │  │
│  │  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ Anthropic│ │ OpenAI │ │  Gemini  │ │  Ollama  │  │  │
│  │  │ (direct) │ │        │ │          │ │ (local)  │  │  │
│  │  └──────────┘ └────────┘ └──────────┘ └──────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │ + Alembic   │
                    └─────────────┘
```

### Agent Graph (LangGraph State Machine)

```
                    ┌──────────────┐
                    │    START     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  parse_job   │ ← Haiku (cheap, fast)
                    │  - Extract   │   Tool: job_scraper
                    │    title,    │   Tool: keyword_extractor
                    │    skills,   │
                    │    reqs      │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  parse_cv    │ ← Haiku
                    │  - Extract   │   Tool: cv_parser
                    │    skills,   │   Tool: keyword_extractor
                    │    exp,      │
                    │    education │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │analyze_match │ ← Sonnet (deep reasoning)
                    │  - Semantic  │   Tool: semantic_scorer
                    │    matching  │
                    │  - Keyword   │
                    │    overlap   │
                    │  - Weighted  │
                    │    ATS score │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │identify_gaps │ ← Sonnet
                    │  - Missing   │
                    │    skills    │
                    │  - Weak      │
                    │    areas     │
                    │  - Suggest   │
                    │    improve   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │gen_cover_ltr │ ← Sonnet
                    │  - Personal  │
                    │    letter    │
                    │  - Highlight │
                    │    matches   │
                    │  - Address   │
                    │    gaps      │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   reflect    │ ← Sonnet
                    │  - Quality   │
                    │    check     │
                    │  - Score     │──── score < threshold?
                    │    output    │         │
                    └──────┬───────┘         │ YES → loop back
                           │                │ to gen_cover_ltr
                           │ NO (pass)      │ (max 2 retries)
                    ┌──────▼───────┐
                    │   compile    │
                    │  - Final     │
                    │    report    │
                    │  - Save to   │
                    │    database  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │     END      │
                    └──────────────┘
```

---

## Project Structure

```
NextHire/
├── CLAUDE.md                          # This file
├── README.md                          # Project documentation
├── docker-compose.yml                 # Full stack orchestration
├── .env.example                       # Environment template
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── pyproject.toml                 # ruff config
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/                  # Migration files
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app, CORS, lifespan
│   │   ├── config.py                  # Pydantic Settings (.env loading)
│   │   ├── database.py                # SQLAlchemy engine, session, Base
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py                # Dependency injection (get_db, get_llm)
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── analyze.py         # POST /api/v1/analyze (full agent run)
│   │   │       ├── applications.py    # CRUD /api/v1/applications (kanban)
│   │   │       ├── cover_letter.py    # POST /api/v1/cover-letter
│   │   │       ├── cv_review.py       # POST /api/v1/cv-review
│   │   │       ├── agent.py           # GET /api/v1/agent/stream/{run_id} (SSE)
│   │   │       ├── dashboard.py       # GET /api/v1/dashboard/stats, /recent-analyses
│   │   │       └── health.py          # GET /api/v1/health
│   │   │
│   │   ├── models/                    # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── application.py         # Application tracking (kanban)
│   │   │   ├── job_analysis.py        # Analysis results
│   │   │   ├── cover_letter.py        # Generated cover letters
│   │   │   └── agent_run.py           # Agent execution logs
│   │   │
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   │   ├── __init__.py
│   │   │   ├── application.py
│   │   │   ├── job_analysis.py
│   │   │   ├── cover_letter.py
│   │   │   └── agent.py               # Agent stream event schema
│   │   │
│   │   ├── agent/                     # ★ LangGraph Agent Core ★
│   │   │   ├── __init__.py
│   │   │   ├── graph.py               # Agent graph definition (nodes + edges + conditionals)
│   │   │   ├── state.py               # TypedDict state schema for agent
│   │   │   ├── nodes/                 # Each node = one agent step
│   │   │   │   ├── __init__.py
│   │   │   │   ├── parse_job.py       # Extract structured data from job posting
│   │   │   │   ├── parse_cv.py        # Extract structured data from CV
│   │   │   │   ├── analyze_match.py   # Semantic + keyword matching, ATS score
│   │   │   │   ├── identify_gaps.py   # Find missing skills, weak points
│   │   │   │   ├── generate_cover_letter.py  # Personalized cover letter
│   │   │   │   ├── reflect.py         # Self-evaluation, quality gate
│   │   │   │   └── compile_report.py  # Final structured output
│   │   │   └── tools/                 # Tools the agent can invoke
│   │   │       ├── __init__.py
│   │   │       ├── cv_parser.py       # PDF/DOCX text extraction
│   │   │       ├── job_scraper.py     # Fetch job posting from URL
│   │   │       ├── keyword_extractor.py  # TF-IDF / NLP keyword extraction
│   │   │       └── semantic_scorer.py # sentence-transformers cosine similarity
│   │   │
│   │   ├── llm/                       # ★ LLM Abstraction Layer ★
│   │   │   ├── __init__.py
│   │   │   ├── base.py               # Abstract BaseLLM class (invoke, stream, pricing)
│   │   │   ├── router.py             # ModelRouter: task_type → model selection
│   │   │   ├── config.py             # Model registry, pricing info, task mappings
│   │   │   └── providers/
│   │   │       ├── __init__.py
│   │   │       ├── bedrock.py         # ★ AWS Bedrock provider (Haiku + Sonnet)
│   │   │       ├── anthropic.py       # Placeholder: Direct Anthropic API
│   │   │       ├── openai.py          # Placeholder: OpenAI
│   │   │       ├── gemini.py          # Placeholder: Google Gemini
│   │   │       └── ollama.py          # Placeholder: Local Ollama
│   │   │
│   │   └── services/                  # Business logic layer
│   │       ├── __init__.py
│   │       ├── analysis_service.py    # Orchestrates agent runs
│   │       └── application_service.py # Kanban CRUD logic
│   │
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py                # Fixtures: test DB, mock LLM
│       ├── test_api/
│       │   ├── test_health.py
│       │   ├── test_analyze.py
│       │   └── test_applications.py
│       ├── test_agent/
│       │   ├── test_graph.py          # Agent flow tests with mocked LLM
│       │   ├── test_nodes.py
│       │   └── test_tools.py
│       └── test_llm/
│           ├── test_router.py
│           └── test_bedrock.py
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx             # Root layout with sidebar nav
│   │   │   ├── page.tsx               # Dashboard (summary stats)
│   │   │   ├── globals.css
│   │   │   │
│   │   │   ├── analyze/
│   │   │   │   └── page.tsx           # ★ Main page: upload CV + paste job → agent stream
│   │   │   │
│   │   │   ├── applications/
│   │   │   │   └── page.tsx           # Kanban board for tracking
│   │   │   │
│   │   │   ├── cover-letters/
│   │   │   │   └── page.tsx           # Cover letter history + editor
│   │   │   │
│   │   │   └── settings/
│   │   │       └── page.tsx           # Future: API key configuration
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                    # shadcn/ui components (button, card, badge, etc.)
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx        # App navigation sidebar
│   │   │   │   └── Header.tsx
│   │   │   │
│   │   │   ├── ErrorBoundary.tsx      # Catches browser-extension DOM errors, auto-recovers
│   │   │   │
│   │   │   ├── agent/
│   │   │   │   ├── AgentStream.tsx    # Step timeline with mini segment bar
│   │   │   │   ├── StepCard.tsx       # Individual step card (status, output, duration)
│   │   │   │   └── AgentProgress.tsx  # Progress bar (unused — kept for future SSE streaming)
│   │   │   │
│   │   │   ├── analysis/
│   │   │   │   ├── ScoreCard.tsx      # ATS match score display (circular gauge)
│   │   │   │   ├── SkillMatch.tsx     # Matched vs missing skills visualization
│   │   │   │   ├── GapAnalysis.tsx    # Gap cards with improvement suggestions
│   │   │   │   └── AnalysisReport.tsx # Full report layout
│   │   │   │
│   │   │   ├── kanban/
│   │   │   │   ├── Board.tsx          # Drag-and-drop kanban board
│   │   │   │   ├── Column.tsx         # Kanban column (Wishlist/Applied/Interview/Offer/Rejected)
│   │   │   │   └── ApplicationCard.tsx
│   │   │   │
│   │   │   └── cover-letter/
│   │   │       ├── CoverLetterEditor.tsx  # Editable cover letter with formatting
│   │   │       └── CoverLetterCard.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                 # Axios API client (5min timeout for analysis)
│   │   │   ├── sse.ts                 # SSE event source helper for agent streaming
│   │   │   └── utils.ts              # Utility functions
│   │   │
│   │   └── types/
│   │       └── index.ts               # TypeScript type definitions
│   │
│   └── public/
│       └── logo.svg
│
└── .github/
    └── workflows/
        └── ci.yml                     # Lint → Test → Docker Build
```

---

## Environment Variables

```bash
# === Backend (.env) ===

# Database
DATABASE_URL=postgresql://nexthire:nexthire@db:5432/nexthire

# AWS Bedrock (primary LLM provider)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=eu-central-1

# LLM Configuration
LLM_PROVIDER=bedrock                    # bedrock | anthropic | openai | gemini | ollama
LLM_FAST_MODEL=eu.anthropic.claude-haiku-4-5-20251001-v1:0     # For simple tasks
LLM_POWER_MODEL=eu.anthropic.claude-sonnet-4-20250514-v1:0     # For reasoning tasks

# Future provider keys (placeholders — not needed for MVP)
# ANTHROPIC_API_KEY=sk-ant-...
# OPENAI_API_KEY=sk-...
# GEMINI_API_KEY=...
# OLLAMA_BASE_URL=http://localhost:11434

# App
APP_ENV=development
BACKEND_CORS_ORIGINS=http://localhost:3000

# === Frontend (.env.local) ===
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Database Schema

### applications (Kanban Tracking)
```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    position_title VARCHAR(255) NOT NULL,
    job_url TEXT,
    status VARCHAR(50) DEFAULT 'wishlist',  -- wishlist | applied | interview | offer | rejected
    priority VARCHAR(20) DEFAULT 'medium',  -- low | medium | high
    notes TEXT,
    match_score FLOAT,                      -- From analysis (0-100)
    analysis_id UUID REFERENCES job_analyses(id),
    cover_letter_id UUID REFERENCES cover_letters(id),
    applied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### job_analyses
```sql
CREATE TABLE job_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_title VARCHAR(255),
    company_name VARCHAR(255),
    job_description TEXT NOT NULL,          -- Raw job posting text
    job_url TEXT,
    parsed_job JSONB,                       -- Structured: skills, requirements, etc.
    parsed_cv JSONB,                        -- Structured: skills, experience, etc.
    match_result JSONB,                     -- Scores, matched/missing skills
    gap_analysis JSONB,                     -- Identified gaps + suggestions
    overall_score FLOAT,                    -- Weighted ATS score (0-100)
    cv_filename VARCHAR(255),
    agent_run_id UUID REFERENCES agent_runs(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### cover_letters
```sql
CREATE TABLE cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES job_analyses(id),
    content TEXT NOT NULL,
    tone VARCHAR(50) DEFAULT 'professional', -- professional | casual | enthusiastic
    version INT DEFAULT 1,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### agent_runs (Execution Logs)
```sql
CREATE TABLE agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) DEFAULT 'running',   -- running | completed | failed
    steps JSONB DEFAULT '[]',               -- Array of step logs
    total_tokens_used INT DEFAULT 0,
    total_cost_usd FLOAT DEFAULT 0,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT
);
```

---

## LLM Abstraction Layer Design

### Key Pattern: Provider Interface

```python
# app/llm/base.py
from abc import ABC, abstractmethod
from typing import AsyncGenerator

class BaseLLMProvider(ABC):
    """Abstract base class for all LLM providers."""

    @abstractmethod
    async def invoke(self, messages: list[dict], model: str, **kwargs) -> str:
        """Single completion."""
        ...

    @abstractmethod
    async def stream(self, messages: list[dict], model: str, **kwargs) -> AsyncGenerator[str, None]:
        """Streaming completion."""
        ...

    @abstractmethod
    def get_pricing(self, model: str) -> dict:
        """Return {'input_per_1m': float, 'output_per_1m': float}"""
        ...
```

### Model Router Logic

```python
# app/llm/router.py
# Task types and their model assignments:
TASK_MODEL_MAP = {
    "parse_job": "fast",         # Haiku — simple extraction
    "parse_cv": "fast",          # Haiku — simple extraction
    "keyword_extract": "fast",   # Haiku
    "analyze_match": "power",    # Sonnet — deep reasoning
    "identify_gaps": "power",    # Sonnet — nuanced analysis
    "generate_cover_letter": "power",  # Sonnet — creative writing
    "reflect": "power",          # Sonnet — self-evaluation
}
# "fast" → LLM_FAST_MODEL from .env
# "power" → LLM_POWER_MODEL from .env
```

### Adding a New Provider (Future Guide)

To add a new provider (e.g., OpenAI):
1. Create `app/llm/providers/openai.py` implementing `BaseLLMProvider`
2. Add `"openai"` case to provider factory in `app/llm/__init__.py`
3. Add model configs to `app/llm/config.py`
4. Set `LLM_PROVIDER=openai` and `OPENAI_API_KEY` in `.env`
5. No other changes needed — router and agent work via the abstraction

---

## Agent SSE Streaming Protocol

The agent streams execution steps to the frontend via Server-Sent Events:

```
Event format:
data: {"step": "parse_job", "status": "running", "message": "Extracting job requirements..."}
data: {"step": "parse_job", "status": "completed", "duration_ms": 1200, "output": {...}}
data: {"step": "analyze_match", "status": "running", "message": "Calculating ATS compatibility..."}
data: {"step": "analyze_match", "status": "completed", "duration_ms": 3400, "output": {"score": 78.5, ...}}
...
data: {"step": "reflect", "status": "completed", "output": {"quality_score": 8.5, "passed": true}}
data: {"type": "complete", "run_id": "uuid", "total_duration_ms": 12400, "total_cost_usd": 0.045}
```

Frontend consumes this via EventSource and updates the AgentStream component in real-time.

---

## Key Design Decisions

1. **LangGraph over plain chains**: We need cycles (reflect → retry), conditional edges (quality gate), and state persistence. LangGraph's state machine model handles all of these.

2. **SSE over WebSocket**: For agent streaming, SSE is simpler — it's unidirectional (server → client), works over HTTP, and auto-reconnects. WebSocket is overkill here since the client doesn't send data during execution.

3. **sentence-transformers for embeddings**: Runs locally, no API cost for semantic similarity. The model (all-MiniLM-L6-v2) is small (~80MB) and fast.

4. **JSONB for analysis results**: Flexible storage for varying analysis structures without schema migrations every time we add a field.

5. **Alembic for migrations**: Proper migration management instead of `create_all()`. Essential for a production-grade project.

6. **shadcn/ui for components**: Accessible, customizable, copy-paste components. Not a heavy dependency — each component is a local file.

---

## Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # Dev server
pytest -v                                    # Run tests
ruff check .                                 # Lint
alembic upgrade head                         # Run migrations
alembic revision --autogenerate -m "msg"     # Create migration
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
```

### Docker
```bash
docker compose up --build              # Full stack
docker compose up db                   # Just database
docker compose exec backend pytest -v  # Tests in container
```

---

## Implementation Order (Phases)

### Phase 1: Foundation ✅
- [x] Project scaffolding (monorepo structure)
- [x] Docker Compose (FastAPI + Next.js + PostgreSQL)
- [x] Database models + Alembic migrations
- [x] Basic CRUD API for applications (kanban data)
- [x] LLM abstraction layer + Bedrock provider
- [x] Health check endpoints
- [x] Frontend: Layout, sidebar, routing

### Phase 2: Agent Core ✅
- [x] LangGraph agent graph definition
- [x] Agent state schema
- [x] Tools: cv_parser, job_scraper, keyword_extractor, semantic_scorer
- [x] Nodes: parse_job, parse_cv, analyze_match
- [x] SSE streaming endpoint
- [x] Frontend: Agent stream viewer component

### Phase 3: Full Agent Pipeline ✅
- [x] Nodes: identify_gaps, generate_cover_letter, reflect, compile_report
- [x] Reflection loop with quality gate
- [x] Multi-model routing (Haiku for parse, Sonnet for analysis)
- [x] Analysis results stored in DB
- [x] Frontend: Analysis report page (score card, skill match, gaps)

### Phase 4: Application Tracking + Polish ✅
- [x] Kanban board frontend (drag-and-drop)
- [x] Cover letter editor
- [x] Link analysis → application → cover letter (auto-creates Application on analysis completion)
- [x] Dashboard with live stats (dynamic API-driven)
- [x] CI/CD pipeline (GitHub Actions: lint, test, build, docker)
- [ ] README + demo screenshots

### Phase 5: Streaming, Settings & Polish (In Progress)
- [ ] Real-time SSE streaming — agent steps stream live to frontend during execution
- [ ] Settings page — LLM provider selection, API key configuration UI
- [ ] Export analysis reports as PDF
- [ ] Frontend UX improvements — responsive polish, loading states, accessibility

### Phase 6: Future Enhancements (Backlog)
- [ ] Additional LLM providers (Anthropic direct, OpenAI, Gemini, Ollama)
- [ ] Batch analysis (multiple job postings at once)
- [ ] CV version management
- [ ] Email notifications for application deadlines

---

## Coding Standards

- **Python**: Follow PEP 8, use type hints everywhere, async where possible. Ruff for linting.
- **TypeScript**: Strict mode, explicit types for API responses, no `any`.
- **Commits**: Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`)
- **API**: RESTful, consistent error responses `{"detail": "message"}`, proper HTTP status codes.
- **Tests**: Minimum coverage for API endpoints and agent graph flow. Use mocked LLM for agent tests.

---

## Branch Strategy

- `main` — production-ready, protected
- `dev` — active development
- Feature branches off `dev`: `feat/agent-graph`, `feat/kanban-board`, etc.

---

## Critical Notes for Claude Code

1. **Always use the LLM abstraction layer** — never call boto3/bedrock directly from agent nodes. All LLM calls go through `app/llm/router.py`.

2. **Agent nodes must be pure functions** of state — take `AgentState` in, return partial state update out. No side effects except via tools.

3. **SSE streaming** — each agent node should emit status events. The graph runner wraps node execution and yields SSE events.

4. **Frontend API calls** — use a centralized API client (`src/lib/api.ts`). No scattered fetch calls.

5. **Environment-based config** — all secrets and model names come from `.env` via `app/config.py`. Never hardcode model IDs.

6. **Docker Compose** is the source of truth for local development. Both frontend and backend should work with `docker compose up`.

7. **PostgreSQL JSONB** — use for analysis results, parsed job/CV data. Define Pydantic schemas for validation before storing.

8. **AWS Bedrock inference profiles** — New Claude models on Bedrock require inference profile IDs (prefixed with region, e.g. `eu.anthropic.claude-haiku-4-5-20251001-v1:0`). On-demand model IDs will return `ValidationException`.

9. **Analysis → Application auto-creation** — `analysis_service.py` automatically creates an `Application` record (status `wishlist`) after each successful analysis, linking it to the analysis and cover letter. No manual application creation needed.

---

## Key Changes Log

### March 2026 — Full Pipeline Wiring + Frontend Redesign

**Backend:**
- Wired `analysis_service.py` to actually invoke `agent_graph.ainvoke()` (was previously a TODO stub)
- Fixed `bedrock.py` system prompt handling — `_get_system_prompt()` existed but was never called in `invoke()`/`stream()`
- Added `dashboard.py` route with `/dashboard/stats` and `/dashboard/recent-analyses` endpoints
- Auto-creation of `Application` records after each analysis (links analysis + cover letter to kanban)
- Generated and applied initial Alembic migration for all 4 tables
- Fixed 18+ ruff lint issues across the codebase
- Corrected model IDs to use Bedrock inference profile format

**Frontend:**
- Replaced `next.config.ts` with `next.config.mjs` (TS config not supported in Node 20 Alpine + Next.js 14.2)
- Complete visual redesign: indigo/purple gradient palette, glass morphism, hover-lift cards
- Added CSS animations: fadeIn, slideUp, slideIn, pulse-gentle, shimmer loading skeletons
- Dashboard now fetches real stats via API (analyses count, applications count, avg score, recent analyses)
- ScoreCard: SVG circular gauge with animated gradient stroke
- Analysis report: vertical card stack with gradient accent stripes, strengths/weaknesses grid
- Agent stream: vertical timeline with gradient connecting line, rich step descriptions
- Sidebar: gradient logo, active nav indicator, "Powered by AI" footer

**CI/CD:**
- Fixed all GitHub Actions jobs (backend-lint, frontend-lint, frontend-build)

### March 2026 — Stability Fixes

**Frontend:**
- Added `ErrorBoundary` component to catch browser-extension DOM interference (`insertBefore`/`removeChild` errors) — auto-recovers instead of crashing
- Added `suppressHydrationWarning` to `<html>` and `<body>` tags in layout
- Replaced fake 0% progress bar with simulated step-by-step pipeline animation (elapsed timer, mini segment bar, steps activate sequentially while waiting for API response)
- Replaced conditional mounting/unmounting of Agent Pipeline and Analysis Report sections with always-mounted containers using `hidden` class to prevent React reconciliation errors
- Set Axios timeout to 5 minutes (analysis pipeline can take 1-2 min with multiple LLM calls)
- Improved error messages: shows backend detail instead of generic "Network Error"

### March 2026 — Pipeline Verification

**Verified:**
- Bedrock connection stable — both Haiku and Sonnet respond correctly
- Full agent pipeline works end-to-end (~50-70s for complete analysis)
- HTTP API endpoint returns 200 with full analysis results
- CORS preflight passes, frontend↔backend connectivity confirmed

**Known Issue:**
- Analysis currently returns as a single API response (no streaming). SSE endpoint exists (`/agent/stream/{run_id}`) but is a TODO stub. Frontend simulates step progression while waiting. (Fixing in Phase 5)
