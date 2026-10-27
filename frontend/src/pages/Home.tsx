import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Newspaper, Link2, Camera, Search, Brain, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="space-y-20 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lens-500/10 border border-lens-500/20 text-lens-600 dark:text-lens-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explainable AI Digital Safety</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          TrustLens AI
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lens-600 via-sky-500 to-teal-400 bg-clip-text text-transparent">
          Look closer. Trust smarter.
        </h2>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Analyze suspicious messages, news, links and screenshots with AI.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-lens-600 hover:bg-lens-700 text-white font-semibold text-base transition-all shadow-md shadow-lens-500/20 hover:scale-[1.02]"
          >
            <span>🔍 Analyze Something</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-base transition-colors"
          >
            <span>How It Works</span>
          </Link>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Scam Detector */}
          <Link
            to="/analyze?mode=scam"
            className="glass-card-hover rounded-2xl p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <span>🚨 Scam Detector</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Analyze suspicious messages, WhatsApp forwards, payment requests and emails.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-lens-500 group-hover:translate-x-1 transition-transform">
              <span>Inspect message</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 2. News Analyzer */}
          <Link
            to="/analyze?mode=news"
            className="glass-card-hover rounded-2xl p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <span>📰 News Analyzer</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Analyze viral claims, sensational headlines, clickbait framing, and articles.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-lens-500 group-hover:translate-x-1 transition-transform">
              <span>Verify claim</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 3. Link Checker */}
          <Link
            to="/analyze?mode=url"
            className="glass-card-hover rounded-2xl p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Link2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <span>🔗 Link Checker</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Inspect suspicious URLs, shorteners, credential harvesters, and deceptive domains.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-lens-500 group-hover:translate-x-1 transition-transform">
              <span>Check URL</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* 4. Screenshot Analyzer */}
          <Link
            to="/analyze?mode=screenshot"
            className="glass-card-hover rounded-2xl p-6 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <span>📸 Screenshot Analyzer</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload screenshots from chats, emails, or websites and analyze suspicious signals.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-lens-500 group-hover:translate-x-1 transition-transform">
              <span>Upload image</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Why TrustLens Section */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Why TrustLens?
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Traditional tools give black-box verdicts. TrustLens explains every signal so you stay in control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-lens-500/10 text-lens-500 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              🔍 Detect
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Identify suspicious signals across urgency keywords, redirection tricks, and emotional framing.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              🧠 Understand
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              See why something was flagged with concise signal breakdowns and explainable risk scores.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              🛡️ Decide
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Make a safer, more informed decision with concrete recommendations rather than binary assumptions.
            </p>
          </div>
        </div>

        {/* Small Disclaimer */}
        <div className="mt-12 text-center max-w-2xl mx-auto p-4 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          TrustLens provides AI-assisted analysis and should not be treated as definitive proof. Verify important information using reliable independent sources.
        </div>
      </section>
    </div>
  );
};
