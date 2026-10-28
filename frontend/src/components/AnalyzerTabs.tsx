import React from 'react';
import type { AnalysisType } from '../types/analysis';
import { ShieldAlert, Newspaper, Link2, Camera } from 'lucide-react';

interface AnalyzerTabsProps {
  currentTab: AnalysisType;
  onTabChange: (tab: AnalysisType) => void;
}

const TABS: { id: AnalysisType; label: string; icon: React.ReactNode; desc: string; badge: string }[] = [
  {
    id: 'scam',
    label: 'Scam Detector',
    icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
    desc: 'SMS, WhatsApp, emails & payments',
    badge: 'Urgency & Fraud',
  },
  {
    id: 'news',
    label: 'News Analyzer',
    icon: <Newspaper className="w-4 h-4 text-amber-400" />,
    desc: 'Headlines, claims & viral rumors',
    badge: 'Live Fact Check',
  },
  {
    id: 'url',
    label: 'Link Checker',
    icon: <Link2 className="w-4 h-4 text-sky-400" />,
    desc: 'URLs, shorteners & phishing domains',
    badge: 'Domain Safety',
  },
  {
    id: 'screenshot',
    label: 'Screenshot OCR',
    icon: <Camera className="w-4 h-4 text-emerald-400" />,
    desc: 'Upload images or capture via camera',
    badge: 'Visual Signals',
  },
];

export const AnalyzerTabs: React.FC<AnalyzerTabsProps> = ({ currentTab, onTabChange }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-2 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.4)]">
      {TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`group relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl transition-all duration-300 text-center ${
              isActive
                ? 'bg-gradient-to-b from-white/[0.12] to-white/[0.05] border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] text-white'
                : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            {/* Active Top Highlight indicator */}
            {isActive && (
              <div className="absolute top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-lens-400 to-cyan-400 shadow-[0_0_10px_rgba(14,165,233,0.8)]" />
            )}

            <div className="flex items-center gap-2 mb-1">
              <span className={`p-1.5 rounded-lg ${isActive ? 'bg-white/10' : 'bg-white/5'} transition-colors`}>
                {tab.icon}
              </span>
              <span className={`text-sm font-semibold tracking-tight ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                {tab.label}
              </span>
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:block max-w-[170px] truncate leading-tight">
              {tab.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
};
