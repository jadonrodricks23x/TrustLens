from fastapi import APIRouter, Request, HTTPException, status
from models.schemas import UrlRequest, AnalysisResult
from utils.url_analyzer import analyze_url_locally
from utils.rate_limiter import rate_limiter
from services.ai_service import analyze_with_ai

router = APIRouter(prefix="/api/analyze", tags=["URL Checker"])

@router.post("/url", response_model=AnalysisResult)
async def analyze_url(payload: UrlRequest, request: Request):
    rate_limiter.check(request)
    
    raw_url = payload.url.strip()
    if not raw_url or len(raw_url) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid URL string to inspect."
        )

    # 1. Local deterministic checks (safe, no crawling)
    local_signals, meta = analyze_url_locally(raw_url)

    # 2. AI Assessment (1 single optimized call with fallback)
    result = await analyze_with_ai(raw_url, "url", local_signals)
    return result
