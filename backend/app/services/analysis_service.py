from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent_run import AgentRun
from app.models.job_analysis import JobAnalysis
from app.schemas.job_analysis import JobAnalysisResponse


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

        # Create analysis record
        cv_content = await cv_file.read()
        analysis = JobAnalysis(
            job_description=job_description,
            job_url=job_url,
            cv_filename=cv_file.filename,
            agent_run_id=agent_run.id,
        )
        self.session.add(analysis)
        await self.session.flush()

        # TODO: Run LangGraph agent pipeline
        # agent_result = await run_agent_graph(job_description, cv_content, ...)
        # analysis.parsed_job = agent_result["parsed_job"]
        # analysis.parsed_cv = agent_result["parsed_cv"]
        # analysis.match_result = agent_result["match_result"]
        # analysis.gap_analysis = agent_result["gap_analysis"]
        # analysis.overall_score = agent_result["overall_score"]

        agent_run.status = "completed"
        await self.session.flush()
        await self.session.refresh(analysis)

        return analysis
