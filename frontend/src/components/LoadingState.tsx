import React, { useState, useEffect } from 'react';

const STAGES = [
  { text: 'Scanning content...', icon: '🔍' },
  { text: 'Analyzing with TrustLens...', icon: '🛡️' },
  { text: 'Identifying signals...', icon: '🧠' },
  { text: 'Building assessment...', icon: '📊' },
];

export const LoadingState: React.FC = () => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full glass-card rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center animate-fadeIn">
      {/* Outer pulsing ring */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full bg-lens-500/20 animate-ping" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-lens-500/10 border border-lens-500/30 text-2xl">
          {STAGES[stageIndex].icon}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">
        {STAGES[stageIndex].text}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        Running deterministic signal rules and preparing explainable risk telemetry.
      </p>

      {/* Subtle indicator bar */}
      <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-6">
        <div className="h-full bg-lens-500 w-1/3 rounded-full animate-pulse-subtle translate-x-0" />
      </div>
    </div>
  );
};
