export function detectLocalUrlHints(urlStr: string): string[] {
  const hints: string[] = [];
  const text = urlStr.toLowerCase().trim();
  if (!text) return hints;

  if (text.startsWith('http://')) {
    hints.push('Unencrypted Protocol (HTTP)');
  }
  if (/bit\.ly|tinyurl\.com|t\.co|cutt\.ly|shorturl\.at|rb\.gy/.test(text)) {
    hints.push('URL Shortener Redirection Mask');
  }
  if (/(\d{1,3}\.){3}\d{1,3}/.test(text)) {
    hints.push('Raw IP Address Hostname');
  }
  if (/@/.test(text)) {
    hints.push('Userinfo Obfuscation (@)');
  }
  if (/login|verify|account|banking|secure|signin|wallet/.test(text)) {
    hints.push('Sensitive Credential Keyword');
  }
  if (/\.(xyz|top|buzz|click|club|loan)($|\/)/.test(text)) {
    hints.push('High-Abuse Domain TLD');
  }

  return hints.slice(0, 4);
}
