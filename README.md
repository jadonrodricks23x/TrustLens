# TrustLens AI

> **Look closer. Trust smarter.**

TrustLens AI is an explainable AI-powered digital safety platform that helps users analyze suspicious messages, viral news claims, deceptive URLs, and screenshots. 

Unlike conventional security tools that return opaque verdicts like "SAFE" or "MALICIOUS", TrustLens AI is built on one foundational principle:
> **"Don't just give a verdict. Explain the signals."**

Every assessment breaks down detected signals, provides a calibrated **TrustLens Score (0–100)**, details why the signals matter, and suggests practical, safe next steps without ever claiming infallible certainty.

---

## 🌟 Key Features

1. **🚨 Scam Detector**
   - Analyzes SMS, WhatsApp messages, phishing emails, fake job offers, and payment requests.
   - Detects local urgency tactics, OTP/password solicitation, fake rewards, and coercive suspension threats.
2. **📰 News & Claim Verifier**
   - Assesses viral headlines, unverified health claims, and social media posts.
   - Identifies sensationalist framing, absolute medical claims, clickbait constructs, and missing citations.
3. **🔗 Link & URL Safety Checker**
   - Safely inspects URLs without risky server crawls.
   - Detects raw IP hosts, non-standard ports, redirection shorteners, spoofed subdomains, and credential-harvesting paths. Includes an external link caution modal.
4. **📸 Screenshot OCR Analyzer**
   - Supports PNG, JPG, JPEG, and WEBP uploads (up to 5MB).
   - In-memory OCR extraction analyzes extracted text without permanent disk retention.
5. **🧠 Zero-Token Educational Hub & Quiz**
   - 7 concise threat breakdown guides (Phishing, Social Engineering, Clickbait, Fake Offers, Impersonation, Misinformation vs. Disinformation, Suspicious URLs).
   - **"Can You Spot the Scam?"** interactive 5-question test running 100% locally from static data (0 AI tokens consumed).
6. **💾 Private Local History**
   - LocalStorage-based history saving compact results without persisting sensitive raw messages or images.
7. **🌗 Modern Accessible Design**
   - Dark mode by default with light mode toggle.
   - Fluid responsiveness across mobile (320px, 375px, 430px) and desktop (1024px, 1440px).

---

## 🔬 Calibrated Score System

| Score Range | Risk Level | Meaning |
| :--- | :--- | :--- |
| **0 – 30** | 🟢 **LOW CONCERN** | Standard expected communication patterns. |
| **31 – 60** | 🟡 **NEEDS VERIFICATION** | Ambiguities, atypical structure, or missing source attribution. |
| **61 – 80** | 🟠 **SUSPICIOUS** | Multiple deceptive patterns, masking, or pressure tactics detected. |
| **81 – 100** | 🔴 **HIGH RISK INDICATORS** | Direct requests for credentials, OTPs, advance payments, or severe coercion. |

---

## 🏗️ Architecture & Token Optimization Pipeline

```text
User Input (Text / URL / Screenshot)
              ↓
    Input & File Validation
              ↓
  Deterministic Local Signal Detection (Urgency, OTP, IP, Punctuation, etc.)
              ↓
  AI Analysis (Exactly ONE Single Token-Optimized JSON Request)
              ↓
  JSON Schema Validation & Fallback Handling
              ↓
  TrustLens Reusable Result Card (Score, Signals, Why It Matters, What To Do)
```

- **Token Optimization:** Local heuristics run first. Only relevant content snippets and detected pattern tags are sent to the AI in **exactly one request** per analysis. No previous chat history or UI layout data is transmitted.
- **Graceful Fallback:** If an OpenAI API key is not configured, or if the network request fails, TrustLens automatically activates its deterministic pattern engine (`is_mock: true` / `local_signals_only: true`).

---

## 📂 Project Structure

