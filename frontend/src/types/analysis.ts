export type AnalysisType = 'scam' | 'news' | 'url' | 'screenshot';

export type RiskLevel = 'LOW CONCERN' | 'NEEDS VERIFICATION' | 'SUSPICIOUS' | 'HIGH RISK INDICATORS';

export type SignalSeverity = 'low' | 'medium' | 'high';

export interface SignalItem {
  name: string;
  severity: SignalSeverity;
  reason: string;
}

export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  score: number; // 0 - 100
  risk_level: RiskLevel;
  verdict: string;
  signals: SignalItem[];
  summary: string;
  recommendation: string;
  created_at: string;
  is_mock?: boolean;
  local_signals_only?: boolean;
}

export interface QuizQuestion {
  id: number;
  type: 'scam' | 'url' | 'news';
  title: string;
  scenario: string;
  isSuspicious: boolean;
  correctAnswer: 'suspicious' | 'safe';
  explanation: string;
  signals: string[];
}
