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

    Args:
        job_keywords: Keywords from job posting.
        cv_keywords: Keywords from CV.

    Returns:
        Dict with 'matched', 'missing', and 'match_percentage' keys.
    """
    job_set = {kw.lower() for kw in job_keywords}
    cv_set = {kw.lower() for kw in cv_keywords}

    matched = job_set & cv_set
    missing = job_set - cv_set

    match_pct = (len(matched) / len(job_set) * 100) if job_set else 0

    return {
        "matched": sorted(matched),
        "missing": sorted(missing),
        "match_percentage": round(match_pct, 1),
    }