```text
TrustLens-AI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Brand, theme toggle, mobile drawer
│   │   │   ├── Footer.tsx          # Disclaimer and navigation
│   │   │   ├── AnalyzerTabs.tsx    # Mode selector tabs
│   │   │   ├── ResultCard.tsx      # Reusable assessment card with Copy & Save
│   │   │   ├── SignalCard.tsx      # Individual explainable signal cards
│   │   │   ├── ScoreDisplay.tsx    # Gauge meter & risk badges
│   │   │   ├── LoadingState.tsx    # 3-stage animated scanner
│   │   │   └── ErrorState.tsx      # Graceful error & retry UI
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Hero, feature grid, Why TrustLens
│   │   │   ├── Analyze.tsx         # Unified analyzer interface
│   │   │   ├── History.tsx         # Local history viewer & manager
│   │   │   ├── Learn.tsx           # Guides & Spot the Scam quiz
│   │   │   └── About.tsx           # Architecture & limitations
│   │   ├── services/
│   │   │   ├── api.ts              # Centralized backend HTTP client
│   │   │   └── storage.ts          # LocalStorage manager
│   │   ├── utils/
│   │   │   ├── scamSignals.ts      # Fast client-side hint detector
│   │   │   ├── newsSignals.ts      # Client-side news patterns
│   │   │   ├── urlSignals.ts       # Client-side URL patterns
│   │   │   └── validation.ts       # Format and length checks
│   │   ├── types/
│   │   │   └── analysis.ts         # TypeScript interfaces
│   │   ├── App.tsx                 # Routing & theme provider
│   │   └── index.css               # Tailwind & glassmorphism utilities
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── routes/
│   │   ├── scam.py                 # POST /api/analyze/scam
│   │   ├── news.py                 # POST /api/analyze/news
│   │   ├── url.py                  # POST /api/analyze/url
│   │   └── screenshot.py           # POST /api/analyze/screenshot
│   ├── services/
│   │   ├── ai_service.py           # OpenAI-compatible client
│   │   ├── mock_service.py         # Calibrated deterministic fallback engine
│   │   └── ocr_service.py          # In-memory image processing
│   ├── models/
│   │   └── schemas.py              # Pydantic schemas
│   ├── utils/
│   │   ├── scam_analyzer.py        # Local message heuristics
│   │   ├── news_analyzer.py        # Local headline heuristics
│   │   ├── url_analyzer.py         # Local URL structure heuristics
│   │   └── rate_limiter.py         # Sliding window rate limiter
│   ├── main.py                     # FastAPI app & CORS middleware
│   ├── requirements.txt
│   └── test_all_endpoints.py       # Automated test suite
│
├── README.md
├── .gitignore
└── .env.example
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `backend/.env` (or project root):

```bash
cp .env.example backend/.env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | OpenAI API key. Leave blank to run in deterministic smart mock mode. | *(empty)* |
| `OPENAI_MODEL` | Target language model for assessment. | `gpt-4o-mini` |
| `OPENAI_BASE_URL`| Custom OpenAI-compatible endpoint. | `https://api.openai.com/v1` |
| `FRONTEND_URL` | Allowed origin for CORS. | `http://localhost:5173` |
| `PORT` | Backend server port. | `8000` |

> 🔒 **Security Notice:** The frontend never consumes API keys directly. All AI communication flows securely through the backend.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ and `npm`
- **Python** 3.9+

### 2. Backend Setup

```bash
cd ~/Desktop/TrustLens-AI/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Verify backend health:
```bash
curl http://127.0.0.1:8000/api/health
```

### 3. Frontend Setup

In a new terminal window:

```bash
cd ~/Desktop/TrustLens-AI/frontend
npm install
npm run dev
```

The app will be available at:
```text
http://localhost:5173
```

---

## 🧪 Testing

Run the automated backend test suite (validates 17 core integration scenarios, including empty inputs, normal messages, scams, clickbait, URL validation, and oversized images):

```bash
cd ~/Desktop/TrustLens-AI/backend
source venv/bin/activate
python3 test_all_endpoints.py
```

To test building the production frontend bundle:

```bash
cd ~/Desktop/TrustLens-AI/frontend
npm run build
```

---

## 🛡️ Privacy & Security Commitments

1. **Zero Retention by Default:** Pasted message contents and emails are analyzed in memory and never written to a server database.
2. **Screenshots Never Stored:** Uploaded image files are processed strictly in RAM for OCR and dropped immediately upon completion.
3. **No Credential Harvesting:** URLs are evaluated structurally and syntactically; TrustLens does not crawl or authenticate against dangerous remote hosts.
4. **Rate Limiting:** Sliding-window rate limiters prevent API abuse and automated flooding.

---

## ⚠️ Important Limitations

- **AI is Probabilistic:** Machine learning models may produce false positives or false negatives.
- **Scores Are Not Legal Proof:** A high risk score flags suspicious patterns; it does not constitute court-admissible evidence of fraud. Conversely, a low score does not guarantee zero risk.
- **Independent Verification:** Always confirm critical banking requests, courier deliveries, or health claims via official, published channels.
