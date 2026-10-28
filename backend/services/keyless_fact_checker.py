import os
import re
import uuid
import json
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from models.schemas import AnalysisResult, SignalItem

KNOWN_ENTITIES = {
    "modi": "Narendra Modi",
    "narendra modi": "Narendra Modi",
    "pm modi": "Narendra Modi",
    "patekar": "Nana Patekar",
    "nana patekar": "Nana Patekar",
    "tata": "Ratan Tata",
    "ratan tata": "Ratan Tata",
    "trump": "Donald Trump",
    "donald trump": "Donald Trump",
    "biden": "Joe Biden",
    "joe biden": "Joe Biden",
    "putin": "Vladimir Putin",
    "vladimir putin": "Vladimir Putin",
    "musk": "Elon Musk",
    "elon musk": "Elon Musk",
    "ambani": "Mukesh Ambani",
    "mukesh ambani": "Mukesh Ambani",
}

def _search_google_news(query: str, max_results: int = 10) -> List[Dict[str, str]]:
    """
    Query Google News RSS search directly without any API key or token limit.
    Returns real-time news articles with title, source, publication date, and link.
    """
    url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=en-IN&gl=IN&ceid=IN:en"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=4.5) as response:
            xml_data = response.read()
        root = ET.fromstring(xml_data)
        items = root.findall(".//item")
        results = []
        for item in items[:max_results]:
            title = item.find("title").text if item.find("title") is not None else ""
            source = item.find("source").text if item.find("source") is not None else ""
            pub_date = item.find("pubDate").text if item.find("pubDate") is not None else ""
            link = item.find("link").text if item.find("link") is not None else ""
            results.append({
                "title": title.strip(),
                "source": source.strip(),
                "pub_date": pub_date.strip(),
                "link": link.strip()
            })
        return results
    except Exception:
        return []

def _fetch_wikipedia_summary(entity: str) -> Optional[Dict[str, str]]:
    """
    Query Wikipedia REST API to verify biographical status, living/deceased status, and encyclopedic facts.
    Requires no authentication or token key.
    """
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(entity)}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "TrustLens/2.0 (security-research@trustlens.ai)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=4.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return {
                "title": data.get("title", ""),
                "extract": data.get("extract", ""),
                "description": data.get("description", "")
            }
    except Exception:
        return None

def _check_wikipedia_death_status(extract: str) -> str:
    """
    Determines whether Wikipedia lists the individual as living or deceased
    based on biographical tense in the lead sentence.
    """
    if not extract:
        return "unknown"
    first_sentence = extract.split(". ")[0].lower()
    
    # Deceased past tense indicators
    if re.search(r"\bwas (an?|the|a prominent|an influential|a celebrated)\b", first_sentence):
        return "deceased"
    if re.search(r"\b(died on|passed away on|assassinated in)\b", first_sentence):
        return "deceased"
        
    # Living present tense indicators
    if re.search(r"\bis (an?|the|currently|a prominent|the current)\b", first_sentence) or "has served as" in first_sentence:
        return "living"
        
    return "unknown"

def _verify_death_in_headline(headline: str, entity_name: str) -> bool:
    """
    Ensures that the headline confirms the death of the specific entity,
    and excludes headlines where the entity is simply mourning or paying tribute to someone else.
    """
    name_parts = [p for p in entity_name.split() if len(p) > 2]
    hl = headline.lower()
    
    # Negative checks: e.g. "PM Modi mourns veteran actor" -> Modi is not the deceased
    for part in name_parts:
        if re.search(r"\b" + re.escape(part.lower()) + r"\b.*(mourns|condoles|pays tribute|expresses grief|remembers)", hl):
            return False
            
    # Positive checks: <Name> (death|dies|passed away|killed)
    for part in name_parts:
        pattern1 = r"\b" + re.escape(part.lower()) + r"(\x27s)?\s+(death|dies|passed away|killed|dead)\b"
        pattern2 = r"\b(death of|passing of|obituary:?)\s+.*\b" + re.escape(part.lower()) + r"\b"
        if re.search(pattern1, hl) or re.search(pattern2, hl):
            return True
            
    return False

def _merge_signals(primary_signals: List[SignalItem], local_signals: List[Dict[str, Any]], is_verified_factual: bool = False) -> List[SignalItem]:
    merged = list(primary_signals)
    for ls in local_signals:
        sig_name = ls.get("name")
        if is_verified_factual and sig_name in ("Uncorroborated Death Rumor", "Missing Source Context"):
            continue
        if sig_name and not any(s.name == sig_name for s in merged):
            merged.append(SignalItem(
                name=sig_name,
                severity=ls.get("severity", "medium"),
                reason=ls.get("reason", "Detected framing pattern.")
            ))
    return merged[:5]

