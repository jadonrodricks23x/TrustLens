import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Activity, BarChart3 } from 'lucide-react';

const STAGES = [
  { text: 'Scanning content...', icon: <Search className="w-7 h-7 text-lens-400 animate-pulse" /> },
  { text: 'Verifying with TrustLens...', icon: <ShieldCheck className="w-7 h-7 text-sky-400" /> },
  { text: 'Extracting safety signals...', icon: <Activity className="w-7 h-7 text-teal-400" /> },
  { text: 'Finalizing assessment...', icon: <BarChart3 className="w-7 h-7 text-indigo-400" /> },
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
    <div className="w-full apple-glass-card rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center animate-fadeIn border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Outer pulsing ring with frosted glass */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full bg-lens-500/20 animate-ping" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-xl shadow-lg">
          {STAGES[stageIndex].icon}
        </div>
      </div>

      <h3 className="text-lg font-bold text-white tracking-tight mb-2">
        {STAGES[stageIndex].text}
      </h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
        Cross-referencing live web intelligence and explainable security telemetry.
      </p>

      {/* Sleek Apple-style progress track */}
      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-6">
        <div className="h-full bg-gradient-to-r from-lens-500 to-cyan-400 w-2/3 rounded-full animate-pulse shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
      </div>
    </div>
  );
};
