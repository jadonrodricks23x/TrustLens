import os
import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from models.schemas import AnalysisResult, SignalItem
from services.mock_service import generate_mock_analysis

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

SYSTEM_PROMPT = (
    "You are TrustLens AI, an explainable digital safety assistant. "
    "Analyze the provided content for suspicious or misleading signals. "
    "Do not claim certainty. Return only the requested JSON. Be concise.\n"
    "Score scale: 0-30 LOW CONCERN, 31-60 NEEDS VERIFICATION, 61-80 SUSPICIOUS, 81-100 HIGH RISK INDICATORS.\n"
    "JSON Schema:\n"
    "{\n"
    '  "score": integer (0-100),\n'
    '  "risk_level": "LOW CONCERN" | "NEEDS VERIFICATION" | "SUSPICIOUS" | "HIGH RISK INDICATORS",\n'
    '  "verdict": string (short assessment phrase),\n'
    '  "signals": [\n'
    '    {"name": string, "severity": "low"|"medium"|"high", "reason": string (15-25 words)}\n'
    "  ],\n"
    '  "summary": string (~40 words or less),\n'
    '  "recommendation": string (~30 words or less)\n'
    "}\n"
    "Limit signals to at most 5 items."
)

async def analyze_with_ai(
    content: str,
    analysis_type: str,
    local_signals: List[Dict[str, Any]]
) -> AnalysisResult:
    """
    Sends deterministic local signals + minimal user content to AI model in exactly ONE call.
    Falls back to deterministic local mock service if no API key is provided or on network error.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()

    # If no API key configured, use the deterministic local fallback/mock service
    if not api_key:
        return generate_mock_analysis(content, analysis_type, local_signals, is_fallback=False)

    user_payload = {
        "analysis_type": analysis_type,
        "content_snippet": content[:2500], # Keep concise for token conservation
        "locally_detected_signals": local_signals[:5]
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    body = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(user_payload)}
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{OPENAI_BASE_URL}/chat/completions",
                headers=headers,
                json=body
            )
            
            if resp.status_code != 200:
                # Log error without logging full user content
                print(f"[AI Service Error] HTTP status {resp.status_code}: {resp.text[:200]}")
                # Fall back to pattern-based signals
                return generate_mock_analysis(content, analysis_type, local_signals, is_fallback=True)

            data = resp.json()
            raw_text = data["choices"][0]["message"]["content"]
            parsed = json.loads(raw_text)

            # Validate and clamp score
            score = int(parsed.get("score", 50))
            score = max(0, min(100, score))

            # Validate risk band
            if score <= 30:
                risk_level = "LOW CONCERN"
            elif score <= 60:
                risk_level = "NEEDS VERIFICATION"
            elif score <= 80:
                risk_level = "SUSPICIOUS"
            else:
                risk_level = "HIGH RISK INDICATORS"

            signals_list = []
            for s in parsed.get("signals", [])[:5]:
                severity = str(s.get("severity", "medium")).lower()
                if severity not in ("low", "medium", "high"):
                    severity = "medium"
                signals_list.append(SignalItem(
                    name=str(s.get("name", "Flagged Signal"))[:50],
                    severity=severity,
                    reason=str(s.get("reason", "Suspicious pattern identified."))[:200]
                ))

            # If AI returned no signals, include local signals or neutral note
            if not signals_list:
                for ls in local_signals[:3]:
                    signals_list.append(SignalItem(
                        name=ls["name"],
                        severity=ls["severity"],
                        reason=ls["reason"]
                    ))

            return AnalysisResult(
                id=str(uuid.uuid4()),
                type=analysis_type,
                score=score,
                risk_level=risk_level,
                verdict=str(parsed.get("verdict", "Analysis complete"))[:100],
                signals=signals_list,
                summary=str(parsed.get("summary", "Assessment generated based on content signals."))[:300],
                recommendation=str(parsed.get("recommendation", "Exercise caution and verify independently."))[:250],
                created_at=datetime.now(timezone.utc).isoformat(),
                is_mock=False,
                local_signals_only=False
            )

    except Exception as e:
        print(f"[AI Service Exception] {type(e).__name__}: {str(e)[:150]}")
        # Fall back to local pattern analysis if AI fails
        return generate_mock_analysis(content, analysis_type, local_signals, is_fallback=True)
