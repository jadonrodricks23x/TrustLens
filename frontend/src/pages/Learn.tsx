import React, { useState } from 'react';
import type { QuizQuestion } from '../types/analysis';
import { 
  ShieldCheck, CheckCircle, XCircle, 
  BookOpen, Sparkles, RefreshCw, ChevronRight, Lock, Zap, 
  ExternalLink, Users, AlertCircle 
} from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    type: 'scam',
    title: 'Bank Security Alert SMS',
    scenario: 'SMS from unknown sender: "URGENT: Your HDFC Bank account has been temporarily locked due to suspicious activity. Verify immediately at http://hdfc-security-login.xyz/auth or your account will be permanently closed within 2 hours."',
    isSuspicious: true,
    correctAnswer: 'suspicious',
    explanation: 'Contains artificial urgency ("within 2 hours"), an unencrypted/misleading unofficial domain (.xyz instead of the official bank domain), and coercive suspension threats.',
    signals: ['Urgency coercion', 'Suspicious .xyz domain', 'Account suspension threat']
  },
  {
    id: 2,
    type: 'news',
    title: 'Health Breakthrough Claim',
    scenario: 'Viral social post: "BOMBSHELL: Drinking hot lemon water with baking soda 100% CURES all forms of diabetes! Big pharma and doctors hate this one simple trick. Share before they censor this secret!"',
    isSuspicious: true,
    correctAnswer: 'suspicious',
    explanation: 'Uses sensationalist tabloid framing ("BOMBSHELL"), absolute scientific claims ("100% cures all forms"), and classic conspiratorial clickbait tropes ("big pharma hates this").',
    signals: ['Sensationalist buzzwords', 'Absolute medical claim', 'Conspiratorial framing']
  },
  {
    id: 3,
    type: 'scam',
    title: 'Official Courier Delivery Update',
    scenario: 'Email from delivery@fedex.com: "Tracking #FX-8849204: Your package was attempted today at 2:15 PM. Delivery will be reattempted tomorrow during normal business hours. You may view tracking progress in your verified FedEx app."',
    isSuspicious: false,
    correctAnswer: 'safe',
    explanation: 'Legitimate notification from the official domain without high-pressure urgency, requests for payment cards, or suspicious external login links.',
    signals: ['Legitimate domain sender', 'No sensitive data requested', 'No artificial urgency']
  },
  {
    id: 4,
    type: 'url',
    title: 'Account Verification Link',
    scenario: 'Link received in WhatsApp message: "http://192.168.102.44:8080/secure/netflix/update-billing-method"',
    isSuspicious: true,
    correctAnswer: 'suspicious',
    explanation: 'Uses a raw numerical IP address instead of the official netflix.com domain, an unencrypted HTTP protocol, and an unusual port (:8080) to solicit billing credentials.',
    signals: ['Raw IP address hostname', 'Unencrypted HTTP protocol', 'Credential phishing keywords']
  },
  {
    id: 5,
    type: 'scam',
    title: 'Work From Home Job Offer',
    scenario: 'Telegram message: "Congratulations! Our international marketing agency selected you for high-paying remote review work ($300/day). Please deposit $50 security deposit via crypto wallet to activate your worker account today."',
    isSuspicious: true,
    correctAnswer: 'suspicious',
    explanation: 'Classic advance-fee task scam. Legitimate employers never require upfront cryptocurrency deposits or security fees from job candidates.',
    signals: ['Advance-fee payment demand', 'Cryptocurrency payment method', 'Unsolicited high wage claim']
  }
];

const EDUCATIONAL_CARDS = [
  {
    title: 'Phishing',
    subtitle: 'Common deception signs',
    icon: <Lock className="w-5 h-5 text-rose-500" />,
    desc: 'Attackers create convincing duplicates of trusted brands to steal credentials. Look for mismatched sender emails, generic greetings, and deceptive landing URLs.',
  },
  {
    title: 'Social Engineering',
    subtitle: 'How manipulation works',
    icon: <Users className="w-5 h-5 text-indigo-500" />,
    desc: 'Exploits natural human reflexes like fear, urgency, greed, or helpfulness. Scammers manufacture artificial crises to bypass your critical thinking.',
  },
  {
    title: 'Clickbait',
    subtitle: 'Attention manipulation',
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    desc: 'Headlines engineered with extreme emotional hooks or withheld information ("You won\'t believe what happened next") to harvest ad clicks regardless of truth.',
  },
  {
    title: 'Fake Offers',
    subtitle: 'Prize & lottery schemes',
    icon: <Sparkles className="w-5 h-5 text-teal-500" />,
    desc: 'Unsolicited notifications claiming you won a cash reward, device, or lottery. Real lotteries never require taxes or release fees paid upfront via wire or gift cards.',
  },
  {
    title: 'Impersonation',
    subtitle: 'Faking trusted institutions',
    icon: <ShieldCheck className="w-5 h-5 text-sky-500" />,
    desc: 'Fraudsters impersonate tax departments, banks, or police officers demanding immediate compliance. Government agencies communicate through formal registered channels.',
  },
  {
    title: 'Misinformation vs Disinformation',
    subtitle: 'Understanding intent',
    icon: <AlertCircle className="w-5 h-5 text-purple-500" />,
    desc: 'Misinformation is false information shared without malicious intent. Disinformation is deliberately created and spread to deceive, sow division, or profit.',
  },
  {
    title: 'Suspicious URLs',
    subtitle: 'Common phishing URL patterns',
    icon: <ExternalLink className="w-5 h-5 text-orange-500" />,
    desc: 'Watch for raw IP addresses, typosquatting (e.g. paypa1.com), suspicious TLDs (.xyz, .top, .buzz), and excessive subdomains hiding the actual base domain.',
  },
];

