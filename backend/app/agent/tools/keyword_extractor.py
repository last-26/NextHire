"""Keyword extraction tool using TF-IDF."""

import re

from sklearn.feature_extraction.text import TfidfVectorizer


def extract_keywords(text: str, top_n: int = 20) -> list[dict]:
    """Extract top keywords from text using TF-IDF.

    Args:
        text: Input text to extract keywords from.
        top_n: Number of top keywords to return.

    Returns:
        List of dicts with 'keyword' and 'score' keys.
    """
    # Clean text
    clean = re.sub(r"[^\w\s]", " ", text.lower())
    clean = re.sub(r"\s+", " ", clean).strip()

    if not clean:
        return []

    # Use TF-IDF with unigrams and bigrams
    vectorizer = TfidfVectorizer(
        max_features=100,
        ngram_range=(1, 2),
        stop_words="english",
        min_df=1,
    )

    try:
        tfidf_matrix = vectorizer.fit_transform([clean])
    except ValueError:
        return []

    feature_names = vectorizer.get_feature_names_out()
    scores = tfidf_matrix.toarray()[0]

    # Sort by score descending
    keyword_scores = sorted(
        zip(feature_names, scores), key=lambda x: x[1], reverse=True
    )

    return [
        {"keyword": kw, "score": round(float(score), 4)}
        for kw, score in keyword_scores[:top_n]
        if score > 0
    ]


def find_skill_matches(job_keywords: list[str], cv_keywords: list[str]) -> dict:
    """Find matching and missing skills between job and CV keywords.

    Uses fuzzy matching: a job skill is considered matched if it appears
    as a substring in any CV skill or vice versa (case-insensitive).
    For example, "React" matches "React.js", "JavaScript" matches "JavaScript/TypeScript".

    Args:
        job_keywords: Keywords from job posting.
        cv_keywords: Keywords from CV.

    Returns:
        Dict with 'matched', 'missing', and 'match_percentage' keys.
    """
    if not job_keywords:
        return {"matched": [], "missing": [], "match_percentage": 0.0}

    job_lower = [kw.lower().strip() for kw in job_keywords if kw.strip()]
    cv_lower = [kw.lower().strip() for kw in cv_keywords if kw.strip()]

    matched = []
    missing = []

    for job_skill in job_lower:
        found = False
        # Check exact match first
        if job_skill in cv_lower:
            found = True
        else:
            # Check substring match (either direction)
            for cv_skill in cv_lower:
                if job_skill in cv_skill or cv_skill in job_skill:
                    found = True
                    break
        if found:
            matched.append(job_skill)
        else:
            missing.append(job_skill)

    match_pct = (len(matched) / len(job_lower) * 100) if job_lower else 0

    return {
        "matched": sorted(set(matched)),
        "missing": sorted(set(missing)),
        "match_percentage": round(match_pct, 1),
    }
