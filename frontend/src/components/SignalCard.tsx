import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SignalItem } from '../types/analysis';
import { AlertTriangle, AlertCircle, CheckCircle2, ChevronDown, Copy, Check, Shield } from 'lucide-react';

interface SignalCardProps {
  signal: SignalItem;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const getSeverityStyle = () => {
    switch (signal.severity) {
      case 'high':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />,
          badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          accent: 'border-l-rose-500',
          containerBg: 'bg-rose-950/20 hover:bg-rose-950/30',
          guidance: 'High-severity indicator. Do not comply with payment demands, credential requests, or urgent panic messaging.'
        };
      case 'medium':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          accent: 'border-l-amber-500',
          containerBg: 'bg-amber-950/20 hover:bg-amber-950/30',
          guidance: 'Requires independent confirmation. Cross-check through official websites, verified phone numbers, or news wires.'
        };
      case 'low':
      default:
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          accent: 'border-l-emerald-500',
          containerBg: 'bg-emerald-950/20 hover:bg-emerald-950/30',
          guidance: 'Authentic pattern or corroborating source match. Follow standard digital safety practices.'
        };
    }
  };

  const style = getSeverityStyle();

  const handleCopySignal = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`[${signal.severity.toUpperCase()}] ${signal.name}: ${signal.reason}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => setIsExpanded(!isExpanded)}
      className={`rounded-2xl ${style.containerBg} backdrop-blur-xl border border-white/[0.08] border-l-4 ${style.accent} shadow-sm transition-all duration-200 cursor-pointer overflow-hidden group select-none`}
    >
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/[0.06] backdrop-blur-md">
            {style.icon}
          </div>
          <h4 className="font-semibold text-sm text-white group-hover:text-lens-200 transition-colors">
            {signal.name}
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${style.badge}`}>
            {signal.severity}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-400 group-hover:text-white p-1"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-4 pb-4 pl-12">
        {signal.reason}
      </p>

      {/* Expandable Interactive Detail Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="border-t border-white/[0.06] bg-black/30 p-4 pl-12 space-y-2.5 text-xs text-slate-300"
          >
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-lens-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-white">Recommended Action: </span>
                {style.guidance}
              </div>
            </div>

            <div className="pt-1 flex items-center justify-end">
              <button
                type="button"
                onClick={handleCopySignal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 border border-white/10 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy Signal Detail</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
