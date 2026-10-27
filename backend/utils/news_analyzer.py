import re
from typing import List, Dict, Any

def analyze_news_locally(content: str) -> List[Dict[str, Any]]:
    """
    Performs deterministic local signal detection for news claims and headlines.
    Returns detected signals (up to 5) with name, severity, and reason.
    """
    signals = []
    text = content.lower()

    # 1. Excessive Punctuation / All-Caps
    punct_count = len(re.findall(r'[!?]{2,}', content))
    caps_words = [w for w in content.split() if len(w) > 3 and w.isupper() and w.isalpha()]
    if punct_count > 0 or len(caps_words) >= 2:
        signals.append({
            "name": "Excessive Punctuation & Emphasis",
            "severity": "medium",
            "reason": "Uses dramatic exclamation marks or capital letters to artificially heighten emotional intensity and urgency."
        })

    # 2. Sensationalist & Tabloid Wording
    sensational_patterns = [
        r'miracle cure', r'shocking truth', r'what they don\'t want you to know',
        r'bombshell', r'mind-blowing', r'unbelievable', r'breakthrough secret',
        r'they are hiding', r'exposed', r'jaw-dropping', r'conspiracy'
    ]
    if any(re.search(p, text) for p in sensational_patterns):
        signals.append({
            "name": "Sensationalist Framing",
            "severity": "high",
            "reason": "Relies on sensational buzzwords designed to trigger curiosity rather than substantiated factual reporting."
        })

    # 3. Clickbait Patterns
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

    # 4. Absolute / Unqualified Claims
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

    # 5. Emotional Manipulation & Outrage
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

    # 6. Anonymous / Vague Sourcing
    vague_source_patterns = [
        r'scientists have discovered', r'doctors hate (him|her|this)',
        r'sources claim', r'insiders say', r'a secret study', r'experts confirm'
    ]
    has_vague_sources = any(re.search(p, text) for p in vague_source_patterns)
    has_specific_source = bool(re.search(r'(published in|doi\.org|reuters|ap news|bbc|who|cdc|nature journal|lancet|university of)', text))
    
    if has_vague_sources and not has_specific_source:
        signals.append({
            "name": "Unverifiable Attribution",
            "severity": "medium",
            "reason": "Attributes broad claims to unspecified scientists or anonymous sources without citing peer-reviewed studies or publications."
        })

    # 7. Missing Verifiable Source Context
    if len(content.split()) < 40 and not any(k in text for k in ['http', 'according to', 'published', 'reported by']):
        signals.append({
            "name": "Missing Source Context",
            "severity": "low",
            "reason": "Lacks direct citations, timestamps, or corroborating links needed to evaluate authenticity."
        })

    return signals[:5]
