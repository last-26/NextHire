
import json
import time
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.agent.graph import agent_graph
from app.agent.tools.cv_parser import parse_cv as parse_cv_file
from app.api.deps import get_session
from app.models.agent_run import AgentRun
from app.models.application import Application
from app.models.cover_letter import CoverLetter
from app.models.job_analysis import JobAnalysis
from app.schemas.job_analysis import JobAnalysisResponse
from app.services.analysis_service import AnalysisService
from app.services.pdf_export import generate_analysis_pdf

router = APIRouter()

# Human-friendly step descriptions
STEP_DESCRIPTIONS = {
    "parse_job": "Extracting job requirements...",
    "parse_cv": "Analyzing your CV...",
    "analyze_match": "Calculating ATS compatibility score...",
    "identify_gaps": "Identifying skill gaps...",
    "generate_cover_letter": "Writing personalized cover letter...",
    "reflect": "Evaluating cover letter quality...",
    "compile_report": "Compiling final report...",
}


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


@router.post("/analyze/stream")
async def analyze_job_stream(
    job_description: str = Form(...),
    job_url: str | None = Form(None),
    cv_file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
):
    """Run agent analysis with real-time SSE streaming of each pipeline step."""
    # Read CV bytes before entering the generator (UploadFile is consumed once)
    cv_content_bytes = await cv_file.read()
    cv_filename = cv_file.filename or "cv.pdf"

    async def event_generator():
        pipeline_start = time.time()

        # Create agent run record
        agent_run = AgentRun(status="running")
        session.add(agent_run)
        await session.flush()

        # Parse CV file to text
        try:
            cv_parsed = parse_cv_file(cv_content_bytes, cv_filename)
            cv_text = cv_parsed["text"]
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"detail": f"CV parsing failed: {e}"}),
            }
            return

        # Create analysis record
        analysis = JobAnalysis(
            job_description=job_description,
            job_url=job_url,
            cv_filename=cv_filename,
            agent_run_id=agent_run.id,
        )
        session.add(analysis)
        await session.flush()

        # Prepare initial state
        initial_state = {
            "job_description": job_description,
            "job_url": job_url,
            "cv_content": cv_text,
            "cv_filename": cv_filename,
            "agent_run_id": str(agent_run.id),
            "steps_log": [],
            "reflection_count": 0,
        }

        # Stream through agent graph node by node
        final_state = dict(initial_state)
        try:
            async for event in agent_graph.astream(initial_state):
                # event is {node_name: state_update}
                for node_name, state_update in event.items():
                    if node_name == "__end__":
                        continue

                    final_state.update(state_update)

                    # Extract step log for this node
                    steps_log = state_update.get("steps_log", [])
                    step_info = steps_log[-1] if steps_log else {}

                    yield {
                        "event": "step",
                        "data": json.dumps({
                            "step": node_name,
                            "status": "completed",
                            "message": STEP_DESCRIPTIONS.get(node_name, ""),
                            "duration_ms": step_info.get("duration_ms", 0),
                            "output_summary": step_info.get("output_summary", ""),
                        }),
                    }

            # Save results to DB
            analysis.parsed_job = final_state.get("parsed_job")
            analysis.parsed_cv = final_state.get("parsed_cv")
            analysis.match_result = final_state.get("match_result")
            analysis.gap_analysis = final_state.get("gap_analysis")
            analysis.overall_score = final_state.get("overall_score")

            if analysis.parsed_job:
                analysis.job_title = analysis.parsed_job.get("title")
                analysis.company_name = analysis.parsed_job.get("company")

            # Create cover letter record
            cover_letter_text = final_state.get("cover_letter")
            cover_letter_record = None
            if cover_letter_text:
                cover_letter_record = CoverLetter(
                    analysis_id=analysis.id,
                    content=cover_letter_text,
                    tone=final_state.get("cover_letter_tone", "professional"),
                )
                session.add(cover_letter_record)
                await session.flush()

            # Auto-create application for kanban
            application = Application(
                company_name=analysis.company_name or "Unknown Company",
                position_title=analysis.job_title or "Untitled Position",
                job_url=job_url,
                status="wishlist",
                priority="medium",
                match_score=analysis.overall_score,
                analysis_id=analysis.id,
                cover_letter_id=(
                    cover_letter_record.id if cover_letter_record else None
                ),
            )
            session.add(application)

            # Update agent run
            agent_run.status = "completed"
            agent_run.steps = final_state.get("steps_log", [])
            agent_run.completed_at = datetime.utcnow()
            await session.flush()
            await session.refresh(analysis)

            total_duration_ms = int((time.time() - pipeline_start) * 1000)

            # Emit final complete event with full analysis data
            yield {
                "event": "complete",
                "data": json.dumps({
                    "analysis": {
                        "id": str(analysis.id),
                        "job_title": analysis.job_title,
                        "company_name": analysis.company_name,
                        "job_description": analysis.job_description,
                        "job_url": analysis.job_url,
                        "parsed_job": analysis.parsed_job,
                        "parsed_cv": analysis.parsed_cv,
                        "match_result": analysis.match_result,
                        "gap_analysis": analysis.gap_analysis,
                        "overall_score": analysis.overall_score,
                        "cv_filename": analysis.cv_filename,
                        "agent_run_id": str(analysis.agent_run_id),
                        "created_at": analysis.created_at.isoformat(),
                    },
                    "total_duration_ms": total_duration_ms,
                }),
            }
            await session.commit()

        except Exception as e:
            agent_run.status = "failed"
            agent_run.error_message = str(e)
            agent_run.completed_at = datetime.utcnow()
            await session.flush()
            await session.commit()

            yield {
                "event": "error",
                "data": json.dumps({"detail": str(e)}),
            }

    return EventSourceResponse(event_generator())


@router.get("/analyze/{analysis_id}/pdf")
async def export_analysis_pdf(
    analysis_id: UUID,
    session: AsyncSession = Depends(get_session),
):
    """Export an analysis report as a downloadable PDF."""
    analysis = await session.get(JobAnalysis, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    pdf_bytes = generate_analysis_pdf(analysis)

    company = analysis.company_name or "Company"
    title = analysis.job_title or "Position"
    filename = f"NextHire_{company}_{title}.pdf".replace(" ", "_")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
