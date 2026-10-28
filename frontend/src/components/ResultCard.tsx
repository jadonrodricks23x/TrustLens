import React, { useState } from 'react';
import type { AnalysisResult } from '../types/analysis';
import { ScoreDisplay } from './ScoreDisplay';
import { SignalCard } from './SignalCard';
import { saveToHistory } from '../services/storage';
import { Check, Copy, Bookmark, RotateCcw, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

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

(Note: AI assessment is not definitive proof. Verify via independent reliable sources.)`;

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
    <div className="w-full rounded-3xl p-6 sm:p-8 apple-glass-card border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fadeIn space-y-6">
      {/* Active Analysis Engine Badge */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs text-emerald-300">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong className="text-white">TrustLens Intelligence:</strong> Analyzed using real-time web telemetry and explainable signal detection.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[10px] uppercase font-bold tracking-wider text-emerald-300 border border-emerald-500/30">
          Verified
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-lens-500/15 border border-lens-500/30 text-lens-400">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white">
              TrustLens Assessment
            </h3>
          </div>
          <p className="text-sm text-slate-300 mt-1.5 flex items-center gap-1.5">
            <span>Verdict:</span>
            <span className="font-semibold text-white px-2 py-0.5 rounded-md bg-white/[0.08] border border-white/10">
              {result.verdict}
            </span>
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] self-start sm:self-auto">
          {new Date(result.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Score and Overview */}
      <div className="py-2">
        <ScoreDisplay score={displayScore} riskLevel={result.risk_level} />
      </div>

      {/* What We Detected (Signals) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>What we detected</span>
            <span className="text-[11px] font-normal text-slate-400 px-2 py-0.5 rounded-full bg-white/[0.06]">
              {result.signals.length} {result.signals.length === 1 ? 'signal' : 'signals'}
            </span>
          </h4>
        </div>
        <div className="space-y-3">
          {result.signals.slice(0, 5).map((sig, idx) => (
            <SignalCard key={idx} signal={sig} />
          ))}
        </div>
      </div>

      {/* Why This Matters / Explanation */}
      <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-lens-400" />
          <span>Why this matters</span>
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed font-normal">
          {displayExplanation}
        </p>
      </div>

      {/* What Should You Do? / Recommendation */}
      <div className="p-5 rounded-2xl bg-lens-500/[0.08] backdrop-blur-xl border border-lens-500/25 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-lens-400">
          What should you do?
        </h4>
        <p className="text-sm font-medium text-white leading-relaxed">
          {result.recommendation}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Analyze Another</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-200 hover:text-white transition-all"
            title="Copy full assessment to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Result</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold apple-primary-btn text-white transition-all shadow-md"
            title="Save result to local history"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to History!</span>
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
