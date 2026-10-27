import React from 'react';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  onReset: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "TrustLens couldn't complete the AI analysis.",
  onRetry,
  onReset,
}) => {
  return (
    <div className="w-full glass-card rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center animate-fadeIn border-rose-500/20">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Analysis Unavailable
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-lens-600 hover:bg-lens-700 text-white transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Analyze Something Else</span>
        </button>
      </div>
    </div>
  );
};
