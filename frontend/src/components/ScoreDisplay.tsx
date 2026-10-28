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
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/15 border-emerald-500/30',
          dotColor: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
          barColor: 'from-emerald-500 to-teal-400',
          label: 'LOW CONCERN',
          glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
          description: 'Normal communication patterns & verified factual claims'
        };
      case 'NEEDS VERIFICATION':
        return {
          textColor: 'text-sky-400',
          bgColor: 'bg-sky-500/15 border-sky-500/30',
          dotColor: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
          barColor: 'from-sky-500 to-cyan-400',
          label: 'NEEDS VERIFICATION',
          glow: 'shadow-[0_0_30px_rgba(14,165,233,0.15)]',
          description: 'Lacks sufficient citations or official primary corroboration'
        };
      case 'SUSPICIOUS':
        return {
          textColor: 'text-amber-400',
          bgColor: 'bg-amber-500/15 border-amber-500/30',
          dotColor: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
          barColor: 'from-amber-500 to-orange-400',
          label: 'SUSPICIOUS',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
          description: 'Multiple deceptive indicators, redirection, or uncorroborated rumor'
        };
      case 'HIGH RISK INDICATORS':
      default:
        return {
          textColor: 'text-rose-400',
          bgColor: 'bg-rose-500/15 border-rose-500/30',
          dotColor: 'bg-rose-400 shadow-[0_0_8px_#f43f5e]',
          barColor: 'from-rose-500 to-red-500',
          label: 'HIGH RISK INDICATORS',
          glow: 'shadow-[0_0_30px_rgba(244,63,94,0.18)]',
          description: 'Severe fraud signals, credential harvesting, or debunked disinformation'
        };
    }
  };

  const badge = getBadgeConfig();

  return (
    <div className={`relative overflow-hidden flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] ${badge.glow}`}>
      {/* Background radial accent glow */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-20" />

      <div className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 mb-2">
        TrustLens Concern Score
      </div>

      <div className="flex items-baseline justify-center gap-2 my-1">
        <span className={`text-6xl sm:text-7xl font-extrabold tracking-tight ${badge.textColor} drop-shadow-sm`}>
          {score}
        </span>
        <span className="text-2xl sm:text-3xl font-semibold text-slate-500">
          / 100
        </span>
      </div>

      {/* Sleek Luminous Gauge */}
      <div className="w-full max-w-sm h-3 bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-white/10 my-4">
        <div
          className={`h-full bg-gradient-to-r ${badge.barColor} rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,255,255,0.2)]`}
          style={{ width: `${Math.max(6, Math.min(100, score))}%` }}
        />
      </div>

      {/* Pill Badge */}
      <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide ${badge.bgColor} ${badge.textColor} backdrop-blur-md`}>
        <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
        <span>{badge.label}</span>
      </div>

      <p className="text-xs text-slate-400 mt-2.5 max-w-sm">
        {badge.description}
      </p>
    </div>
  );
};
