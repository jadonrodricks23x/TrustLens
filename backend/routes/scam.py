from fastapi import APIRouter, Request, HTTPException, status
from models.schemas import ScamRequest, AnalysisResult
from utils.scam_analyzer import analyze_scam_locally
from utils.rate_limiter import rate_limiter
from services.ai_service import analyze_with_ai

router = APIRouter(prefix="/api/analyze", tags=["Scam Analyzer"])

@router.post("/scam", response_model=AnalysisResult)
async def analyze_scam(payload: ScamRequest, request: Request):
    rate_limiter.check(request)
    
    content = payload.content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty."
        )

    # 1. Local deterministic signal detection
    local_signals = analyze_scam_locally(content)

    # 2. AI Assessment (1 single optimized call with fallback)
    result = await analyze_with_ai(content, "scam", local_signals)
    return result
