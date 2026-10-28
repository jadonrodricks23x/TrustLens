import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Newspaper, Link2, Camera, Search, Brain, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="space-y-24 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-lens-300 text-xs font-semibold tracking-wide uppercase backdrop-blur-xl shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-lens-400 animate-pulse" />
          <span>Explainable AI Digital Safety</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-sm">
          TrustLens AI
        </h1>

        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-lens-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">
          Look closer. Trust smarter.
        </h2>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Inspect suspicious messages, verify news claims, investigate phishing links, and analyze screenshots with explainable signals.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/analyze"
            className="apple-primary-btn inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-semibold text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Analyze Something</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/about"
            className="apple-pill-btn inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-slate-200 hover:text-white font-medium text-base transition-all"
          >
            <span>How It Works</span>
          </Link>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Scam Detector */}
          <Link
            to="/analyze?mode=scam"
            className="apple-glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between group hover:border-rose-400/40 hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)]"
          >
            <div>
              <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-orange-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span>🚨 Scam Detector</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Analyze suspicious messages, WhatsApp forwards, payment requests and email urgency.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-rose-400 group-hover:translate-x-1.5 transition-transform">
              <span>Inspect message</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 2. News Analyzer */}
          <Link
            to="/analyze?mode=news"
            className="apple-glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between group hover:border-amber-400/40 hover:shadow-[0_20px_40px_rgba(245,158,11,0.15)]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span>📰 News Analyzer</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Verify viral claims, celebrity death rumors, and miracle cures against live Google News & Wikipedia.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:translate-x-1.5 transition-transform">
              <span>Verify claim</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 3. Link Checker */}
          <Link
            to="/analyze?mode=url"
            className="apple-glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between group hover:border-sky-400/40 hover:shadow-[0_20px_40px_rgba(14,165,233,0.15)]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-cyan-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Link2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span>🔗 Link Checker</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Inspect suspicious URLs, shortened links, credential harvesters, and deceptive domains.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-sky-400 group-hover:translate-x-1.5 transition-transform">
              <span>Check URL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 4. Screenshot Analyzer */}
          <Link
            to="/analyze?mode=screenshot"
            className="apple-glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between group hover:border-teal-400/40 hover:shadow-[0_20px_40px_rgba(20,184,166,0.15)]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span>📸 Screenshot OCR</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Upload images or capture photos using device camera to extract text and analyze risk signals.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-teal-400 group-hover:translate-x-1.5 transition-transform">
              <span>Upload or capture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Why TrustLens Section */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Why TrustLens?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto">
            Traditional tools give black-box verdicts. TrustLens explains every signal so you stay in control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="apple-glass-card rounded-3xl p-7 text-center space-y-3.5">
            <div className="w-14 h-14 rounded-2xl bg-lens-500/15 border border-lens-500/30 text-lens-400 mx-auto flex items-center justify-center shadow-inner">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              🔍 Detect
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Identify suspicious signals across urgency keywords, redirection tricks, and emotional framing.
            </p>
          </div>

          <div className="apple-glass-card rounded-3xl p-7 text-center space-y-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              🧠 Understand
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              See why something was flagged with concise signal breakdowns and explainable risk scores.
            </p>
          </div>

          <div className="apple-glass-card rounded-3xl p-7 text-center space-y-3.5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              🛡️ Decide
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Make a safer, more informed decision with concrete recommendations rather than binary assumptions.
            </p>
          </div>
        </div>

        {/* Small Disclaimer */}
        <div className="mt-14 text-center max-w-2xl mx-auto p-4.5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] text-xs text-slate-400 leading-relaxed">
          TrustLens provides explainable AI-assisted safety analysis. It is not definitive legal or forensic proof. Always confirm critical communications through authorized primary channels.
        </div>
      </section>
    </div>
  );
};
