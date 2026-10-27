export function detectLocalNewsHints(content: string): string[] {
  const hints: string[] = [];
  const text = content.toLowerCase();

  if (/[!?]{2,}/.test(content) || /\b(SHOCKING|EXPOSED|WARNING|ALERT)\b/.test(content)) {
    hints.push('Excessive Punctuation & Emphasis');
  }
  if (/miracle cure|shocking truth|bombshell|secret reason|what they don't want you to know/.test(text)) {
    hints.push('Sensationalist / Tabloid Wording');
  }
  if (/you won't believe|this one trick|number \d+ will shock you/.test(text)) {
    hints.push('Clickbait Framing');
  }
  if (/guarantees?|100% proven|cure for all|never fails|undeniable proof/.test(text)) {
    hints.push('Absolute Claims & Zero Nuance');
  }
  if (/scientists have discovered|doctors hate|sources claim/.test(text) && !/published|doi\.org|reuters|bbc|nature/.test(text)) {
    hints.push('Unverified Attribution');
  }

  return hints.slice(0, 4);
}
