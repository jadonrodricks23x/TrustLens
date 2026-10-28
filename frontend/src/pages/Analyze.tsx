import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Sparkles, Image as ImageIcon, Camera, X, RefreshCw, 
  Check, FlipHorizontal, AlertCircle, ClipboardPaste
} from 'lucide-react';

const SAMPLE_PRESETS: Record<AnalysisType, { label: string; text: string }[]> = {
  scam: [
    { label: "💳 Bank OTP Scam", text: "URGENT: Your HDFC Bank account has been temporarily locked due to suspicious activity. Verify your OTP within 10 minutes at http://bit.ly/bank-security-verify to prevent permanent closure." },
    { label: "🎁 Lottery Prize", text: "Congratulations! You have won ₹50,000 in the Google 2026 Annual Rewards. Send your Aadhaar and bank details to claim." },
    { label: "💼 Remote Job Offer", text: "Daily Part-Time Job: Earn $300-$500 per day by rating products online. Pay $30 registration deposit to start immediately." },
  ],
  news: [
    { label: "📰 Nana Patekar Passing", text: "Nana Patekar is dead" },
    { label: "🔍 Modi Death Rumor", text: "Modi is dead" },
    { label: "🍋 Lemon Water Cancer Cure", text: "Drinking boiled lemon water cures cancer and eliminates diabetes in 24 hours" },
    { label: "🌍 Climate Study", text: "According to Reuters, international meteorological researchers reported an average 1.2 degree increase in sea surface temperatures." },
  ],
  url: [
    { label: "🚨 Phishing Login", text: "http://paypal-security-update.xyz/login" },
    { label: "✂️ Bitly Redirect", text: "http://bit.ly/bank-unlock-urgent" },
    { label: "✅ Verified Domain", text: "https://github.com" },
  ],
  screenshot: []
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
  const [imageSource, setImageSource] = useState<'upload' | 'camera' | null>(null);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedTempPreview, setCapturedTempPreview] = useState<string | null>(null);
  const [capturedTempFile, setCapturedTempFile] = useState<File | null>(null);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showUrlWarningModal, setShowUrlWarningModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping camera track', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Cleanup on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);

  // Update URL param when tab changes
  const handleTabChange = (tab: AnalysisType) => {
    if (isCameraOpen) {
      stopCameraStream();
      setIsCameraOpen(false);
    }
    setActiveTab(tab);
    setSearchParams({ mode: tab });
    setErrorMsg(null);
  };

  // Image preview handler for file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setErrorMsg(validation.error || 'Invalid file');
        return;
      }
      setSelectedFile(file);
      setImageSource('upload');
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Start Camera Stream
  const startCamera = async (facing: 'environment' | 'user' = 'environment') => {
    setCameraError(null);
    setCapturedTempPreview(null);
    setCapturedTempFile(null);
    setCameraLoading(true);
    setIsCameraOpen(true);

    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraLoading(false);
      setCameraError('Camera API is not supported on this browser. You can still use the Upload Image option or select from your gallery.');
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch {
        // Fallback to basic video request if ideal constraints fail
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      setCameraFacingMode(facing);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setCameraLoading(false);
    } catch (err: unknown) {
      setCameraLoading(false);
      stopCameraStream();
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera access was denied. Please allow camera permission in your browser or address bar settings, or use "Upload Image".');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera device was detected on your system. Please use the Upload Image option.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError('Your camera is currently in use by another application. Please close other camera apps and try again.');
        } else {
          setCameraError(`Camera error: ${err.message}. You can still use the Upload Image option.`);
        }
      } else {
        setCameraError('Unable to access camera. Please use the Upload Image option.');
      }
    }
  };

  // Switch between front and rear cameras
  const handleToggleFacingMode = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextFacing);
  };

  // Close Camera Modal
  const handleCloseCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCapturedTempPreview(null);
    setCapturedTempFile(null);
    setCameraError(null);
  };

  // Capture Photo from Video Stream
  const handleCapturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Failed to capture frame from camera.');
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const photoFile = new File([blob], `trustlens_photo_${timestamp}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });

      const validation = validateImageFile(photoFile);
      if (!validation.valid) {
        setCameraError(validation.error || 'Captured image is invalid.');
        return;
      }

      const previewUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedTempPreview(previewUrl);
      setCapturedTempFile(photoFile);
      // Pause video while reviewing captured photo
      try {
        video.pause();
      } catch {}
    }, 'image/jpeg', 0.92);
  };

  // Retake inside Camera Modal
  const handleRetakeCameraPhoto = () => {
    setCapturedTempPreview(null);
    setCapturedTempFile(null);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Confirm photo and use it in analysis
  const handleUseCameraPhoto = () => {
    if (capturedTempFile && capturedTempPreview) {
      setSelectedFile(capturedTempFile);
      setFilePreview(capturedTempPreview);
      setImageSource('camera');
      setErrorMsg(null);
      handleCloseCamera();
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setImageSource(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mobileCameraInputRef.current) mobileCameraInputRef.current.value = '';
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
          setErrorMsg('Please upload a screenshot image or take a picture (PNG, JPG, or WEBP).');
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

  // Handle escape key to close camera modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCameraOpen) {
        handleCloseCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCameraOpen]);

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
        <div className="apple-glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Quick Sample Presets */}
          {activeTab !== 'screenshot' && (
            <div className="space-y-2 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-lens-400" />
                  <span>Quick Test Samples</span>
                </span>
                <span className="text-xs text-slate-500">
                  Click to prefill and analyze
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRESETS[activeTab]?.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (activeTab === 'scam') setScamInput(sample.text);
                      if (activeTab === 'news') setNewsInput(sample.text);
                      if (activeTab === 'url') setUrlInput(sample.text);
                    }}
                    className="apple-pill-btn px-3 py-1.5 rounded-xl text-xs font-medium hover:border-lens-400/50"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                  className="w-full p-4.5 rounded-2xl apple-glass-input text-sm text-white placeholder:text-slate-500 focus:outline-none resize-y min-h-[160px] leading-relaxed"
                />
                <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-black/40">
                  {scamInput.length} / 5000
                </div>
              </div>

              {/* Real-time detected local hints */}
              {scamHints.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-lens-500/10 border border-lens-500/25 text-xs space-y-1.5 backdrop-blur-md">
                  <div className="font-semibold text-lens-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-lens-400 animate-pulse" />
                    <span>Preliminary patterns recognized in real time:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {scamHints.map((hint, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-lens-500/15 border border-lens-500/30 text-lens-200 font-medium text-[11px]">
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
                  placeholder="Paste a headline, claim or article to verify against live Google News & Wikipedia..."
                  className="w-full p-4.5 rounded-2xl apple-glass-input text-sm text-white placeholder:text-slate-500 focus:outline-none resize-y min-h-[170px] leading-relaxed"
                />
                <div className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-md bg-black/40">
                  {newsInput.length} / 8000
                </div>
              </div>

              {/* Real-time detected news hints */}
              {newsHints.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-lens-500/10 border border-lens-500/25 text-xs space-y-1.5 backdrop-blur-md">
                  <div className="font-semibold text-lens-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-lens-400 animate-pulse" />
                    <span>Preliminary claim patterns detected:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {newsHints.map((hint, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-lens-500/15 border border-lens-500/30 text-lens-200 font-medium text-[11px]">
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
                  className="w-full p-4.5 pr-36 rounded-2xl apple-glass-input text-sm text-white placeholder:text-slate-500 font-mono focus:outline-none"
                />
                <div className="absolute right-3 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const clip = await navigator.clipboard.readText();
                        if (clip) setUrlInput(clip.trim());
                      } catch {
                        // ignore clipboard error
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 transition-colors"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Paste</span>
                  </button>
                  {urlInput.trim() && (
                    <button
                      type="button"
                      onClick={() => setShowUrlWarningModal(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-sky-300 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 transition-colors"
                      title="Open URL with security prompt"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Real-time detected URL hints */}
              {urlHints.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-lens-500/10 border border-lens-500/25 text-xs space-y-1.5 backdrop-blur-md">
                  <div className="font-semibold text-lens-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-lens-400 animate-pulse" />
                    <span>Preliminary URL signals:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {urlHints.map((hint, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-lens-500/15 border border-lens-500/30 text-lens-200 font-medium text-[11px]">
                        {hint}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SCREENSHOT ANALYZER (With Two Input Options: Upload Image & Take Picture) */}
          {activeTab === 'screenshot' && (
            <div className="space-y-4">
              {!filePreview ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Choose how you want to provide your screenshot or document image:
                  </p>

                  {/* Two Options Side-by-Side on Desktop, Stacked on Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Option 1: Upload Image */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="glass-card-hover rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-lens-500 dark:hover:border-lens-400 transition-all"
                      aria-label="Upload Image from your device"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-lens-500/10 text-lens-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
                        <Upload className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
                        Upload Image
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                        Select an existing PNG, JPG, JPEG, or WEBP screenshot from your device.
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-lens-600 group-hover:text-white transition-colors">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Choose File</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 font-mono">Max size: 5 MB</span>
                    </button>

                    {/* Option 2: Take Picture */}
                    <button
                      type="button"
                      onClick={() => startCamera('environment')}
                      className="glass-card-hover rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 transition-all"
                      aria-label="Take picture using device camera"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-sm">
                        <Camera className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
                        Take Picture
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                        Use your phone or computer camera to snap a photo of a screen, message, or receipt.
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Open Camera</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 font-mono">Rear camera preferred</span>
                    </button>
                  </div>

                  {/* Hidden file input for standard file upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-hidden="true"
                  />

                  {/* Hidden mobile camera fallback input if needed */}
                  <input
                    ref={mobileCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-hidden="true"
                  />
                </div>
              ) : (
                /* Captured / Selected Image Preview State */
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/20 p-4 space-y-3">
                  {/* Image Information & Quick Actions Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {imageSource === 'camera' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                            <Camera className="w-3 h-3" />
                            <span>Camera Photo</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-lens-500/10 text-lens-600 dark:text-lens-400 border border-lens-500/20">
                            <ImageIcon className="w-3 h-3" />
                            <span>Uploaded Image</span>
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                          {selectedFile?.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {(selectedFile?.size || 0) / 1024 < 1000 
                          ? `${Math.round((selectedFile?.size || 0) / 1024)} KB` 
                          : `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`} • {selectedFile?.type || 'image/jpeg'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Retake or Replace Button */}
                      {imageSource === 'camera' ? (
                        <button
                          type="button"
                          onClick={() => startCamera(cameraFacingMode)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                          aria-label="Retake camera photo"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retake</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                          aria-label="Replace selected file"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Replace</span>
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Image Display */}
                  <div className="flex justify-center max-h-80 overflow-hidden rounded-xl bg-slate-900/50 p-2">
                    <img
                      src={filePreview}
                      alt="Selected screenshot preview for safety analysis"
                      className="max-h-80 object-contain rounded-lg shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleClear}
              className="apple-pill-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium text-slate-300 hover:text-white"
            >
              <Trash2 className="w-4 h-4 text-slate-400" />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={handleAnalyze}
              className="apple-primary-btn inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-semibold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {activeTab === 'screenshot' && selectedFile
                  ? 'Analyze Screenshot'
                  : 'Analyze with TrustLens'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* CAMERA VIEWFINDER MODAL */}
      {isCameraOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="camera-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div className="w-full max-w-lg glass-card rounded-2xl overflow-hidden shadow-2xl border border-slate-700 space-y-0 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-sky-400" />
                <h3 id="camera-modal-title" className="text-base font-bold text-white">
                  Take Picture
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch Camera Button (Front / Rear) */}
                {!capturedTempPreview && !cameraLoading && !cameraError && (
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title={`Switch camera (currently ${cameraFacingMode === 'environment' ? 'rear' : 'front'})`}
                    aria-label="Switch camera"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleCloseCamera}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Cancel and close camera"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewfinder / Preview Body */}
            <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
              {cameraLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 text-white space-y-3">
                  <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-medium text-slate-300">
                    Connecting to camera stream...
                  </p>
                </div>
              )}

              {cameraError ? (
                <div className="p-6 text-center space-y-4 max-w-md">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Camera Unavailable
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => startCamera(cameraFacingMode)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseCamera();
                        fileInputRef.current?.click();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File Instead</span>
                    </button>
                  </div>
                </div>
              ) : capturedTempPreview ? (
                /* Freeze frame preview after snapping photo */
                <div className="relative w-full h-full flex items-center justify-center p-2">
                  <img
                    src={capturedTempPreview}
                    alt="Captured camera freeze frame"
                    className="max-h-[340px] sm:max-h-[380px] w-auto object-contain rounded-lg"
                  />
                  <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[11px] font-semibold text-emerald-400 flex items-center gap-1 border border-emerald-500/30">
                    <Check className="w-3 h-3" />
                    <span>Photo Captured</span>
                  </div>
                </div>
              ) : (
                /* Active video streaming */
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain max-h-[360px] sm:max-h-[420px]"
                  />
                  {/* Subtle viewfinder alignment grid */}
                  <div className="pointer-events-none absolute inset-6 sm:inset-10 border border-sky-400/30 rounded-2xl flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-sky-400" />
                      <div className="w-4 h-4 border-t-2 border-r-2 border-sky-400" />
                    </div>
                    <div className="flex justify-between">
                      <div className="w-4 h-4 border-b-2 border-l-2 border-sky-400" />
                      <div className="w-4 h-4 border-b-2 border-r-2 border-sky-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Controls / Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCloseCamera}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                aria-label="Cancel camera and return"
              >
                Cancel
              </button>

              {!cameraError && (
                <div className="flex items-center gap-2">
                  {capturedTempPreview ? (
                    <>
                      <button
                        type="button"
                        onClick={handleRetakeCameraPhoto}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        aria-label="Retake picture"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retake</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleUseCameraPhoto}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white transition-colors shadow-sm"
                        aria-label="Confirm and use this photo for analysis"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Use This Photo</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={cameraLoading}
                      onClick={handleCapturePhoto}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sky-500 hover:bg-sky-600 active:scale-95 text-white transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
                      aria-label="Capture photo now"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Photo</span>
                    </button>
                  )}
                </div>
              )}
            </div>
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
