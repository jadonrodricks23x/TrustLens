import re
from typing import List, Dict, Any

def analyze_news_locally(content: str) -> List[Dict[str, Any]]:
    """
    Performs deterministic local signal detection for news claims and headlines.
    Returns detected signals (up to 5) with name, severity, and reason.
    """
    signals = []
    text = content.lower().strip()

    # 1. Uncorroborated Death / Fatal Event Rumor
    death_pattern = r'\b(is dead|died|passed away|found dead|killed|assassinated|death of|fatal accident)\b'
    has_specific_source = bool(re.search(
        r'(reuters|ap news|bbc|hindustan times|indian express|al jazeera|who|pmo|official spokesperson|family confirmed|police statement)',
        text
    ))
    if re.search(death_pattern, text) and not has_specific_source:
        signals.append({
            "name": "Uncorroborated Death Rumor",
            "severity": "high",
            "reason": "Claims a death or fatal event without citing official confirmation, credible obituaries, or major news agencies."
        })

    # 2. Unsubstantiated Medical & Miracle Cure Claims
    medical_patterns = [
        r'cure[s]?\s+(for\s+)?(cancer|diabetes|hiv|aids|alzheimer|covid|heart disease|aging)',
        r'eliminate[s]?\s+(cancer|diabetes|hiv|aids|disease)',
        r'cure[s]?\s+in\s+\d+\s*(hours?|days?|mins?|minutes?)',
        r'miracle\s+(cure|drug|drink|juice|herb|remedy)',
        r'doctors?\s+(hate|fear|won\'t tell|banned)'
    ]
    if any(re.search(p, text) for p in medical_patterns):
        signals.append({
            "name": "Unverified Medical Cure Claim",
            "severity": "high",
            "reason": "Claims rapid cure or disease elimination without clinical trial citations or verified health regulatory approval."
        })

    # 3. Excessive Punctuation / All-Caps
    punct_count = len(re.findall(r'[!?]{2,}', content))
    caps_words = [w for w in content.split() if len(w) > 3 and w.isupper() and w.isalpha()]
    if punct_count > 0 or len(caps_words) >= 2:
        signals.append({
            "name": "Excessive Punctuation & Emphasis",
            "severity": "medium",
            "reason": "Uses dramatic exclamation marks or capital letters to artificially heighten emotional intensity and urgency."
        })

    # 4. Sensationalist & Tabloid Wording
    sensational_patterns = [
        r'miracle cure', r'shocking truth', r'what they don\'t want you to know',
        r'bombshell', r'mind-blowing', r'unbelievable', r'breakthrough secret',
        r'they are hiding', r'exposed', r'jaw-dropping', r'conspiracy',
        r'media won\'t tell you', r'censored by government'
    ]
    if any(re.search(p, text) for p in sensational_patterns):
        signals.append({
            "name": "Sensationalist Framing",
            "severity": "high",
            "reason": "Relies on sensational buzzwords designed to trigger curiosity rather than substantiated factual reporting."
        })

    # 5. Clickbait Patterns
    clickbait_patterns = [
        r'you won\'t believe', r'this one simple trick', r'number \d+ will shock you',
        r'see what happened', r'revealed', r'will blow your mind', r'the secret reason'
    ]
    if any(re.search(p, text) for p in clickbait_patterns):
        signals.append({
            "name": "Clickbait Construct",
            "severity": "medium",
            "reason": "Employs an information gap hook to manipulate clicks without revealing substantive verifiable context up front."
        })

    # 6. Absolute / Unqualified Claims
    absolute_patterns = [
        r'guarantees?', r'100% proven', r'cure for all', r'never fails',
        r'undeniable proof', r'completely eliminates', r'every single person'
    ]
    if any(re.search(p, text) for p in absolute_patterns):
        signals.append({
            "name": "Absolute Claims",
            "severity": "high",
            "reason": "Asserts definitive guarantees or total certainty in domains where scientific or journalistic nuances always exist."
        })

    # 7. Emotional Manipulation & Outrage
    emotional_patterns = [
        r'terrifying', r'horrific', r'panic', r'disaster', r'heartbreaking',
        r'outrageous', r'furious', r'pure evil', r'devastating'
    ]
    if any(re.search(p, text) for p in emotional_patterns):
        signals.append({
            "name": "Emotional Loading",
            "severity": "medium",
            "reason": "Uses visceral emotional phrasing that appeals to fear, outrage, or panic rather than rational inquiry."
        })

    # 8. Missing Verifiable Source Context (if not already flagged as uncorroborated death)
    if len(content.split()) < 40 and not any(k in text for k in ['http', 'according to', 'published', 'reported by']):
        if not any(s["name"] == "Uncorroborated Death Rumor" for s in signals):
            signals.append({
                "name": "Missing Source Context",
                "severity": "medium",
                "reason": "Lacks direct citations, timestamps, or corroborating links needed to evaluate authenticity."
            })

    return signals[:5]