export const Learn: React.FC = () => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'safe' | 'suspicious'>>({});
  const [scoreCount, setScoreCount] = useState(0);

  const currentQ = QUIZ_QUESTIONS[currentQuizIndex];
  const hasAnsweredCurrent = selectedAnswers[currentQ.id] !== undefined;

  const handleAnswer = (choice: 'safe' | 'suspicious') => {
    if (hasAnsweredCurrent) return;
    const isCorrect = choice === currentQ.correctAnswer;
    if (isCorrect) {
      setScoreCount((prev) => prev + 1);
    }
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: choice }));
  };

  const handleNextQuiz = () => {
    if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
    }
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuizIndex(0);
    setScoreCount(0);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lens-500/10 text-lens-600 dark:text-lens-400 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Digital Literacy & Signal Education</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Learn How Deception Works
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Equip yourself with the mental patterns and threat indicators necessary to spot scams, false claims, and deceptive links.
        </p>
      </div>

      {/* QUIZ SECTION (Zero Token, Local JSON) */}
      <section className="glass-card rounded-2xl p-6 sm:p-10 border-lens-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/70 dark:border-slate-800">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-lens-500">
              Interactive Signal Test (Zero Token)
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Can You Spot the Scam?
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Question {currentQuizIndex + 1} of {QUIZ_QUESTIONS.length}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-lens-500/10 text-lens-600 dark:text-lens-400">
              Score: {scoreCount}
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
              Scenario: {currentQ.title}
            </h3>
            <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
              {currentQ.scenario}
            </div>
          </div>

          {/* Answer Choice Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              disabled={hasAnsweredCurrent}
              onClick={() => handleAnswer('safe')}
              className={`py-3.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                hasAnsweredCurrent
                  ? currentQ.correctAnswer === 'safe'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : selectedAnswers[currentQ.id] === 'safe'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400 opacity-60'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:scale-[1.01]'
              }`}
            >
              Looks Safe
            </button>

            <button
              type="button"
              disabled={hasAnsweredCurrent}
              onClick={() => handleAnswer('suspicious')}
              className={`py-3.5 px-4 rounded-xl text-sm font-semibold transition-all border ${
                hasAnsweredCurrent
                  ? currentQ.correctAnswer === 'suspicious'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : selectedAnswers[currentQ.id] === 'suspicious'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400 opacity-60'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:scale-[1.01]'
              }`}
            >
              Looks Suspicious
            </button>
          </div>

          {/* Explanation after answering */}
          {hasAnsweredCurrent && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                {selectedAnswers[currentQ.id] === currentQ.correctAnswer ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <CheckCircle className="w-4 h-4" />
                    <span>Correct Analysis</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    <XCircle className="w-4 h-4" />
                    <span>Misclassified</span>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Key Signals:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {currentQ.signals.map((sig, i) => (
                    <span key={i} className="text-xs font-medium px-2 py-0.5 rounded-md bg-lens-500/10 text-lens-700 dark:text-lens-300">
                      🚩 {sig}
                    </span>
                  ))}
                </div>
              </div>

              {/* Navigation button */}
              <div className="pt-2 flex justify-end">
                {currentQuizIndex < QUIZ_QUESTIONS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextQuiz}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-lens-600 hover:bg-lens-700 text-white transition-colors"
                  >
                    <span>Next Example</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRestartQuiz}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restart Quiz</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* EDUCATIONAL KNOWLEDGE CARDS (Section 17) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Essential Safety Guides
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Concise explanations of deceptive patterns encountered in modern digital communication.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {EDUCATIONAL_CARDS.map((card, idx) => (
            <div key={idx} className="glass-card-hover rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {card.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {card.title}
                </h3>
                <span className="text-xs text-lens-500 font-medium">
                  {card.subtitle}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
