export function isValidUrl(urlString: string): boolean {
  try {
    const trimmed = urlString.trim();
    if (!trimmed) return false;
    const url = trimmed.startsWith('http://') || trimmed.startsWith('https://') 
      ? new URL(trimmed) 
      : new URL('https://' + trimmed);
    return Boolean(url.hostname && url.hostname.includes('.'));
  } catch {
    return false;
  }
}

export function validateMessageLength(content: string, max: number = 5000): { valid: boolean; error?: string } {
  const trimmed = content.trim();
  if (!trimmed) {
    return { valid: false, error: 'Please enter content to analyze.' };
  }
  if (trimmed.length > max) {
    return { valid: false, error: `Content exceeds maximum limit of ${max.toLocaleString()} characters.` };
  }
  return { valid: true };
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Unsupported format. Please upload PNG, JPG, JPEG, or WEBP.' };
  }
  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxBytes) {
    return { valid: false, error: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 5MB limit.` };
  }
  return { valid: true };
}
