import Tesseract from 'tesseract.js';

export interface OcrProgress {
  status: string;
  progress: number; // 0 to 100
}

export interface OcrResult {
  text: string;
  confidence: number;
  wordCount: number;
  hasText: boolean;
}

export async function extractTextFromImage(
  imageSource: string | File,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  try {
    const response = await Tesseract.recognize(imageSource, 'eng', {
      logger: (m) => {
        if (onProgress && m.status) {
          const progressPercent = Math.min(100, Math.max(0, Math.round((m.progress || 0) * 100)));
          let statusText = 'Scanning image...';
          if (m.status === 'loading tesseract core') statusText = 'Loading OCR Core...';
          else if (m.status === 'initializing tesseract') statusText = 'Initializing Engine...';
          else if (m.status === 'loading language traineddata') statusText = 'Loading Language Models...';
          else if (m.status === 'recognizing text') statusText = `Recognizing text (${progressPercent}%)...`;

          onProgress({
            status: statusText,
            progress: progressPercent,
          });
        }
      },
    });

    const rawText = response.data?.text || '';
    const cleanedText = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');

    const words = cleanedText ? cleanedText.split(/\s+/).filter(Boolean) : [];
    const confidence = Math.round(response.data?.confidence || 0);

    return {
      text: cleanedText,
      confidence,
      wordCount: words.length,
      hasText: words.length > 0,
    };
  } catch (err) {
    console.error('[OCR Engine] Recognition failed:', err);
    return {
      text: '',
      confidence: 0,
      wordCount: 0,
      hasText: false,
    };
  }
}
