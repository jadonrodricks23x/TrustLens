import os
import json
import uuid
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from models.schemas import AnalysisResult, SignalItem
from services.mock_service import generate_mock_analysis

SYSTEM_INSTRUCTION = (
    "You are TrustLens AI, an explainable digital safety and fact-checking intelligence platform.\n"
    "Your mission: Search the live web in real time using Google Search to rigorously fact-check "
    "news claims, verify headlines, assess scams, validate URLs, and analyze multimodal screenshots.\n\n"
    "Crucial Fact-Checking & Scoring Rules:\n"
    "- If a news claim, headline, or event is VERIFIED TRUE by credible sources/reports on the internet:\n"
    "  Assign a LOW CONCERN score (0 to 25). Verdict should state 'Verified Factual' or 'Confirmed True'.\n"
    "- If an input is a DEBUNKED HOAX, FALSE RUMOR, SCAM, or MEDICAL MISINFORMATION:\n"
    "  Assign a HIGH RISK score (75 to 100). Verdict should state 'Debunked False Claim' or 'Phishing / Fraud Threat'.\n"
    "- If an input is an UNCONFIRMED RUMOR, DEVELOPING STORY, or MISSING CRITICAL CONTEXT:\n"
    "  Assign a score between 35 and 65 (NEEDS VERIFICATION or SUSPICIOUS).\n\n"
    "Risk Level Scale:\n"
    "0-30: 'LOW CONCERN' (Confirmed authentic, standard safe patterns, or verified true news)\n"
    "31-60: 'NEEDS VERIFICATION' (Unsubstantiated claims, partial context, minor ambiguity)\n"
    "61-80: 'SUSPICIOUS' (Sensationalist clickbait, deceptive phrasing, suspicious redirects)\n"
    "81-100: 'HIGH RISK INDICATORS' (Fabricated news, debunked hoaxes, phishing, financial fraud)\n\n"
    "Output Format Requirement:\n"
    "You MUST respond ONLY with a single valid JSON object. Do not include markdown preamble before or after.\n"
    "JSON Schema:\n"
    "{\n"
    '  "trust_score": integer (0 to 100, where 0=verified safe/true and 100=debunked fake/dangerous scam),\n'
    '  "risk_level": "LOW CONCERN" | "NEEDS VERIFICATION" | "SUSPICIOUS" | "HIGH RISK INDICATORS",\n'
    '  "verdict": string (max 8 words, e.g. "Verified Factual", "Debunked False Claim", "Phishing Link"),\n'
    '  "signals": [\n'
    '    {\n'
    '      "name": string (short signal name, max 5 words),\n'
    '      "severity": "low" | "medium" | "high",\n'
    '      "reason": string (15-25 words explaining the factual evidence or suspicious indicator)\n'
    '    }\n'
    "  ],\n"
    '  "explanation": string (factual, objective summary up to 60 words explaining what web search verified),\n'
    '  "recommendation": string (actionable advice up to 30 words)\n'
    "}"
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

def _extract_json_from_text(raw_text: str) -> Dict[str, Any]:
    """
    Robustly extract and parse a JSON object from Gemini response text,
    handling markdown code blocks or surrounding prose.
    """
    cleaned = raw_text.strip()
    
    # Try direct parse
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Strip code block fences
    fence_pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
    match = re.search(fence_pattern, cleaned, re.IGNORECASE)
    if match:
        inner = match.group(1).strip()
        try:
            return json.loads(inner)
        except Exception:
            pass

    # Look for outermost braces { ... }
    brace_pattern = r"\{[\s\S]*\}"
    match = re.search(brace_pattern, cleaned)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass

    raise ValueError(f"Failed to parse valid JSON from model response: {cleaned[:200]}")

async def analyze_with_gemini(
    content: str,
    analysis_type: str,
    local_signals: List[Dict[str, Any]],
    image_bytes: Optional[bytes] = None,
    mime_type: Optional[str] = None
) -> AnalysisResult:
    """
    Centralized Gemini API analysis service using the official google-genai SDK.
    Empowered with live Google Search Grounding to verify real-world facts, breaking news,
    hoaxes, scams, and web claims in real time.
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
            f"Use Google Search to fact-check and investigate this {analysis_type} input in real time.\n"
            f"Cross-reference the claims, names, events, and domains against current verified web facts.\n"
            f"Input Telemetry:\n{json.dumps(prompt_payload, indent=2)}\n\n"
            f"Remember: Output ONLY the strict JSON object."
        )
        contents_list.append(types.Part.from_text(text=prompt_str))

        # Enable live Google Search grounding for real-time web verification
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            tools=[{"google_search": {}}],
            temperature=0.1,
        )

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

        parsed = _extract_json_from_text(response.text)

        # Extract & clamp score
        raw_score = parsed.get("trust_score", parsed.get("score", 50))
        try:
            score = int(raw_score)
        except (ValueError, TypeError):
            score = 50
        score = max(0, min(100, score))

        # Determine risk level
        risk_level = _get_risk_level_from_score(score)

        # Extract verdict
        verdict = str(parsed.get("verdict", "")).strip()
        if not verdict or verdict.lower() in ("true", "false", "low", "high"):
            if score <= 30:
                verdict = "Verified Factual" if "news" in analysis_type else "Low Concern"
            elif score <= 60:
                verdict = "Needs Verification"
            elif score <= 80:
                verdict = "Suspicious Signals"
            else:
                verdict = "Debunked False Claim" if "news" in analysis_type else "High Risk Threat"

        # Signals
        signals_list: List[SignalItem] = []
        raw_signals = parsed.get("signals", [])
        if isinstance(raw_signals, list):
            for s in raw_signals[:5]:
                if isinstance(s, dict):
                    name = str(s.get("name", "Search Grounding Indicator"))[:60]
                    severity = str(s.get("severity", "medium")).lower()
                    if severity not in ("low", "medium", "high"):
                        severity = "low" if score <= 30 else ("high" if score >= 70 else "medium")
                    reason = str(s.get("reason", "Verified via real-time web investigation."))[:250]
                    signals_list.append(SignalItem(name=name, severity=severity, reason=reason))
                elif isinstance(s, str):
                    sig_name = "Live Web Verification" if score <= 30 else "Fact-Check Alert"
                    sig_sev = "low" if score <= 30 else ("high" if score >= 70 else "medium")
                    signals_list.append(SignalItem(name=sig_name, severity=sig_sev, reason=s[:250]))

        # Check grounding metadata for search queries and citations
        web_sources = []
        if hasattr(response, "candidates") and response.candidates:
            cand = response.candidates[0]
            gm = getattr(cand, "grounding_metadata", None)
            if gm:
                chunks = getattr(gm, "grounding_chunks", []) or []
                for c in chunks:
                    web = getattr(c, "web", None)
                    if web and getattr(web, "title", None):
                        title = web.title.strip()
                        if title and title not in web_sources:
                            web_sources.append(title)

        # If web sources were identified, append a Grounding Signal
        if web_sources:
            sources_summary = ", ".join(web_sources[:4])
            signals_list.insert(0, SignalItem(
                name="Google Search Grounding",
                severity="low" if score <= 30 else "medium",
                reason=f"Live cross-referenced against authoritative sources including {sources_summary}."
            ))
            # Keep max 5 signals
            signals_list = signals_list[:5]

        # If still no signals, supplement with locally detected signals
        if not signals_list:
            for ls in local_signals[:3]:
                signals_list.append(SignalItem(
                    name=ls["name"],
                    severity=ls.get("severity", "medium"),
                    reason=ls.get("reason", "Detected pattern indicator.")
                ))

        # Summary / Explanation
        explanation = str(parsed.get("explanation", parsed.get("summary", "Assessment generated from real-time web signals."))).strip()
        if not explanation:
            explanation = "Content analyzed with real-time explainable risk indicators."

        # Recommendation
        recommendation = str(parsed.get("recommendation", "Exercise caution and verify unexpected requests.")).strip()

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
        err_type = type(e).__name__
        print(f"[Gemini Service Warning] {err_type}: {e}. Falling back to deterministic local analysis.")
        return generate_mock_analysis(content, analysis_type, local_signals, is_fallback=True)
