import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#07090E]/90 backdrop-blur-xl text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-lens-500/15 border border-lens-500/30 text-lens-400">
              <Shield className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-semibold text-white">
              TrustLens AI
            </span>
            <span className="text-slate-600">—</span>
            <span className="text-slate-300">Look closer. Trust smarter.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/analyze" className="text-slate-300 hover:text-white transition-colors">
              Analyze
            </Link>
            <Link to="/history" className="text-slate-300 hover:text-white transition-colors">
              History
            </Link>
            <Link to="/learn" className="text-slate-300 hover:text-white transition-colors">
              Learn & Quiz
            </Link>
            <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
              Architecture & Limitations
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] text-slate-400 text-[11px] leading-relaxed">
          <strong className="text-slate-300">Important Notice:</strong> TrustLens provides AI-assisted analysis and should not be treated as absolute legal or forensic proof. Verify critical information using authoritative independent sources. Raw user input data is never permanently stored without your consent.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-[11px] pt-2">
          <div>© {new Date().getFullYear()} TrustLens AI. Explainable Digital Safety Platform.</div>
          <div className="flex items-center gap-1">
            <span>Built for digital safety & factual discernment</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