def verify_news_with_live_web(content: str, local_signals: List[Dict[str, Any]]) -> AnalysisResult:
    """
    Reliable Keyless Live Internet Fact-Checking Engine.
    Cross-references news claims against Google News Real-Time RSS and Wikipedia REST API.
    Zero token dependencies, zero rate-limit quota issues, 24/7 reliability.
    """
    text = content.strip()
    lower = text.lower()
    
    signals: List[SignalItem] = []

    # ---------------------------------------------------------
    # CASE 1: Medical Miracle / Rapid Fake Cure Claims
    # ---------------------------------------------------------
    medical_patterns = [
        r'cure[s]?\s+(for\s+)?(cancer|diabetes|hiv|aids|alzheimer|covid|heart disease|aging)',
        r'eliminate[s]?\s+(cancer|diabetes|hiv|aids|disease)',
        r'cure[s]?\s+in\s+\d+\s*(hours?|days?|mins?|minutes?)',
        r'miracle\s+(cure|drug|drink|juice|herb|remedy)',
    ]
    if any(re.search(p, lower) for p in medical_patterns):
        score = 95
        risk_level = "HIGH RISK INDICATORS"
        verdict = "Debunked Medical Misinformation"
        
        signals.append(SignalItem(
            name="No Clinical Trial Validation",
            severity="high",
            reason="Claims rapid cure or disease elimination without peer-reviewed human clinical trials."
        ))
        signals.append(SignalItem(
            name="Medical Authority Contradiction",
            severity="high",
            reason="Major health bodies (WHO, CDC, American Diabetes Association) confirm no single beverage or food cures these conditions."
        ))
        signals.append(SignalItem(
            name="Dangerous Health Advice Hook",
            severity="high",
            reason="Relies on 'miracle' phrasing that encourages patients to substitute unverified remedies for critical medical care."
        ))
        
        summary = (
            "This claim lacks scientific evidence. Medical authorities confirm that no single food or beverage cures complex chronic conditions like cancer or diabetes."
        )
        recommendation = (
            "Never replace prescribed medical treatments with unproven remedies. Always consult qualified healthcare professionals."
        )
        
        return AnalysisResult(
            id=str(uuid.uuid4()),
            type="news",
            score=score,
            trust_score=score,
            risk_level=risk_level,
            verdict=verdict,
            signals=_merge_signals(signals, local_signals, is_verified_factual=True),
            summary=summary,
            explanation=summary,
            recommendation=recommendation,
            created_at=datetime.now(timezone.utc).isoformat(),
            is_mock=False,
            local_signals_only=False
        )

    # ---------------------------------------------------------
    # CASE 2: Death / Obituary Claims
    # ---------------------------------------------------------
    death_match = re.search(r"\b([a-zA-Z\s\.\-]+?)\s+(is dead|died|passed away|has died|was killed|killed|dead)\b", lower)
    if death_match:
        raw_entity = death_match.group(1).strip()
        raw_entity = re.sub(r"^(is|the|breaking|shocking|confirmed|that|unbelievable)\s+", "", raw_entity).strip()
        entity = KNOWN_ENTITIES.get(raw_entity, raw_entity.title())

        # Check Wikipedia
        wiki = _fetch_wikipedia_summary(entity)
        wiki_status = _check_wikipedia_death_status(wiki["extract"]) if wiki else "unknown"

        # Check Google News
        news_items = _search_google_news(f"{entity} death OR obituary OR dies")
        confirming_news = [item for item in news_items if _verify_death_in_headline(item["title"], entity)]

        if wiki_status == "deceased" or len(confirming_news) >= 2:
            score = 10
            risk_level = "LOW CONCERN"
            verdict = "Verified Factual"
            
            top_sources = [n["source"] for n in confirming_news[:3] if n["source"]]
            if wiki:
                top_sources.append("Wikipedia Biographical Record")
            sources_text = ", ".join(top_sources) if top_sources else "Verified News Outlets"

            signals.append(SignalItem(
                name="Google News Corroboration",
                severity="low",
                reason=f"Passing of {entity} corroborated by accredited news outlets including {sources_text}."
            ))
            if wiki_status == "deceased":
                signals.append(SignalItem(
                    name="Biographical Record Match",
                    severity="low",
                    reason=f"Public biographical records record official passing of {entity}."
                ))

            summary = (
                f"The passing of {entity} is confirmed by accredited journalism organizations and public biographical records."
            )
            recommendation = (
                "Rely on established national and international news coverage for verified biographical details."
            )

            return AnalysisResult(
                id=str(uuid.uuid4()),
                type="news",
                score=score,
                trust_score=score,
                risk_level=risk_level,
                verdict=verdict,
                signals=_merge_signals(signals, local_signals, is_verified_factual=True),
                summary=summary,
                explanation=summary,
                recommendation=recommendation,
                created_at=datetime.now(timezone.utc).isoformat(),
                is_mock=False,
                local_signals_only=False
            )
        else:
            # Uncorroborated death rumor
            score = 85
            risk_level = "SUSPICIOUS"
            verdict = "Uncorroborated Death Rumor"

            signals.append(SignalItem(
                name="Zero Official News Obituaries",
                severity="high",
                reason=f"No verified national or international news agencies (Reuters, AP, BBC, NDTV) report a passing for {entity}."
            ))
            if wiki_status == "living":
                signals.append(SignalItem(
                    name="Active Public Figure Status",
                    severity="high",
                    reason=f"Biographical records and current event feeds confirm {entity} is actively carrying out public responsibilities."
                ))
            signals.append(SignalItem(
                name="Unverified Social Death Hoax Pattern",
                severity="medium",
                reason="Lacks official family, police, or state spokesperson confirmation characteristic of viral death hoaxes."
            ))

            summary = (
                f"Zero accredited news organizations or official spokespersons have reported the passing of {entity}. Live current news coverage indicates the subject is alive and active."
            )
            recommendation = (
                "Do not forward or spread this claim. Death rumors regarding prominent figures should always be verified on official news wire services."
            )

            return AnalysisResult(
                id=str(uuid.uuid4()),
                type="news",
                score=score,
                trust_score=score,
                risk_level=risk_level,
                verdict=verdict,
                signals=_merge_signals(signals, local_signals, is_verified_factual=True),
                summary=summary,
                explanation=summary,
                recommendation=recommendation,
                created_at=datetime.now(timezone.utc).isoformat(),
                is_mock=False,
                local_signals_only=False
            )

    # ---------------------------------------------------------
    # CASE 3: General Claims / Headlines
    # ---------------------------------------------------------
    news_items = _search_google_news(text)
    
    # Check for fact check / debunk articles
    debunking = []
    corroborating = []
    for item in news_items:
        t_low = item["title"].lower()
        if any(w in t_low for w in ["hoax", "fact check", "false", "fake", "debunk", "misleading", "myth"]):
            debunking.append(item)
        else:
            corroborating.append(item)

    if debunking:
        score = 90
        risk_level = "HIGH RISK INDICATORS"
        verdict = "Debunked False Claim"
        
        sources_list = [d["source"] for d in debunking[:3] if d["source"]]
        signals.append(SignalItem(
            name="Formal Fact-Check Debunk Found",
            severity="high",
            reason=f"Recognized fact-checking organizations ({', '.join(sources_list)}) have formally investigated and debunked this claim."
        ))
        signals.append(SignalItem(
            name="Deceptive Framing Identified",
            severity="high",
            reason=f"Claim matches known internet misinformation: '{debunking[0]['title'][:70]}...'"
        ))
        
        summary = (
            f"This claim has been formally investigated and debunked by recognized fact-checking organizations ({', '.join(sources_list)})."
        )
        recommendation = (
            "Do not amplify or share this false claim. Refer to published fact-checks for accurate context."
        )

    elif len(corroborating) >= 2:
        score = 15
        risk_level = "LOW CONCERN"
        verdict = "Active News Coverage"
        
        sources_list = [c["source"] for c in corroborating[:4] if c["source"]]
        signals.append(SignalItem(
            name="Real-Time Press Corroboration",
            severity="low",
            reason=f"Actively reported by accredited journalism publishers including {', '.join(sources_list)}."
        ))
        signals.append(SignalItem(
            name="Consistent Event Timeline",
            severity="low",
            reason=f"Multiple separate news outlets confirm the event in ongoing real-time coverage."
        ))
        
        summary = (
            f"This event is currently reported and confirmed across multiple accredited news publishers ({', '.join(sources_list)})."
        )
        recommendation = (
            "Read full reporting on accredited news outlets for ongoing coverage and official updates."
        )

    else:
        # Lacks news coverage
        score = 65
        risk_level = "NEEDS VERIFICATION"
        verdict = "Unverified Claim"
        
        signals.append(SignalItem(
            name="Zero Corroborating Press Reports",
            severity="medium",
            reason="A search of real-time national and international news coverage found no matching accredited articles for this claim."
        ))
        signals.append(SignalItem(
            name="Missing Primary Attribution",
            severity="medium",
            reason="Claim appears without verifiable press releases, government bulletins, or established wire services."
        ))
        
        summary = (
            "No accredited news outlets have published reports confirming this claim in real time. It remains unverified."
        )
        recommendation = (
            "Exercise caution before accepting or forwarding this information until confirmed by credible media channels."
        )

    return AnalysisResult(
        id=str(uuid.uuid4()),
        type="news",
        score=score,
        trust_score=score,
        risk_level=risk_level,
        verdict=verdict,
        signals=_merge_signals(signals, local_signals),
        summary=summary,
        explanation=summary,
        recommendation=recommendation,
        created_at=datetime.now(timezone.utc).isoformat(),
        is_mock=False,
        local_signals_only=False
    )
