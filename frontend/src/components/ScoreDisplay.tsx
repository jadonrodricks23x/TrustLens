import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { RiskLevel } from '../types/analysis';
import { ShieldCheck, Info } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  riskLevel: RiskLevel;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, riskLevel }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  // Smooth counter animation
  useEffect(() => {
    let startTime: number | null = null;
    const duration = 900; // ms

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    const animId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(animId);
  }, [score]);

  const getBadgeConfig = () => {
    const normalized = (riskLevel || '').toUpperCase();

    switch (normalized) {
      case 'LOW CONCERN':
        return {
          textColor: 'text-emerald-400',
          strokeColor: '#34d399',
          gradientId: 'emeraldGrad',
          bgColor: 'bg-emerald-500/15 border-emerald-500/30',
          dotColor: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
          barColor: 'from-emerald-500 to-teal-400',
          label: 'LOW CONCERN',
          glow: 'shadow-[0_0_35px_rgba(16,185,129,0.18)]',
          description: 'Content conforms to expected authentic patterns with negligible threat indicators.'
        };
      case 'NEEDS VERIFICATION':
        return {
          textColor: 'text-sky-400',
          strokeColor: '#38bdf8',
          gradientId: 'skyGrad',
          bgColor: 'bg-sky-500/15 border-sky-500/30',
          dotColor: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
          barColor: 'from-sky-500 to-cyan-400',
          label: 'NEEDS VERIFICATION',
          glow: 'shadow-[0_0_35px_rgba(14,165,233,0.18)]',
          description: 'Lacks sufficient citations or primary source corroboration. Context verification recommended.'
        };
      case 'SUSPICIOUS':
        return {
          textColor: 'text-amber-400',
          strokeColor: '#fbbf24',
          gradientId: 'amberGrad',
          bgColor: 'bg-amber-500/15 border-amber-500/30',
          dotColor: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
          barColor: 'from-amber-500 to-orange-400',
          label: 'SUSPICIOUS',
          glow: 'shadow-[0_0_35px_rgba(245,158,11,0.18)]',
          description: 'Multiple deceptive indicators observed, such as urgency coercion, unverified rumors, or masking.'
        };
      case 'HIGH RISK INDICATORS':
      default:
        return {
          textColor: 'text-rose-400',
          strokeColor: '#f43f5e',
          gradientId: 'roseGrad',
          bgColor: 'bg-rose-500/15 border-rose-500/30',
          dotColor: 'bg-rose-400 shadow-[0_0_8px_#f43f5e]',
          barColor: 'from-rose-500 to-red-500',
          label: 'HIGH RISK INDICATORS',
          glow: 'shadow-[0_0_35px_rgba(244,63,94,0.2)]',
          description: 'Severe fraud signatures, credential theft attempts, or debunked high-impact disinformation.'
        };
    }
  };

  const badge = getBadgeConfig();

  // Circular gauge calculations (Clean semicircle arc)
  const radius = 75;
  const arcLength = Math.PI * radius; // ~235.6
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, score))) / 100;

  return (
    <div className={`relative overflow-hidden flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] ${badge.glow} transition-all duration-300`}>
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* Header Info Pill */}
      <div className="flex items-center gap-1.5 mb-2 relative">
        <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
          TrustLens Concern Meter
        </span>
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-slate-400 hover:text-white p-0.5 rounded-full transition-colors"
          aria-label="Score calculation details"
        >
          <Info className="w-3.5 h-3.5" />
        </button>

        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 w-64 p-3 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/20 text-xs text-slate-300 shadow-2xl text-left pointer-events-none"
          >
            <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-lens-400" />
              <span>Score Calibration</span>
            </div>
            Calibrated from 0 (verified authentic / low concern) to 100 (prominent fraud or debunked disinformation).
          </motion.div>
        )}
      </div>

      {/* Radial Gauge Arc Display */}
      <div className="relative my-2 flex items-center justify-center">
        <svg width="200" height="115" viewBox="0 0 200 115" className="overflow-visible">
          <defs>
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <path
            d="M 25 105 A 75 75 0 0 1 175 105"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="11"
            strokeLinecap="round"
          />

          {/* Animated Value Arc */}
          <motion.path
            d="M 25 105 A 75 75 0 0 1 175 105"
            fill="none"
            stroke={`url(#${badge.gradientId})`}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{
              filter: `drop-shadow(0 0 8px ${badge.strokeColor}66)`
            }}
          />
        </svg>

        {/* Center Numbers */}
        <div className="absolute top-[36px] flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tight text-white drop-shadow-md">
              {animatedScore}
            </span>
            <span className="text-lg font-semibold text-slate-400">
              /100
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
            Risk Metric
          </span>
        </div>
      </div>

      {/* Pill Badge */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide ${badge.bgColor} ${badge.textColor} backdrop-blur-md shadow-sm`}
      >
        <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
        <span>{badge.label}</span>
      </motion.div>

      <p className="text-xs text-slate-300 mt-3 max-w-sm leading-relaxed">
        {badge.description}
      </p>
    </div>
  );
};
