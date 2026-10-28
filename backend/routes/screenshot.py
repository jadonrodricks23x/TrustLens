from fastapi import APIRouter, Request, UploadFile, File, HTTPException, status
from models.schemas import AnalysisResult
from services.ocr_service import validate_image_upload, extract_text_from_image_bytes
from utils.scam_analyzer import analyze_scam_locally
from utils.news_analyzer import analyze_news_locally
from utils.rate_limiter import rate_limiter
from services.gemini_service import analyze_with_gemini

router = APIRouter(prefix="/api/analyze", tags=["Screenshot Analyzer"])

@router.post("/screenshot", response_model=AnalysisResult)
async def analyze_screenshot(
    request: Request,
    file: UploadFile = File(...)
):
    rate_limiter.check(request)

    # Read bytes in memory
    contents = await file.read()
    file_size = len(contents)
    content_type = file.content_type or "image/png"

    # Normalize jpeg
    if content_type == "image/jpg":
        content_type = "image/jpeg"

    # Validate image upload (type & <= 5MB)
    err = validate_image_upload(content_type, file_size)
    if err:
        status_code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE if "exceeds" in err else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=err)

    # 1. Deterministic OCR extraction attempt in memory
    extracted_text, used_ocr = extract_text_from_image_bytes(contents)

    combined_signals = []
    if extracted_text and len(extracted_text.strip()) > 8:
        scam_signals = analyze_scam_locally(extracted_text)
        news_signals = analyze_news_locally(extracted_text)
        combined_signals = scam_signals + [s for s in news_signals if s["name"] not in [x["name"] for x in scam_signals]]
    else:
        combined_signals = [{
            "name": "Visual Document / Screenshot",
            "severity": "low",
            "reason": "Image submitted for visual multimodal inspection and forensic threat analysis."
        }]

    # 2. Analyze via centralized Gemini service with multimodal image payload
    result = await analyze_with_gemini(
        content=extracted_text if extracted_text else f"Screenshot image: {file.filename or 'image'}",
        analysis_type="screenshot",
        local_signals=combined_signals[:5],
        image_bytes=contents,
        mime_type=content_type
    )

    return result
