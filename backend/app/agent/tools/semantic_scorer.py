"""Semantic similarity scorer using sentence-transformers."""

import numpy as np
from sentence_transformers import SentenceTransformer

# Lazy-loaded model singleton
_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    """Get or initialize the sentence transformer model."""
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def compute_semantic_similarity(text_a: str, text_b: str) -> float:
    """Compute cosine similarity between two texts.

    Args:
        text_a: First text (e.g., job description).
        text_b: Second text (e.g., CV content).

    Returns:
        Similarity score between 0 and 1.
    """
    model = _get_model()
    embeddings = model.encode([text_a, text_b])
    similarity = np.dot(embeddings[0], embeddings[1]) / (
        np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
    )
    return float(max(0, min(1, similarity)))


def compute_section_similarities(
    job_sections: dict[str, str], cv_sections: dict[str, str]
) -> dict[str, float]:
    """Compute semantic similarity for each matching section.

    Args:
        job_sections: Dict of section_name -> text from job posting.
        cv_sections: Dict of section_name -> text from CV.

    Returns:
        Dict of section_name -> similarity score.
    """
    results = {}
    for section, job_text in job_sections.items():
        if section in cv_sections and cv_sections[section]:
            score = compute_semantic_similarity(job_text, cv_sections[section])
            results[section] = round(score, 4)
    return results


def compute_weighted_score(
    semantic_score: float,
    keyword_match_pct: float,
    weights: dict[str, float] | None = None,
) -> float:
    """Compute weighted ATS compatibility score.

    Args:
        semantic_score: Semantic similarity (0-1).
        keyword_match_pct: Keyword match percentage (0-100).
        weights: Optional custom weights.

    Returns:
        Weighted score (0-100).
    """
    if weights is None:
        weights = {"semantic": 0.4, "keyword": 0.6}

    score = (
        semantic_score * 100 * weights["semantic"]
        + keyword_match_pct * weights["keyword"]
    )
    return round(min(100, max(0, score)), 1)
