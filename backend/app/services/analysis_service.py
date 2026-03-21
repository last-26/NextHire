from datetime import datetime

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.graph import agent_graph
from app.agent.tools.cv_parser import parse_cv as parse_cv_file
from app.models.agent_run import AgentRun
from app.models.application import Application
from app.models.cover_letter import CoverLetter
from app.models.job_analysis import JobAnalysis


class AnalysisService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def run_analysis(
        self,
        job_description: str,
        cv_file: UploadFile,
        job_url: str | None = None,
    ) -> JobAnalysis:
        """Orchestrate a full agent analysis run."""
        # Create agent run record
        agent_run = AgentRun(status="running")
        self.session.add(agent_run)
        await self.session.flush()

        # Read CV file bytes and create analysis record
        cv_content_bytes = await cv_file.read()
        analysis = JobAnalysis(
            job_description=job_description,
            job_url=job_url,
            cv_filename=cv_file.filename,
            agent_run_id=agent_run.id,
        )
        self.session.add(analysis)
        await self.session.flush()

        try:
            # Parse CV file to text
            cv_parsed = parse_cv_file(cv_content_bytes, cv_file.filename or "cv.pdf")
            cv_text = cv_parsed["text"]

            # Run LangGraph agent pipeline
            initial_state = {
                "job_description": job_description,
                "job_url": job_url,
                "cv_content": cv_text,
                "cv_filename": cv_file.filename or "cv",
                "agent_run_id": str(agent_run.id),
                "steps_log": [],
                "reflection_count": 0,
            }

            result = await agent_graph.ainvoke(initial_state)

            # Update analysis with agent results
            analysis.parsed_job = result.get("parsed_job")
            analysis.parsed_cv = result.get("parsed_cv")
            analysis.match_result = result.get("match_result")
            analysis.gap_analysis = result.get("gap_analysis")
            analysis.overall_score = result.get("overall_score")

            # Set job title and company from parsed data
            if analysis.parsed_job:
                analysis.job_title = analysis.parsed_job.get("title")
                analysis.company_name = analysis.parsed_job.get("company")

            # Create cover letter record if generated
            cover_letter_text = result.get("cover_letter")
            cover_letter_record = None
            if cover_letter_text:
                cover_letter_record = CoverLetter(
                    analysis_id=analysis.id,
                    content=cover_letter_text,
                    tone=result.get("cover_letter_tone", "professional"),
                )
                self.session.add(cover_letter_record)
                await self.session.flush()

            # Auto-create application for kanban tracking
            application = Application(
                company_name=analysis.company_name or "Unknown Company",
                position_title=analysis.job_title or "Untitled Position",
                job_url=job_url,
                status="wishlist",
                priority="medium",
                match_score=analysis.overall_score,
                analysis_id=analysis.id,
                cover_letter_id=cover_letter_record.id if cover_letter_record else None,
            )
            self.session.add(application)

            # Update agent run as completed
            agent_run.status = "completed"
            agent_run.steps = result.get("steps_log", [])
            agent_run.completed_at = datetime.utcnow()

        except Exception as e:
            agent_run.status = "failed"
            agent_run.error_message = str(e)
            agent_run.completed_at = datetime.utcnow()

        await self.session.flush()
        await self.session.refresh(analysis)

        return analysis
