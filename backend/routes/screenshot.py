from fastapi import APIRouter, Request, UploadFile, File, HTTPException, status
from models.schemas import AnalysisResult
from services.ocr_service import validate_image_upload, extract_text_from_image_bytes
from utils.scam_analyzer import analyze_scam_locally
from utils.news_analyzer import analyze_news_locally
from utils.rate_limiter import rate_limiter
from services.ai_service import analyze_with_ai
from services.mock_service import generate_mock_analysis

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
    content_type = file.content_type or ""

    # Validate image upload
    err = validate_image_upload(content_type, file_size)
    if err:
        status_code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE if "exceeds" in err else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=err)

    # 1. Extract text via OCR without saving to disk
    extracted_text, used_ocr = extract_text_from_image_bytes(contents)

    if extracted_text and len(extracted_text.strip()) > 8:
        # Detected textual contents
        scam_signals = analyze_scam_locally(extracted_text)
        news_signals = analyze_news_locally(extracted_text)
        combined_signals = scam_signals + [s for s in news_signals if s["name"] not in [x["name"] for x in scam_signals]]
        
        result = await analyze_with_ai(extracted_text, "screenshot", combined_signals[:5])
        return result
    else:
        # Fallback when OCR yields little or no text
        signals = [{
            "name": "Visual Structure / Low Contrast Text",
            "severity": "low",
            "reason": "Textual content in the image could not be automatically extracted via high-contrast OCR."
        }]
        return generate_mock_analysis(
            content=f"Uploaded image: {file.filename or 'screenshot'}",
            analysis_type="screenshot",
            signals=signals,
            is_fallback=True
        )
