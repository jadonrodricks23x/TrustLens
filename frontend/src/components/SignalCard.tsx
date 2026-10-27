import React from 'react';
import type { SignalItem } from '../types/analysis';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SignalCardProps {
  signal: SignalItem;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const getSeverityStyle = () => {
    switch (signal.severity) {
      case 'high':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />,
          badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          border: 'border-l-rose-500',
        };
      case 'medium':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          border: 'border-l-amber-500',
        };
      case 'low':
      default:
        return {
          icon: <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />,
          badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          border: 'border-l-sky-500',
        };
    }
  };

  const style = getSeverityStyle();

  return (
    <div
      className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 border-l-4 ${style.border} transition-all duration-150`}
    >
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2">
          {style.icon}
          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
            {signal.name}
          </h4>
        </div>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${style.badge}`}>
          {signal.severity}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
        {signal.reason}
      </p>
    </div>
  );
};
