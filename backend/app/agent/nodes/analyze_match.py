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

ANALYSIS_PROMPT = """You are an expert ATS (Applicant Tracking System) analyst and hiring consultant.

Given the following parsed job posting and CV data, provide a detailed match analysis.

Job Posting:
{parsed_job}

CV:
{parsed_cv}

Algorithmic Metrics (for reference only — use your own judgment):
- Semantic Similarity: {semantic_score}/1.0
- Keyword Skill Match: {skill_match_pct}% ({matched_count}/{total_skills} skills)
- Matched Skills: {matched_skills}
- Missing Skills: {missing_skills}

Provide a JSON response with:
- llm_score: Your overall compatibility score (0-100 integer). Consider ALL of the following:
  * Direct skill matches AND transferable/related skills (e.g., Vue.js experience partially covers React requirement)
  * Experience depth and relevance (years, seniority level, domain match)
  * Education fit
  * Industry and role alignment
  * Soft skills and cultural indicators
  * How competitive this candidate would realistically be for this role
  Do NOT just echo the algorithmic metrics above. Use your own holistic judgment.
- score_reasoning: One paragraph explaining why you gave this score
- overall_assessment: Brief assessment of the candidate's fit (2-3 sentences)
- strengths: List of areas where the candidate is a strong match
- weaknesses: List of areas where the candidate falls short
- ats_tips: List of specific tips to improve ATS score for this specific job
- experience_match: How well experience level matches (low/medium/high)
- education_match: How well education matches (low/medium/high)
- culture_fit_indicators: Any indicators of culture fit from the CV
- transferable_skills: List of candidate skills that are not exact matches but are relevant/transferable

Return ONLY valid JSON."""


async def analyze_match(state: AgentState) -> dict:
    """Compute semantic + keyword matching and ATS score."""
    start = time.time()

    # Compute semantic similarity
    job_text = state["job_description"]
    cv_text = state["cv_content"]
    semantic_score = compute_semantic_similarity(job_text, cv_text)

    # Use LLM-parsed skills for matching (much more accurate than TF-IDF bigrams)
    parsed_job = state.get("parsed_job", {})
    parsed_cv = state.get("parsed_cv", {})

    job_skills = (
        parsed_job.get("required_skills", [])
        + parsed_job.get("preferred_skills", [])
    )
    cv_skills = parsed_cv.get("skills", [])

    # If parsed skills are available, use them; otherwise fall back to TF-IDF keywords
    if job_skills and cv_skills:
        skill_match = find_skill_matches(job_skills, cv_skills)
    else:
        job_kw = [k["keyword"] for k in state.get("job_keywords", [])]
        cv_kw = [k["keyword"] for k in state.get("cv_keywords", [])]
        skill_match = find_skill_matches(job_kw, cv_kw)

    # Compute algorithmic ATS score (used as one input to hybrid score)
    algorithmic_score = compute_weighted_score(
        semantic_score, skill_match["match_percentage"]
    )

    # Get LLM analysis + LLM score
    router = ModelRouter()
    messages = [
        {
            "role": "system",
            "content": "You are an expert ATS analyst and hiring consultant. "
            "Return only valid JSON.",
        },
        {
            "role": "user",
            "content": ANALYSIS_PROMPT.format(
                parsed_job=json.dumps(parsed_job, indent=2),
                parsed_cv=json.dumps(parsed_cv, indent=2),
                semantic_score=round(semantic_score, 3),
                skill_match_pct=skill_match["match_percentage"],
                matched_count=len(skill_match["matched"]),
                total_skills=len(skill_match["matched"]) + len(skill_match["missing"]),
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

    # Hybrid scoring: algorithmic (50%) + LLM judgment (50%)
    llm_score = llm_analysis.get("llm_score")
    if isinstance(llm_score, int | float) and 0 <= llm_score <= 100:
        # Hybrid: algorithmic grounds the score, LLM adds nuance
        overall_score = round(algorithmic_score * 0.5 + float(llm_score) * 0.5, 1)
    else:
        # Fallback to pure algorithmic if LLM didn't return a valid score
        overall_score = algorithmic_score

    match_result = {
        "semantic_score": round(semantic_score, 4),
        "keyword_match": skill_match,
        "algorithmic_score": algorithmic_score,
        "llm_score": llm_score,
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
