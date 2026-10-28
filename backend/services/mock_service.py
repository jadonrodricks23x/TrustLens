import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from models.schemas import AnalysisResult, SignalItem

def calculate_score_from_signals(signals: List[Dict[str, Any]], base_type: str) -> int:
    """
    Computes a calibrated TrustLens concern score based on detected local signals.
    High scores (70-100) = High Concern / Fraud / Misinformation.
    Low scores (0-30) = Low Concern / Standard communication.
    """
    if not signals:
        return 12  # Low baseline concern when zero suspicious signals detected

    weights = {"high": 35, "medium": 20, "low": 10}
    total = sum(weights.get(s.get("severity", "low"), 10) for s in signals)
    
    # Base adjustments depending on category
    if base_type == "scam":
        score = 25 + total
    elif base_type == "url":
        score = 20 + total
    else: # news / claim
        has_high = any(s.get("severity") == "high" for s in signals)
        has_medium = any(s.get("severity") == "medium" for s in signals)
        if has_high:
            score = 45 + total
        elif has_medium:
            score = 30 + total
        else:
            score = 20 + total

    return max(5, min(95, score))

def get_risk_level(score: int) -> str:
    if score <= 30:
        return "LOW CONCERN"
    elif score <= 60:
        return "NEEDS VERIFICATION"
    elif score <= 80:
        return "SUSPICIOUS"
    else:
        return "HIGH RISK INDICATORS"

def get_verdict(score: int, analysis_type: str, signals: List[Dict[str, Any]]) -> str:
    # URL specific verdicts
    if analysis_type == "url":
        if score <= 30:
            return "Standard secure domain structure"
        elif score <= 60:
            return "Potential redirection or unencrypted link"
        elif score <= 80:
            return "Suspicious URL / Masked destination"
        else:
            return "Deceptive phishing / High-risk URL"

    # Check for specific high-priority signals in news
    signal_names = [s.get("name", "").lower() for s in signals]
    if any("death" in n for n in signal_names):
        return "Uncorroborated Death Rumor"
    if any("medical" in n or "cure" in n for n in signal_names):
        return "Unsubstantiated Medical Claim"

    if score <= 30:
        return "Standard communication patterns" if analysis_type != "news" else "Low concern format"
    elif score <= 60:
        return "Unverified claim needing independent confirmation"
    elif score <= 80:
        return "Multiple warning signals / Suspicious framing"
    else:
        return "Prominent threat indicators" if analysis_type != "news" else "Deceptive or debunked claim"

def generate_mock_analysis(
    content: str,
    analysis_type: str,
    signals: List[Dict[str, Any]],
    is_fallback: bool = False
) -> AnalysisResult:
    """
    Generates a calibrated pattern-based analysis when AI is offline or quota-limited.
    Explicitly flags is_mock=True and local_signals_only=is_fallback.
    """
    score = calculate_score_from_signals(signals, analysis_type)
    risk_level = get_risk_level(score)
    verdict = get_verdict(score, analysis_type, signals)

    # Format signal items
    signal_items = [
        SignalItem(
            name=s["name"],
            severity=s["severity"],
            reason=s["reason"]
        )
        for s in signals[:5]
    ]

    # If no local signals were detected, provide a reassuring note
    if not signal_items:
        signal_items.append(
            SignalItem(
                name="No Known Threat Signatures" if analysis_type != "url" else "Standard Secure Protocol",
                severity="low",
                reason="Did not match known threat signatures for deceptive redirection, raw IP hosts, or credential harvesting."
            )
        )

    # Contextual summary & recommendation tailored to analysis type
    if analysis_type == "url":
        if risk_level == "HIGH RISK INDICATORS":
            summary = (
                "URL exhibits severe deceptive patterns such as target phishing keywords, raw IP hosting, or unencrypted credential targets."
            )
            recommendation = (
                "Do not click or enter credentials on this link. Navigate directly to the official website via a trusted bookmark."
            )
        elif risk_level == "SUSPICIOUS":
            summary = (
                "URL features warning indicators such as URL shortener masking, non-standard communication ports, or high-abuse TLDs."
            )
            recommendation = (
                "Avoid submitting sensitive personal or payment details. Verify the true destination address before interacting."
            )
        elif risk_level == "NEEDS VERIFICATION":
            summary = (
                "URL exhibits minor anomalies such as unencrypted HTTP transmission or unusual path structuring."
            )
            recommendation = (
                "Ensure a secure HTTPS connection is established before entering sensitive data."
            )
        else:
            summary = (
                "Standard web URL structure. Uses secure HTTPS protocol and conforms to expected domain naming standards."
            )
            recommendation = (
                "Safe to browse. Maintain standard caution and verify site certificates."
            )
    else:
        # Default for scam / news / screenshot
        if risk_level == "HIGH RISK INDICATORS":
            summary = (
                "Content exhibits critical threat signals, payment coercion, or uncorroborated viral rumors."
            )
            recommendation = (
                "Do not share sensitive details, transfer money, or forward unverified claims. Verify through official channels."
            )
        elif risk_level == "SUSPICIOUS":
            summary = (
                "Several warning patterns detected, including unverified claims, missing attribution, or urgency pressure."
            )
            recommendation = (
                "Treat this content with skepticism. Cross-check facts with established primary sources."
            )
        elif risk_level == "NEEDS VERIFICATION":
            summary = (
                "This content makes claims without providing direct verifiable references, primary citations, or timestamps."
            )
            recommendation = (
                "Exercise caution. Independently confirm information before forwarding or accepting as factual."
            )
        else:
            summary = (
                "No aggressive threat signatures detected. Content conforms to expected baseline communication patterns."
            )
            recommendation = (
                "Standard safe practice: maintain healthy digital hygiene and independently verify unexpected claims."
            )

    return AnalysisResult(
        id=str(uuid.uuid4()),
        type=analysis_type,
        score=score,
        risk_level=risk_level,
        verdict=verdict,
        signals=signal_items,
        summary=summary,
        recommendation=recommendation,
        created_at=datetime.now(timezone.utc).isoformat(),
        is_mock=True,
        local_signals_only=is_fallback
    )
