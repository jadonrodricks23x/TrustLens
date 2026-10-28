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
  const fileType = (file.type || '').toLowerCase();
  const fileName = (file.name || '').toLowerCase();
  
  const validMimes = [
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
    'image/heic', 'image/heif', 'image/gif', 'image/bmp'
  ];
  
  const isImageMime = validMimes.includes(fileType) || fileType.startsWith('image/');
  const isImageExt = /\.(png|jpe?g|webp|heic|heif|gif|bmp)$/i.test(fileName);

  if (!isImageMime && !isImageExt) {
    return { valid: false, error: 'Unsupported format. Please upload an image (PNG, JPG, HEIC, or WEBP).' };
  }
  
  // High-res iPhone 12/15 photos can be 5-10MB; permit up to 20MB on frontend
  const maxBytes = 20 * 1024 * 1024; // 20MB
  if (file.size > maxBytes) {
    return { valid: false, error: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 20MB limit.` };
  }
  return { valid: true };
}
