import React from 'react';
import type { AnalysisType } from '../types/analysis';
import { ShieldAlert, Newspaper, Link2, Camera } from 'lucide-react';

interface AnalyzerTabsProps {
  currentTab: AnalysisType;
  onTabChange: (tab: AnalysisType) => void;
}

const TABS: { id: AnalysisType; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'scam',
    label: 'Scam',
    icon: <ShieldAlert className="w-4 h-4" />,
    desc: 'SMS, WhatsApp & Emails',
  },
  {
    id: 'news',
    label: 'News',
    icon: <Newspaper className="w-4 h-4" />,
    desc: 'Claims & Headlines',
  },
  {
    id: 'url',
    label: 'Link',
    icon: <Link2 className="w-4 h-4" />,
    desc: 'URLs & Suspicious Domains',
  },
  {
    id: 'screenshot',
    label: 'Screenshot',
    icon: <Camera className="w-4 h-4" />,
    desc: 'OCR Text & Image Safety',
  },
];

export const AnalyzerTabs: React.FC<AnalyzerTabsProps> = ({ currentTab, onTabChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-1.5 bg-slate-100/80 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800">
      {TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 text-center ${
              isActive
                ? 'bg-white dark:bg-slate-800 text-lens-600 dark:text-lens-400 shadow-sm border border-slate-200/70 dark:border-slate-700 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span>{tab.icon}</span>
              <span className="text-sm font-semibold">{tab.label}</span>
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              {tab.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
};
