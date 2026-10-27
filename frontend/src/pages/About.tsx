import React from 'react';
import { ShieldCheck, Layers, Lock, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export const About: React.FC = () => {
  const steps = [
    { title: 'User Input', desc: 'User submits text, headline, URL, or screenshot.' },
    { title: 'Input Validation', desc: 'Strict size, length, and format boundaries applied before processing.' },
    { title: 'Local Signal Detection', desc: 'Deterministic heuristics detect urgency, payment demands, shorteners, or clickbait without AI tokens.' },
    { title: 'AI Analysis', desc: 'Exactly ONE focused AI call evaluates the content snippet alongside locally flagged signals.' },
    { title: 'Structured JSON', desc: 'Calibrated schema validation formats score (0-100), risk band, and up to 5 explainable signals.' },
    { title: 'TrustLens Result', desc: 'Clear explainable card with what we detected, why it matters, and recommended safety steps.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lens-500/10 text-lens-600 dark:text-lens-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Explainability First</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          About TrustLens AI
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          "Don't just give a verdict. Explain the signals."
        </p>
      </div>

      {/* Mission & Philosophy */}
      <section className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-lens-500" />
          <span>Our Core Philosophy</span>
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Most automated security tools present users with opaque binary verdicts like "SAFE" or "MALICIOUS". In real life, digital manipulation thrives on nuance, ambiguity, and human psychological blindspots.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          TrustLens AI changes this model by deconstructing digital communication into understandable, inspectable <strong>signals</strong>. By explaining <em>why</em> a message or link triggers suspicion, users learn to build lasting intuition and make safer decisions for themselves.
        </p>
      </section>

      {/* Architecture Pipeline */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-lens-500" />
            <span>Architecture & Data Flow</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Engineered for minimal token consumption and privacy-respecting local evaluation.
          </p>
        </div>

        <div className="relative border-l-2 border-lens-500/30 ml-4 sm:ml-6 space-y-8 py-2">
          {steps.map((step, idx) => (
            <div key={idx} className="relative pl-6 sm:pl-8 group">
              {/* Step indicator node */}
              <div className="absolute -left-[17px] top-0 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-lens-500 text-lens-600 dark:text-lens-400 font-bold text-xs shadow-sm">
                {idx + 1}
              </div>

              <div className="glass-card rounded-xl p-4 sm:p-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strict Privacy Principles */}
      <section className="glass-card rounded-2xl p-6 sm:p-8 space-y-4 border-emerald-500/20">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-500" />
          <span>Zero Persistent Storage by Default</span>
        </h2>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Your raw pasted text and chat messages are never permanently saved to any database.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Uploaded screenshots are processed purely in-memory for OCR text extraction and discarded immediately.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Analysis history is stored solely inside your browser's private local storage unless explicitly connected to Supabase.</span>
          </li>
        </ul>
      </section>

      {/* Limitations & Disclaimers */}
      <section className="p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-3">
        <h2 className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Important Limitations & Non-Guarantee</span>
        </h2>
        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>
            • <strong>AI makes mistakes:</strong> Machine learning heuristics and language models may generate false positives or false negatives.
          </p>
          <p>
            • <strong>Scores are not definitive proof:</strong> A low concern score does not constitute a legal or cybersecurity guarantee that an item is authentic, and high risk indicators do not guarantee malice.
          </p>
          <p>
            • <strong>Independent verification is required:</strong> Always cross-reference critical financial, medical, or urgent claims through verified official contact numbers and recognized public domain authorities.
          </p>
          <p>
            • <strong>No professional advice:</strong> TrustLens AI does not provide financial, legal, medical, or formal forensic cybersecurity counsel.
          </p>
        </div>
      </section>
    </div>
  );
};
