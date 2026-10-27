export function detectLocalScamHints(content: string): string[] {
  const hints: string[] = [];
  const text = content.toLowerCase();

  if (/\botp\b|verification code|one[- ]time password/.test(text)) {
    hints.push('OTP / Verification Code Request');
  }
  if (/\bpassword\b|passcode|secret pin/.test(text)) {
    hints.push('Credentials / Password Solicitation');
  }
  if (/immediately|urgent|act now|expires soon|within 24 hours/.test(text)) {
    hints.push('Artificial Urgency');
  }
  if (/send money|wire transfer|gift card|crypto|bitcoin|upi|gpay/.test(text)) {
    hints.push('Direct Payment Request');
  }
  if (/congratulations|you have won|lottery|cash prize|claim reward/.test(text)) {
    hints.push('Unsolicited Prize / Reward');
  }
  if (/account.*(suspended|blocked|locked)|freeze your account/.test(text)) {
    hints.push('Account Suspension Warning');
  }
  if (/ssn|social security|aadhaar|cvv|credit card/.test(text)) {
    hints.push('Sensitive Data Solicitation');
  }

  return hints.slice(0, 4);
}
