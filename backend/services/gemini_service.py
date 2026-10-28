import os
import json
import uuid
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from models.schemas import AnalysisResult, SignalItem
from services.mock_service import generate_mock_analysis

SYSTEM_INSTRUCTION = (
    "You are TrustLens AI, an explainable digital safety assistant. "
    "Analyze the provided content for suspicious, misleading, or fraudulent signals. "
    "Do not claim certainty. Explain the signals clearly and concisely. "
    "Return ONLY structured JSON conforming strictly to the requested schema.\n\n"
    "Score scale:\n"
    "0-30: Low Concern (standard communication patterns)\n"
    "31-60: Needs Verification (atypical wording, missing context, or minor ambiguities)\n"
    "61-80: Suspicious (multiple deceptive patterns, redirection tricks, or pressure)\n"
    "81-100: High Risk Indicators (prominent fraud, credential/OTP theft, wire transfer coercion)\n\n"
    "JSON Schema:\n"
    "{\n"
    '  "trust_score": integer (0-100),\n'
    '  "risk_level": "LOW CONCERN" | "NEEDS VERIFICATION" | "SUSPICIOUS" | "HIGH RISK INDICATORS",\n'
    '  "verdict": string (short assessment phrase, max 10 words),\n'
    '  "signals": [\n'
    '    {\n'
    '      "name": string (short signal name, max 5 words),\n'
    '      "severity": "low" | "medium" | "high",\n'
    '      "reason": string (15-25 words explaining why this signal was flagged)\n'
    '    }\n'
    "  ],\n"
    '  "explanation": string (concise summary ~40 words or less),\n'
    '  "recommendation": string (practical advice ~30 words or less)\n'
    "}\n"
    "Provide at most 5 signals."
)

def _get_risk_level_from_score(score: int) -> str:
    if score <= 30:
        return "LOW CONCERN"
    elif score <= 60:
        return "NEEDS VERIFICATION"
    elif score <= 80:
        return "SUSPICIOUS"
    else:
        return "HIGH RISK INDICATORS"

def _clean_json_text(raw_text: str) -> str:
    """Strip markdown code block fences if returned by model."""
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        # Remove first line (e.g. ```json or ```)
        cleaned = re.sub(r"^```[a-zA-Z0-9_-]*\n?", "", cleaned)
        # Remove trailing ```
        cleaned = re.sub(r"\n?```$", "", cleaned)
    return cleaned.strip()

async def analyze_with_gemini(
    content: str,
    analysis_type: str,
    local_signals: List[Dict[str, Any]],
    image_bytes: Optional[bytes] = None,
    mime_type: Optional[str] = None
) -> AnalysisResult:
    """
    Centralized Gemini API analysis service using the official google-genai SDK.
    Supports fast text analysis and multimodal image/screenshot analysis.
    Gracefully falls back to local deterministic mock analysis if GEMINI_API_KEY is not configured or fails.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    model_name = os.getenv("GEMINI_MODEL", "").strip() or "gemini-2.5-flash"

    # Fallback to local mock engine if key is absent (Mock Development Mode)
    if not api_key:
        return generate_mock_analysis(content, analysis_type, local_signals, is_fallback=False)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        # Build prompt payload
        prompt_payload = {
            "analysis_type": analysis_type,
            "content_snippet": content[:3000] if content else "",
            "locally_detected_signals": local_signals[:5]
        }

        contents_list = []

        # If multimodal image provided, add image Part
        if image_bytes and mime_type:
            contents_list.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))

        prompt_str = (
            f"Analyze this {analysis_type} input for potential threats, scams, misinformation, or deceptive patterns.\n"
            f"Input Telemetry:\n{json.dumps(prompt_payload, indent=2)}"
        )
        contents_list.append(types.Part.from_text(text=prompt_str))

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.2,
        )

        # Call Gemini in a non-blocking thread
        import asyncio
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model=model_name,
                contents=contents_list,
                config=config,
            )
        )

        if not response or not response.text:
            raise ValueError("Empty response received from Gemini model.")

        raw_json = _clean_json_text(response.text)
        parsed = json.loads(raw_json)

        # Extract & clamp score
        raw_score = parsed.get("trust_score", parsed.get("score", 50))
        try:
            score = int(raw_score)
        except (ValueError, TypeError):
            score = 50
        score = max(0, min(100, score))

        # Risk level
        risk_level = _get_risk_level_from_score(score)

        # Verdict
        verdict = str(parsed.get("verdict", "")).strip()
        if not verdict:
            verdict = {
                "LOW CONCERN": "Standard communication patterns",
                "NEEDS VERIFICATION": "Potential ambiguities requiring verification",
                "SUSPICIOUS": "Multiple warning signals detected",
                "HIGH RISK INDICATORS": "High-risk threat indicators observed"
            }[risk_level]

        # Signals
        signals_list: List[SignalItem] = []
        raw_signals = parsed.get("signals", [])
        if isinstance(raw_signals, list):
            for s in raw_signals[:5]:
                if isinstance(s, dict):
                    name = str(s.get("name", "Identified Signal"))[:60]
                    severity = str(s.get("severity", "medium")).lower()
                    if severity not in ("low", "medium", "high"):
                        severity = "medium"
                    reason = str(s.get("reason", "Suspicious indicator identified in content."))[:250]
                    signals_list.append(SignalItem(name=name, severity=severity, reason=reason))
                elif isinstance(s, str):
                    signals_list.append(SignalItem(name=s[:50], severity="medium", reason=s[:200]))

        # If Gemini returned no signals, supplement with locally detected signals
        if not signals_list:
            for ls in local_signals[:3]:
                signals_list.append(SignalItem(
                    name=ls["name"],
                    severity=ls.get("severity", "medium"),
                    reason=ls.get("reason", "Detected pattern indicator.")
                ))

        # Summary / Explanation
        explanation = str(parsed.get("explanation", parsed.get("summary", "Assessment generated from content signals."))).strip()
        if not explanation:
            explanation = "Content analyzed with explainable risk indicators."

        # Recommendation
        recommendation = str(parsed.get("recommendation", "Exercise caution and independently verify unexpected requests.")).strip()

        return AnalysisResult(
            id=str(uuid.uuid4()),
            type=analysis_type,
            score=score,
            trust_score=score,
            risk_level=risk_level,
            verdict=verdict,
            signals=signals_list,
            summary=explanation,
            explanation=explanation,
            recommendation=recommendation,
            created_at=datetime.now(timezone.utc).isoformat(),
            is_mock=False,
            local_signals_only=False
        )

    except Exception as e:
        # Never log raw user content or secrets. Log only error type and sanitized message.
        err_type = type(e).__name__
        print(f"[Gemini Service Warning] {err_type}: Falling back to deterministic local analysis.")
        return generate_mock_analysis(content, analysis_type, local_signals, is_fallback=True)
