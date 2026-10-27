from fastapi import APIRouter, Request, HTTPException, status
from models.schemas import NewsRequest, AnalysisResult
from utils.news_analyzer import analyze_news_locally
from utils.rate_limiter import rate_limiter
from services.ai_service import analyze_with_ai

router = APIRouter(prefix="/api/analyze", tags=["News Analyzer"])

@router.post("/news", response_model=AnalysisResult)
async def analyze_news(payload: NewsRequest, request: Request):
    rate_limiter.check(request)
    
    content = payload.content.strip()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="News claim or article content cannot be empty."
        )

    # 1. Local deterministic signal detection
    local_signals = analyze_news_locally(content)

    # 2. AI Assessment (1 single optimized call with fallback)
    result = await analyze_with_ai(content, "news", local_signals)
    return result
