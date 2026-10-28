import React from 'react';
import type { SignalItem } from '../types/analysis';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SignalCardProps {
  signal: SignalItem;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const getSeverityStyle = () => {
    switch (signal.severity) {
      case 'high':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />,
          badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          accent: 'border-l-rose-500',
          containerBg: 'bg-rose-950/20 hover:bg-rose-950/30',
        };
      case 'medium':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          accent: 'border-l-amber-500',
          containerBg: 'bg-amber-950/20 hover:bg-amber-950/30',
        };
      case 'low':
      default:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          accent: 'border-l-emerald-500',
          containerBg: 'bg-emerald-950/20 hover:bg-emerald-950/30',
        };
    }
  };

  const style = getSeverityStyle();

  return (
    <div
      className={`p-4 rounded-2xl ${style.containerBg} backdrop-blur-xl border border-white/[0.08] border-l-4 ${style.accent} shadow-sm transition-all duration-200 group`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/[0.06] backdrop-blur-md">
            {style.icon}
          </div>
          <h4 className="font-semibold text-sm text-white group-hover:text-lens-200 transition-colors">
            {signal.name}
          </h4>
        </div>
        <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${style.badge}`}>
          {signal.severity}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-9">
        {signal.reason}
      </p>
    </div>
  );
};
