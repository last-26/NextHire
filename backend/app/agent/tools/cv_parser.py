"""CV parsing tool - extracts text from PDF and DOCX files."""

import io

import fitz  # PyMuPDF
from docx import Document


def parse_cv(content: bytes, filename: str) -> dict:
    """Parse a CV file and extract text content.

    Args:
        content: Raw file bytes.
        filename: Original filename (used to detect format).

    Returns:
        Dict with 'text' and 'metadata' keys.
    """
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if ext == "pdf":
        return _parse_pdf(content)
    elif ext in ("docx", "doc"):
        return _parse_docx(content)
    else:
        return {"text": content.decode("utf-8", errors="ignore"), "metadata": {"format": "text"}}


def _parse_pdf(content: bytes) -> dict:
    """Extract text from a PDF file."""
    doc = fitz.open(stream=content, filetype="pdf")
    pages = []
    full_text = []

    for page_num, page in enumerate(doc):
        text = page.get_text()
        pages.append({"page": page_num + 1, "text": text})
        full_text.append(text)

    doc.close()

    return {
        "text": "\n\n".join(full_text),
        "metadata": {
            "format": "pdf",
            "page_count": len(pages),
            "pages": pages,
        },
    }


def _parse_docx(content: bytes) -> dict:
    """Extract text from a DOCX file."""
    doc = Document(io.BytesIO(content))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]

    return {
        "text": "\n".join(paragraphs),
        "metadata": {
            "format": "docx",
            "paragraph_count": len(paragraphs),
        },
    }
