import type { AnalysisResult } from '../types/analysis';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 20000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Analysis timed out. The server took too long to respond. Please try again.');
    }
    throw new Error('Unable to connect to the TrustLens server. Please ensure the backend is running.');
  } finally {
    clearTimeout(id);
  }
}

async function handleResponse(response: Response): Promise<AnalysisResult> {
  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      // ignore json parse error on error response
    }
    throw new Error(errorDetail);
  }

  const data = await response.json();
  if (typeof data.score !== 'number' || !data.risk_level || !Array.isArray(data.signals)) {
    throw new Error('Invalid response structure received from safety engine.');
  }
  return data as AnalysisResult;
}

export async function checkHealth(): Promise<{ status: string; ai_mode: string; storage: string }> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/health`, { method: 'GET' }, 5000);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return { status: 'offline', ai_mode: 'local_mock_mode', storage: 'local_storage_fallback' };
  }
}

export async function analyzeScam(content: string): Promise<AnalysisResult> {
  const response = await fetchWithTimeout(`${BASE_URL}/api/analyze/scam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content.trim() }),
  });
  return handleResponse(response);
}

export async function analyzeNews(content: string): Promise<AnalysisResult> {
  const response = await fetchWithTimeout(`${BASE_URL}/api/analyze/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content.trim() }),
  });
  return handleResponse(response);
}

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  const response = await fetchWithTimeout(`${BASE_URL}/api/analyze/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url.trim() }),
  });
  return handleResponse(response);
}

export async function analyzeScreenshot(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetchWithTimeout(`${BASE_URL}/api/analyze/screenshot`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}
