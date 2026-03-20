from fastapi import APIRouter, File, UploadFile

from app.agent.tools.cv_parser import parse_cv

router = APIRouter()


@router.post("/cv-review")
async def review_cv(cv_file: UploadFile = File(...)):
    """Parse and review a CV file (PDF or DOCX)."""
    content = await cv_file.read()
    filename = cv_file.filename or "unknown"

    parsed = parse_cv(content, filename)
    return {"filename": filename, "parsed": parsed}
