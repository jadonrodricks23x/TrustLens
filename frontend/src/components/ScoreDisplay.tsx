import React from 'react';
import type { RiskLevel } from '../types/analysis';

interface ScoreDisplayProps {
  score: number;
  riskLevel: RiskLevel;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, riskLevel }) => {
  const getBadgeConfig = () => {
    const normalized = (riskLevel || '').toUpperCase();

    switch (normalized) {
      case 'LOW CONCERN':
        return {
          textColor: 'text-emerald-500 dark:text-emerald-400',
          bgColor: 'bg-emerald-500/10 border-emerald-500/30',
          dotColor: 'bg-emerald-500',
          barColor: 'from-emerald-500 to-teal-400',
          label: 'LOW CONCERN',
          icon: '🟢',
        };
      case 'NEEDS VERIFICATION':
        return {
          textColor: 'text-amber-500 dark:text-amber-400',
          bgColor: 'bg-amber-500/10 border-amber-500/30',
          dotColor: 'bg-amber-500',
          barColor: 'from-amber-500 to-yellow-400',
          label: 'NEEDS VERIFICATION',
          icon: '🟡',
        };
      case 'SUSPICIOUS':
        return {
          textColor: 'text-orange-500 dark:text-orange-400',
          bgColor: 'bg-orange-500/10 border-orange-500/30',
          dotColor: 'bg-orange-500',
          barColor: 'from-orange-500 to-amber-500',
          label: 'SUSPICIOUS',
          icon: '🟠',
        };
      case 'HIGH RISK INDICATORS':
      default:
        return {
          textColor: 'text-rose-500 dark:text-rose-400',
          bgColor: 'bg-rose-500/10 border-rose-500/30',
          dotColor: 'bg-rose-500',
          barColor: 'from-rose-600 to-orange-500',
          label: 'HIGH RISK INDICATORS',
          icon: '🔴',
        };
    }
  };

  const badge = getBadgeConfig();

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
      <div className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">
        TrustLens Score
      </div>

      <div className="flex items-baseline gap-1.5 my-2">
        <span className={`text-6xl font-extrabold tracking-tight ${badge.textColor}`}>
          {score}
        </span>
        <span className="text-2xl font-medium text-slate-400 dark:text-slate-500">
          / 100
        </span>
      </div>

      {/* Progress meter */}
      <div className="w-full max-w-xs h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden my-3">
        <div
          className={`h-full bg-gradient-to-r ${badge.barColor} transition-all duration-700 ease-out`}
          style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
        />
      </div>

      {/* Risk Badge */}
      <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mt-1 ${badge.bgColor} ${badge.textColor}`}>
        <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
        <span>{badge.label}</span>
      </div>
    </div>
  );
};
