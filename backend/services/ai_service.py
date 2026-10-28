"""
Centralized AI service router for TrustLens AI.
Delegates all AI analysis to the official Google Gemini API service (services/gemini_service.py).
"""
from typing import List, Dict, Any, Optional
from models.schemas import AnalysisResult
from services.gemini_service import analyze_with_gemini

async def analyze_with_ai(
    content: str,
    analysis_type: str,
    local_signals: List[Dict[str, Any]],
    image_bytes: Optional[bytes] = None,
    mime_type: Optional[str] = None
) -> AnalysisResult:
    """
    Analyzes content using Google Gemini API with deterministic local signal telemetry.
    Supports both text and multimodal image inputs.
    """
    return await analyze_with_gemini(
        content=content,
        analysis_type=analysis_type,
        local_signals=local_signals,
        image_bytes=image_bytes,
        mime_type=mime_type
    )
