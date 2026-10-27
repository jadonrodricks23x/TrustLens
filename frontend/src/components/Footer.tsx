import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 text-xs py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-lens-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              TrustLens AI
            </span>
            <span className="text-slate-400 dark:text-slate-600">—</span>
            <span>Look closer. Trust smarter.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link to="/analyze" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Analyze
            </Link>
            <Link to="/history" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              History
            </Link>
            <Link to="/learn" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Learn & Quiz
            </Link>
            <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Architecture & Limitations
            </Link>
          </div>
        </div>

        {/* Mandatory Disclaimer */}
        <div className="p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
          <strong>Important Disclaimer:</strong> TrustLens provides AI-assisted analysis and should not be treated as definitive proof. Verify important information using reliable independent sources. We do not permanently store your raw messages or uploaded screenshots by default.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px] pt-2">
          <div>© {new Date().getFullYear()} TrustLens AI. Explainable Digital Safety Platform.</div>
          <div className="flex items-center gap-1">
            <span>Built for high-trust digital discernment</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
