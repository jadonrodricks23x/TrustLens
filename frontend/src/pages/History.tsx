import React, { useState, useEffect } from 'react';
import type { CompactHistoryItem } from '../services/storage';
import { getHistory, deleteHistoryItem, clearHistory } from '../services/storage';
import type { AnalysisResult } from '../types/analysis';
import { ResultCard } from '../components/ResultCard';
import { 
  Bookmark, Trash2, Clock, ShieldAlert, 
  Newspaper, Link2, Camera, Eye, ArrowLeft 
} from 'lucide-react';

export const History: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<CompactHistoryItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  const handleDeleteOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteHistoryItem(id);
    setHistoryItems(updated);
  };

  const handleClearAll = () => {
    clearHistory();
    setHistoryItems([]);
    setConfirmClear(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scam':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'news':
        return <Newspaper className="w-4 h-4 text-amber-500" />;
      case 'url':
        return <Link2 className="w-4 h-4 text-sky-500" />;
      case 'screenshot':
      default:
        return <Camera className="w-4 h-4 text-teal-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score <= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    if (score <= 80) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 60) return 'just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* If an item is opened in full view */}
      {selectedResult ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSelectedResult(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to History List</span>
          </button>

          <ResultCard
            result={selectedResult}
            onReset={() => setSelectedResult(null)}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                <Bookmark className="w-7 h-7 text-lens-500" />
                <span>Analysis History</span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Saved assessments stored locally in your browser without saving raw messages or screenshots.
              </p>
            </div>

            {historyItems.length > 0 && (
              <div>
                {!confirmClear ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All History</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <span className="text-xs text-rose-600 dark:text-rose-400 font-medium pl-2">
                      Clear all?
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
                    >
                      Yes, Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History List or Empty State */}
          {historyItems.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No Analysis History Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Assessments you save on the Analyze page using "Save Result" will be neatly cataloged here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.fullResult && setSelectedResult(item.fullResult)}
                  className="glass-card-hover rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                          {item.type}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {item.risk_level}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                        {item.verdict}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xl">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${getScoreColor(item.score)}`}>
                        {item.score} / 100
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatTimeAgo(item.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.fullResult) setSelectedResult(item.fullResult);
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteOne(item.id, e)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                        title="Delete from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
