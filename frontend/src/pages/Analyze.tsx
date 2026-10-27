import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AnalysisType, AnalysisResult } from '../types/analysis';
import { AnalyzerTabs } from '../components/AnalyzerTabs';
import { ResultCard } from '../components/ResultCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { analyzeScam, analyzeNews, analyzeUrl, analyzeScreenshot } from '../services/api';
import { validateMessageLength, isValidUrl, validateImageFile } from '../utils/validation';
import { detectLocalScamHints } from '../utils/scamSignals';
import { detectLocalNewsHints } from '../utils/newsSignals';
import { detectLocalUrlHints } from '../utils/urlSignals';
import { 
  Send, Trash2, Upload, ExternalLink, AlertTriangle, 
  Sparkles, Image as ImageIcon, X 
} from 'lucide-react';

const SAMPLES = {
  scam: "Congratulations! You have won ₹50,000. Send your OTP immediately to claim your reward.",
  news: "Scientists have discovered that drinking one cup of coffee every day guarantees you will live 20 years longer.",
  url: "https://example.com/claim-prize",
};

export const Analyze: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as AnalysisType) || 'scam';

  const [activeTab, setActiveTab] = useState<AnalysisType>(
    ['scam', 'news', 'url', 'screenshot'].includes(initialMode) ? initialMode : 'scam'
  );

  // Inputs
  const [scamInput, setScamInput] = useState('');
  const [newsInput, setNewsInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showUrlWarningModal, setShowUrlWarningModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update URL param when tab changes
  const handleTabChange = (tab: AnalysisType) => {
    setActiveTab(tab);
    setSearchParams({ mode: tab });
    setErrorMsg(null);
  };

  // Image preview handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setErrorMsg(validation.error || 'Invalid file');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    if (activeTab === 'scam') setScamInput('');
    if (activeTab === 'news') setNewsInput('');
    if (activeTab === 'url') setUrlInput('');
    if (activeTab === 'screenshot') handleRemoveImage();
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    setErrorMsg(null);
    setResult(null);

    try {
      if (activeTab === 'scam') {
        const val = validateMessageLength(scamInput, 5000);
        if (!val.valid) {
          setErrorMsg(val.error || 'Invalid message content');
          return;
        }
        setIsLoading(true);
        const res = await analyzeScam(scamInput);
        setResult(res);
      } else if (activeTab === 'news') {
        const val = validateMessageLength(newsInput, 8000);
        if (!val.valid) {
          setErrorMsg(val.error || 'Invalid news content');
          return;
        }
        setIsLoading(true);
        const res = await analyzeNews(newsInput);
        setResult(res);
      } else if (activeTab === 'url') {
        if (!urlInput.trim()) {
          setErrorMsg('Please enter a website URL.');
          return;
        }
        if (!isValidUrl(urlInput)) {
          setErrorMsg('Please enter a valid URL (e.g., https://example.com).');
          return;
        }
        setIsLoading(true);
        const res = await analyzeUrl(urlInput);
        setResult(res);
      } else if (activeTab === 'screenshot') {
        if (!selectedFile) {
          setErrorMsg('Please upload a screenshot image (PNG, JPG, or WEBP).');
          return;
        }
        setIsLoading(true);
        const res = await analyzeScreenshot(selectedFile);
        setResult(res);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('An unexpected error occurred during analysis.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Live client-side hint detection
  const scamHints = scamInput.length > 10 ? detectLocalScamHints(scamInput) : [];
  const newsHints = newsInput.length > 10 ? detectLocalNewsHints(newsInput) : [];
  const urlHints = urlInput.length > 5 ? detectLocalUrlHints(urlInput) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          What do you want to check?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Select a category, paste the content or upload an image, and inspect detected signals.
        </p>
      </div>

      {/* Mode Tabs */}
      <AnalyzerTabs currentTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Container Area */}
      {isLoading ? (
        <LoadingState />
      ) : result ? (
        <ResultCard
          result={result}
          onReset={() => {
            setResult(null);
            handleClear();
          }}
        />
      ) : errorMsg && !result ? (
        <ErrorState
          message={errorMsg}
          onRetry={handleAnalyze}
          onReset={() => setErrorMsg(null)}
        />
      ) : (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Sample Data Quick Fill */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {activeTab === 'scam' && 'Suspicious Message / Email Analyzer'}
              {activeTab === 'news' && 'News Headline / Claim Verifier'}
              {activeTab === 'url' && 'URL Safety Inspector'}
              {activeTab === 'screenshot' && 'Screenshot OCR & Safety Analyzer'}
            </span>

            {activeTab !== 'screenshot' && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'scam') setScamInput(SAMPLES.scam);
                  if (activeTab === 'news') setNewsInput(SAMPLES.news);
                  if (activeTab === 'url') setUrlInput(SAMPLES.url);
                }}
                className="text-xs font-medium text-lens-600 dark:text-lens-400 hover:underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load sample example</span>
              </button>
            )}
          </div>

          {/* TAB 1: SCAM ANALYZER */}
          {activeTab === 'scam' && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={scamInput}
                  onChange={(e) => setScamInput(e.target.value)}
                  maxLength={5000}
                  rows={7}
                  placeholder="Paste a suspicious message, email, job offer, payment request or social-media message..."
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-lens-500 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-y min-h-[160px]"
                />
                <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-400">
                  {scamInput.length} / 5000
                </div>
              </div>

              {/* Real-time detected local hints */}
              {scamHints.length > 0 && (
                <div className="p-3 rounded-xl bg-lens-500/5 border border-lens-500/20 text-xs space-y-1">
                  <div className="font-semibold text-lens-600 dark:text-lens-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Preliminary patterns recognized:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {scamHints.map((hint, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-lens-500/10 text-lens-700 dark:text-lens-300 font-medium text-[11px]">
                        {hint}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NEWS ANALYZER */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={newsInput}
                  onChange={(e) => setNewsInput(e.target.value)}
                  maxLength={8000}
                  rows={8}
                  placeholder="Paste a headline, claim or article..."
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-lens-500 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-y min-h-[170px]"
                />
                <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-400">
                  {newsInput.length} / 8000
                </div>
              </div>

              {/* Real-time detected news hints */}
              {newsHints.length > 0 && (
                <div className="p-3 rounded-xl bg-lens-500/5 border border-lens-500/20 text-xs space-y-1">
                  <div className="font-semibold text-lens-600 dark:text-lens-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Preliminary claim patterns detected:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {newsHints.map((hint, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-lens-500/10 text-lens-700 dark:text-lens-300 font-medium text-[11px]">
                        {hint}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: URL CHECKER */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div className="relative flex items-center">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/login-verification"
                  className="w-full p-4 pr-24 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-lens-500 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-mono"
                />
                {urlInput.trim() && (
                  <button
                    type="button"
                    onClick={() => setShowUrlWarningModal(true)}
                    className="absolute right-3 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    title="Open URL with security prompt"
                  >
                    <span>Open URL</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Real-time detected URL hints */}
              {urlHints.length > 0 && (
                <div className="p-3 rounded-xl bg-lens-500/5 border border-lens-500/20 text-xs space-y-1">
                  <div className="font-semibold text-lens-600 dark:text-lens-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Preliminary URL signals:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {urlHints.map((hint, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-lens-500/10 text-lens-700 dark:text-lens-300 font-medium text-[11px]">
                        {hint}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SCREENSHOT ANALYZER */}
          {activeTab === 'screenshot' && (
            <div className="space-y-4">
              {!filePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-lens-500 dark:hover:border-lens-400 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-colors group bg-slate-50/50 dark:bg-slate-900/50"
                >
                  <div className="w-14 h-14 rounded-2xl bg-lens-500/10 text-lens-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Click or drag screenshot here to upload
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supports PNG, JPG, JPEG, or WEBP up to 5MB.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/20 p-4">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <ImageIcon className="w-4 h-4 text-lens-500" />
                      <span>{selectedFile?.name} ({(selectedFile?.size || 0) / 1024 < 1000 ? `${Math.round((selectedFile?.size || 0) / 1024)} KB` : `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(1)} MB`})</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove Image</span>
                    </button>
                  </div>

                  <div className="flex justify-center max-h-72 overflow-hidden rounded-xl bg-slate-900/40">
                    <img
                      src={filePreview}
                      alt="Uploaded screenshot preview"
                      className="max-h-72 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200/70 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={handleAnalyze}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-lens-600 hover:bg-lens-700 text-white transition-all shadow-md shadow-lens-500/20 hover:scale-[1.01]"
            >
              <Send className="w-4 h-4" />
              <span>Analyze</span>
            </button>
          </div>
        </div>
      )}

      {/* Security Caution Modal for Open URL */}
      {showUrlWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md glass-card rounded-2xl p-6 space-y-4 border-amber-500/30">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Caution Before Opening External Link
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              You are preparing to visit an external website:
              <br />
              <code className="text-xs font-mono text-lens-500 break-all block mt-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                {urlInput}
              </code>
              <br />
              Never enter passwords, bank credentials, or personal identity numbers on unfamiliar or unverified websites.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUrlWarningModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>

              <a
                href={urlInput.startsWith('http') ? urlInput : `https://${urlInput}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowUrlWarningModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-lens-600 hover:bg-lens-700 text-white inline-flex items-center gap-1.5"
              >
                <span>Proceed to URL</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
