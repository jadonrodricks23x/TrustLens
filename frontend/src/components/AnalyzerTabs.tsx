import React from 'react';
import { motion } from 'framer-motion';
import type { AnalysisType } from '../types/analysis';
import { ShieldAlert, Newspaper, Link2, Camera } from 'lucide-react';

interface AnalyzerTabsProps {
  currentTab: AnalysisType;
  onTabChange: (tab: AnalysisType) => void;
}

const TABS: { id: AnalysisType; label: string; icon: React.ReactNode; desc: string; shortcut: string }[] = [
  {
    id: 'scam',
    label: 'Scam Detector',
    icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
    desc: 'SMS, WhatsApp, emails & payments',
    shortcut: '1',
  },
  {
    id: 'news',
    label: 'News Analyzer',
    icon: <Newspaper className="w-4 h-4 text-amber-400" />,
    desc: 'Headlines, claims & viral rumors',
    shortcut: '2',
  },
  {
    id: 'url',
    label: 'Link Checker',
    icon: <Link2 className="w-4 h-4 text-sky-400" />,
    desc: 'URLs, shorteners & domains',
    shortcut: '3',
  },
  {
    id: 'screenshot',
    label: 'Screenshot OCR',
    icon: <Camera className="w-4 h-4 text-emerald-400" />,
    desc: 'Upload images or capture via camera',
    shortcut: '4',
  },
];

export const AnalyzerTabs: React.FC<AnalyzerTabsProps> = ({ currentTab, onTabChange }) => {
  return (
    <div
      role="tablist"
      aria-label="Content Analysis Types"
      className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-2 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
    >
      {TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl transition-colors duration-200 text-center select-none outline-none focus-visible:ring-2 focus-visible:ring-lens-400"
          >
            {/* Animated Framer-Motion Active Sliding Pill */}
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.04] border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.25)] pointer-events-none"
              >
                {/* Luminous top neon line */}
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-[2px] rounded-full bg-gradient-to-r from-lens-400 to-cyan-400 shadow-[0_0_8px_rgba(14,165,233,0.9)]" />
              </motion.div>
            )}

            <div className="relative z-10 flex items-center gap-2 mb-1">
              <span className={`p-1.5 rounded-lg transition-colors duration-200 ${isActive ? 'bg-white/10' : 'bg-white/5'}`}>
                {tab.icon}
              </span>
              <span className={`text-sm font-semibold tracking-tight transition-colors duration-200 ${isActive ? 'text-white font-bold' : 'text-slate-300 hover:text-white'}`}>
                {tab.label}
              </span>
            </div>

            <span className="relative z-10 text-[11px] text-slate-400 hidden sm:block max-w-[170px] truncate leading-tight">
              {tab.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
};
