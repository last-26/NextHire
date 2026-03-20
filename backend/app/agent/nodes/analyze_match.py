"""Analyze match node - computes ATS compatibility score."""

import json
import time

from app.agent.state import AgentState
from app.agent.tools.keyword_extractor import find_skill_matches
from app.agent.tools.semantic_scorer import (
    compute_semantic_similarity,
    compute_weighted_score,
)
from app.llm.router import ModelRouter

ANALYSIS_PROMPT = """You are an expert ATS (Applicant Tracking System) analyst.

Given the following parsed job posting and CV data, provide a detailed match analysis.

Job Posting:
{parsed_job}

CV:
{parsed_cv}

Semantic Similarity Score: {semantic_score}/1.0
Keyword Match: {keyword_match_pct}%
Matched Skills: {matched_skills}
Missing Skills: {missing_skills}

Provide a JSON response with:
- overall_assessment: Brief assessment of the candidate's fit (2-3 sentences)
- strengths: List of areas where the candidate is a strong match
- weaknesses: List of areas where the candidate falls short
- ats_tips: List of specific tips to improve ATS score
- experience_match: How well experience level matches (low/medium/high)
- education_match: How well education matches (low/medium/high)
- culture_fit_indicators: Any indicators of culture fit from the CV

Return ONLY valid JSON."""


async def analyze_match(state: AgentState) -> dict:
    """Compute semantic + keyword matching and ATS score."""
    start = time.time()

    # Compute semantic similarity
    job_text = state["job_description"]
    cv_text = state["cv_content"]
    semantic_score = compute_semantic_similarity(job_text, cv_text)

    # Compute keyword matches
    job_kw = [k["keyword"] for k in state.get("job_keywords", [])]
    cv_kw = [k["keyword"] for k in state.get("cv_keywords", [])]
    skill_match = find_skill_matches(job_kw, cv_kw)

    # Compute weighted ATS score
    overall_score = compute_weighted_score(semantic_score, skill_match["match_percentage"])

    # Get LLM analysis
    router = ModelRouter()
    messages = [
        {"role": "system", "content": "You are an expert ATS analyst. Return only valid JSON."},
        {
            "role": "user",
            "content": ANALYSIS_PROMPT.format(
                parsed_job=json.dumps(state.get("parsed_job", {}), indent=2),
                parsed_cv=json.dumps(state.get("parsed_cv", {}), indent=2),
                semantic_score=round(semantic_score, 3),
                keyword_match_pct=skill_match["match_percentage"],
                matched_skills=", ".join(skill_match["matched"]),
                missing_skills=", ".join(skill_match["missing"]),
            ),
        },
    ]

    response = await router.invoke("analyze_match", messages, temperature=0.3)

    try:
        llm_analysis = json.loads(response)
    except json.JSONDecodeError:
        start_idx = response.find("{")
        end_idx = response.rfind("}") + 1
        if start_idx != -1 and end_idx > start_idx:
            llm_analysis = json.loads(response[start_idx:end_idx])
        else:
            llm_analysis = {"error": "Failed to parse analysis"}

    match_result = {
        "semantic_score": round(semantic_score, 4),
        "keyword_match": skill_match,
        "overall_score": overall_score,
        "llm_analysis": llm_analysis,
    }

    duration_ms = int((time.time() - start) * 1000)

    return {
        "match_result": match_result,
        "overall_score": overall_score,
        "current_step": "analyze_match",
        "steps_log": state.get("steps_log", []) + [
            {
                "step": "analyze_match",
                "status": "completed",
                "duration_ms": duration_ms,
                "output_summary": f"ATS Score: {overall_score}/100",
            }
        ],
    }
