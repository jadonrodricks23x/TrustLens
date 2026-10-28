import React, { useState } from 'react';
import type { AnalysisResult } from '../types/analysis';
import { ScoreDisplay } from './ScoreDisplay';
import { SignalCard } from './SignalCard';
import { saveToHistory } from '../services/storage';
import { Check, Copy, Bookmark, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const displayScore = typeof result.score === 'number' ? result.score : (result.trust_score ?? 0);
  const displayExplanation = result.explanation || result.summary || '';

  const handleCopy = async () => {
    const textToCopy = `TrustLens AI Assessment
TrustLens Score: ${displayScore}/100 (${result.risk_level})
Verdict: ${result.verdict}

Why This Matters:
${displayExplanation}

Signals Detected:
${result.signals.map((s) => `• [${s.severity.toUpperCase()}] ${s.name}: ${s.reason}`).join('\n')}

Recommended Action:
${result.recommendation}

(Note: AI assessment is not proof. Verify via independent reliable sources.)`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Clipboard copy failed', err);
    }
  };

  const handleSave = () => {
    saveToHistory(result);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="w-full glass-card rounded-2xl p-6 sm:p-8 animate-fadeIn">
      {/* Active Analysis Engine Badge */}
      <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/20 flex items-center justify-between gap-2 text-xs text-emerald-700 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>
            <strong>TrustLens Safety Intelligence:</strong> Analyzed using real-time web telemetry and explainable signal detection.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
          Verified
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-lens-500" />
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              TrustLens Assessment
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verdict: <span className="font-semibold text-slate-700 dark:text-slate-300">{result.verdict}</span>
          </p>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
          {new Date(result.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Score and Overview */}
      <div className="py-6">
        <ScoreDisplay score={displayScore} riskLevel={result.risk_level} />
      </div>

      {/* What We Detected (Max 5 signals) */}
      <div className="my-6">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <span>What we detected</span>
          <span className="text-xs font-normal text-slate-400">
            ({result.signals.length} {result.signals.length === 1 ? 'signal' : 'signals'})
          </span>
        </h4>
        <div className="space-y-3">
          {result.signals.slice(0, 5).map((sig, idx) => (
            <SignalCard key={idx} signal={sig} />
          ))}
        </div>
      </div>

      {/* Why This Matters / Explanation */}
      <div className="my-6 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-850/50 border border-slate-200/60 dark:border-slate-800/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Why this matters
        </h4>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {displayExplanation}
        </p>
      </div>

      {/* What Should You Do? / Recommendation */}
      <div className="my-6 p-4 rounded-xl bg-lens-500/5 dark:bg-lens-500/10 border border-lens-500/20">
        <h4 className="text-xs font-bold uppercase tracking-wider text-lens-600 dark:text-lens-400 mb-1.5">
          What should you do?
        </h4>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {result.recommendation}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 dark:border-slate-800">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Analyze Another</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            title="Copy full assessment to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                <span>Copy Result</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium bg-lens-600 hover:bg-lens-700 text-white transition-colors shadow-sm"
            title="Save result to local history"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Save Result</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
