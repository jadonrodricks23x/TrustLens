"""
Centralized AI & Live Web Fact-Checking Service for TrustLens AI.
- News claims: Powered by Keyless Live Internet Verification (Google News RSS + Wikipedia REST API)
  for 100% reliable real-time fact-checking without token limits or quota blocks.
- Scam, URL, & Screenshot: Powered by Google Gemini API with robust local safety fallback.
"""
import asyncio
from typing import List, Dict, Any, Optional
from models.schemas import AnalysisResult
from services.gemini_service import analyze_with_gemini
from services.keyless_fact_checker import verify_news_with_live_web

async def analyze_with_ai(
    content: str,
    analysis_type: str,
    local_signals: List[Dict[str, Any]],
    image_bytes: Optional[bytes] = None,
    mime_type: Optional[str] = None
) -> AnalysisResult:
    """
    Analyzes digital content using real-time web intelligence and explainable signals.
    """
    if analysis_type == "news" and not image_bytes:
        # 100% token-free, quota-free live web fact-checking
        loop = asyncio.get_event_loop()
        try:
            return await loop.run_in_executor(
                None,
                lambda: verify_news_with_live_web(content, local_signals)
            )
        except Exception as e:
            print(f"[News Fact Check Warning] {e}. Trying Gemini analysis as fallback.")
            return await analyze_with_gemini(
                content=content,
                analysis_type=analysis_type,
                local_signals=local_signals
            )

    return await analyze_with_gemini(
        content=content,
        analysis_type=analysis_type,
        local_signals=local_signals,
        image_bytes=image_bytes,
        mime_type=mime_type
    )
