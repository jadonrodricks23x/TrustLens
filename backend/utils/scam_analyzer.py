import re
from typing import List, Dict, Any

def analyze_scam_locally(content: str) -> List[Dict[str, Any]]:
    """
    Performs deterministic local signal detection for suspicious messages/emails.
    Returns detected signals (up to 5) with name, severity, and reason.
    """
    signals = []
    text = content.lower()

    # 1. OTP / Verification Code requests
    otp_patterns = [
        r'\botp\b', r'one[- ]time (password|pin|code)', r'verification code',
        r'security code', r'authentication code', r'share.*(code|pin)'
    ]
    if any(re.search(p, text) for p in otp_patterns):
        signals.append({
            "name": "OTP Request",
            "severity": "high",
            "reason": "Requests one-time passwords or security verification codes, a hallmark of account takeover scams."
        })

    # 2. Password / Credential requests
    pwd_patterns = [
        r'\bpassword\b', r'\bpasscode\b', r'login credentials', r'secret pin',
        r'enter your credential', r'send your password'
    ]
    if any(re.search(p, text) for p in pwd_patterns):
        signals.append({
            "name": "Password Request",
            "severity": "high",
            "reason": "Prompts recipient for confidential passwords or credentials that legitimate entities never ask via message."
        })

    # 3. Urgency / Coercion
    urgency_patterns = [
        r'immediately', r'urgent', r'act now', r'within (24|12|2|1|48) hours?',
        r'limited time', r'expires (soon|today)', r'final notice', r'action required'
    ]
    if any(re.search(p, text) for p in urgency_patterns):
        signals.append({
            "name": "Urgency",
            "severity": "high",
            "reason": "Employs high-pressure urgency tactics to rush the victim into acting without independent verification."
        })

    # 4. Payment / Wire / Crypto requests
    payment_patterns = [
        r'send money', r'wire transfer', r'gift card', r'crypto', r'bitcoin',
        r'western union', r'processing fee', r'advance fee', r'transfer ₹',
        r'transfer \$', r'upi', r'gpay', r'phonepe', r'pay now to claim'
    ]
    if any(re.search(p, text) for p in payment_patterns):
        signals.append({
            "name": "Payment Request",
            "severity": "high",
            "reason": "Instructs recipient to send funds, gift cards, or cryptocurrency, commonly seen in advance-fee fraud."
        })

    # 5. Prize / Lottery / Reward claims
    prize_patterns = [
        r'congratulations', r'you have won', r'won ₹', r'won \$', r'lottery',
        r'cash prize', r'jackpot', r'selected winner', r'claim your (reward|prize)'
    ]
    if any(re.search(p, text) for p in prize_patterns):
        signals.append({
            "name": "Unsolicited Reward",
            "severity": "medium",
            "reason": "Promises unexpected prize winnings or lottery windfalls that typically demand fees or personal data to release."
        })

    # 6. Account Suspension / Blocking threats
    suspension_patterns = [
        r'account.*(suspended|blocked|locked|frozen|deactivated)',
        r'freeze.*account', r'unusual activity detected', r'security alert.*login'
    ]
    if any(re.search(p, text) for p in suspension_patterns):
        signals.append({
            "name": "Account Suspension Threat",
            "severity": "high",
            "reason": "Warns of imminent account termination or freezing to trigger fear and hasty credential submission."
        })

    # 7. Sensitive Information Requests (SSN, Aadhaar, Credit Card, CVV)
    sensitive_patterns = [
        r'\bssn\b', r'social security', r'aadhaar', r'credit card', r'\bcvv\b',
        r'bank account details', r'debit card number', r'date of birth'
    ]
    if any(re.search(p, text) for p in sensitive_patterns):
        signals.append({
            "name": "Sensitive Data Request",
            "severity": "high",
            "reason": "Solicits high-risk identifying details or banking credentials capable of facilitating identity theft."
        })

    # 8. Impersonation of Authorities or Tech Support
    impersonation_patterns = [
        r'customs officer', r'income tax department', r'police department',
        r'amazon support', r'apple support', r'bank manager', r'hr department',
        r'fedex package', r'dhl shipment'
    ]
    if any(re.search(p, text) for p in impersonation_patterns):
        signals.append({
            "name": "Authority Impersonation",
            "severity": "medium",
            "reason": "Claims to represent recognized institutions, tax authorities, or couriers without cryptographic verification."
        })

    # 9. Suspicious Links or Shorteners in text
    link_patterns = [
        r'https?://[^\s]+', r'bit\.ly/[^\s]+', r'tinyurl\.com/[^\s]+',
        r'wa\.me/[^\s]+', r't\.me/[^\s]+'
    ]
    links = re.findall(r'https?://[^\s]+|bit\.ly/[^\s]+|tinyurl\.com/[^\s]+', content, re.IGNORECASE)
    if links:
        signals.append({
            "name": "Unverified Link",
            "severity": "medium",
            "reason": "Contains embedded links or shortened URLs that may redirect to deceptive or phishing login portals."
        })

    # Limit to top 5 signals
    return signals[:5]
