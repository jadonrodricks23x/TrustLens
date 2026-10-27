import type { AnalysisResult } from '../types/analysis';

const STORAGE_KEY = 'trustlens_analysis_history_v1';

export interface CompactHistoryItem {
  id: string;
  type: string;
  score: number;
  risk_level: string;
  verdict: string;
  summary: string;
  created_at: string;
  // Full compact analysis object saved for reopening
  fullResult?: AnalysisResult;
}

export function getHistory(): CompactHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export function saveToHistory(result: AnalysisResult): void {
  try {
    const current = getHistory();
    // Compact record without storing raw original message or image payload
    const compactItem: CompactHistoryItem = {
      id: result.id,
      type: result.type,
      score: result.score,
      risk_level: result.risk_level,
      verdict: result.verdict,
      summary: result.summary,
      created_at: result.created_at,
      fullResult: result,
    };

    // Filter duplicate if already saved
    const updated = [compactItem, ...current.filter((item) => item.id !== result.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history to localStorage', e);
  }
}

export function deleteHistoryItem(id: string): CompactHistoryItem[] {
  try {
    const current = getHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete item from localStorage', e);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}
