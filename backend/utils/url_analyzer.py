import re
from urllib.parse import urlparse
from typing import List, Dict, Any, Tuple

SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly",
    "ow.ly", "rebrand.ly", "cutt.ly", "rb.gy", "shorturl.at"
}

SUSPICIOUS_TLDS = {
    "xyz", "top", "click", "buzz", "club", "work", "loan", "zip", "mov", "gq", "tk", "ml", "cf"
}

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "update", "secure", "account", "banking",
    "signin", "wallet", "claim", "bonus", "prize", "refund", "support-auth"
]

def analyze_url_locally(raw_url: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Performs deterministic local signal detection for URLs.
    Does NOT crawl or bypass remote servers.
    Returns (signals, metadata).
    """
    signals = []
    metadata = {}
    
    url = raw_url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        url = "https://" + url

    try:
        parsed = urlparse(url)
    except Exception:
        return ([{
            "name": "Malformed URL",
            "severity": "high",
            "reason": "The URL structure cannot be properly parsed according to RFC 3986 specifications."
        }], {})

    hostname = (parsed.hostname or "").lower()
    path = parsed.path.lower()
    port = parsed.port
    scheme = parsed.scheme.lower()
    
    metadata = {
        "scheme": scheme,
        "hostname": hostname,
        "path": parsed.path,
        "length": len(raw_url)
    }

    # 1. Non-HTTPS Scheme
    if scheme != "https":
        signals.append({
            "name": "Unencrypted Protocol (HTTP)",
            "severity": "medium",
            "reason": "Traffic is transmitted in plain text without TLS encryption, vulnerable to interception or tampering."
        })

    # 2. IP address instead of domain name
    ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
    if re.match(ip_pattern, hostname):
        signals.append({
            "name": "Direct IP Address Host",
            "severity": "high",
            "reason": "Uses a raw numerical IP address instead of a registered domain name, commonly seen in transient phishing hosts."
        })

    # 3. Known URL Shorteners
    if hostname in SHORTENERS or any(hostname.endswith("." + s) for s in SHORTENERS):
        signals.append({
            "name": "URL Shortener Masking",
            "severity": "medium",
            "reason": "Obscures the true destination hostname through a redirection service, hiding potential risks from the user."
        })

    # 4. Excessive Subdomains (Domain Spoofing Attempt)
    host_parts = hostname.split('.')
    if len(host_parts) > 3:
        signals.append({
            "name": "Excessive Subdomains",
            "severity": "medium",
            "reason": "Contains deeply nested subdomains frequently employed to mimic legitimate brands within child labels."
        })

    # 5. Sensitive Credential / Phishing Keywords in Path or Subdomains
    matched_kw = [kw for kw in SUSPICIOUS_KEYWORDS if kw in path or kw in hostname]
    if matched_kw:
        signals.append({
            "name": "High-Value Target Keywords",
            "severity": "high" if any(k in ["login", "verify", "banking", "wallet"] for k in matched_kw) else "medium",
            "reason": f"Path or host references sensitive actions ({', '.join(matched_kw[:3])}) outside established brand domains."
        })

    # 6. Unusual Non-Standard Ports
    if port and port not in (80, 443):
        signals.append({
            "name": "Non-Standard Port",
            "severity": "medium",
            "reason": f"Connects over unusual network port :{port} rather than standard web communication ports 80 or 443."
        })

    # 7. Excessive URL Length
    if len(raw_url) > 110:
        signals.append({
            "name": "Excessive URL Length",
            "severity": "low",
            "reason": "Unusually long URL string which may be crafted to hide the true destination off-screen in mobile browsers."
        })

    # 8. Userinfo / @ symbol obfuscation
    if "@" in raw_url:
        signals.append({
            "name": "Credential Obfuscation (@ symbol)",
            "severity": "high",
            "reason": "Contains an '@' symbol which can mislead users regarding which server hostname is actually being contacted."
        })

    # 9. Suspicious or Cheap TLDs
    tld = host_parts[-1] if host_parts else ""
    if tld in SUSPICIOUS_TLDS:
        signals.append({
            "name": "High-Abuse Domain TLD",
            "severity": "medium",
            "reason": f"Registered under the .{tld} top-level domain, known statistically for elevated spam and phishing abuse rates."
        })

    return signals[:5], metadata
