"""Job posting scraper tool - fetches and cleans job posting text from URLs."""

import httpx
from bs4 import BeautifulSoup


async def scrape_job_posting(url: str) -> dict:
    """Fetch a job posting URL and extract the main text content.

    Args:
        url: The job posting URL.

    Returns:
        Dict with 'text', 'title', and 'metadata' keys.
    """
    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=30.0,
        headers={"User-Agent": "Mozilla/5.0 (compatible; NextHire/1.0)"},
    ) as client:
        response = await client.get(url)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove script and style elements
    for element in soup(["script", "style", "nav", "footer", "header"]):
        element.decompose()

    # Try to find the page title
    title = ""
    title_tag = soup.find("title")
    if title_tag:
        title = title_tag.get_text(strip=True)

    # Extract main text content
    # Try common job posting containers first
    main_content = None
    for selector in ["main", "article", "[role='main']", ".job-description", "#job-description"]:
        main_content = soup.select_one(selector)
        if main_content:
            break

    if main_content is None:
        main_content = soup.find("body") or soup

    text = main_content.get_text(separator="\n", strip=True)

    # Clean up excessive whitespace
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    clean_text = "\n".join(lines)

    return {
        "text": clean_text,
        "title": title,
        "metadata": {
            "url": url,
            "content_length": len(clean_text),
        },
    }
