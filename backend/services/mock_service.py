import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from models.schemas import AnalysisResult, SignalItem

def calculate_score_from_signals(signals: List[Dict[str, Any]], base_type: str) -> int:
    """
    Computes a calibrated TrustLens score based on detected local signals.
    Severity weights: high = 30, medium = 18, low = 8.
    """
    if not signals:
        return 12  # Low baseline concern when zero suspicious signals detected

    weights = {"high": 30, "medium": 18, "low": 8}
    total = sum(weights.get(s.get("severity", "low"), 10) for s in signals)
    
    # Base adjustments depending on category
    if base_type == "scam":
        # High severity scam signals (OTP/password/payment) push quickly into high risk
        score = 25 + total
    elif base_type == "url":
        score = 20 + total
    else: # news / claim
        score = 15 + total

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

def get_verdict(score: int, analysis_type: str) -> str:
    if score <= 30:
        return "Standard communication patterns" if analysis_type != "news" else "Factual formatting indicators"
    elif score <= 60:
        return "Potential ambiguities requiring verification"
    elif score <= 80:
        return "Multiple warning signals detected"
    else:
        return "Prominent high-risk indicators observed"

def generate_mock_analysis(
    content: str,
    analysis_type: str,
    signals: List[Dict[str, Any]],
    is_fallback: bool = False
) -> AnalysisResult:
    """
    Generates a realistic, explainable mock / pattern-based analysis.
    Explicitly flags is_mock=True.
    """
    score = calculate_score_from_signals(signals, analysis_type)
    risk_level = get_risk_level(score)
    verdict = get_verdict(score, analysis_type)

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
                name="No Common Anomaly Patterns",
                severity="low",
                reason="Did not match standard database signatures for urgency, payment coercion, or deceptive structures."
            )
        )

    # Contextual summary & recommendation (concise, <= 40 words & <= 30 words)
    if risk_level == "HIGH RISK INDICATORS":
        summary = (
            "Content exhibits multiple severe risk signals, including direct requests for funds, "
            "authentication codes, or artificial urgency coercion."
        )
        recommendation = (
            "Do not transfer money, share OTPs, or click links. Verify directly through official contact channels."
        )
    elif risk_level == "SUSPICIOUS":
        summary = (
            "Several warning patterns were identified that match deceptive messaging, unverified redirects, "
            "or sensationalized claims."
        )
        recommendation = (
            "Avoid interacting with unverified links or attachments. Cross-check claims with reputable primary sources."
        )
    elif risk_level == "NEEDS VERIFICATION":
        summary = (
            "While not definitively dangerous, this content features ambiguities, missing attribution, "
            "or atypical domain structures."
        )
        recommendation = (
            "Exercise reasonable caution. Independently confirm information before acting on or forwarding this content."
        )
    else:
        summary = (
            "No aggressive threat signatures detected. Content conforms to standard expected digital communication patterns."
        )
        recommendation = (
            "Remains standard safe practice to maintain normal digital hygiene and verify unexpected requests."
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
