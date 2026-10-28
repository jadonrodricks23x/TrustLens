# TrustLens AI

> **Look closer. Trust smarter.**

TrustLens AI is an explainable, Google Gemini-powered digital safety platform that helps users analyze potentially suspicious scam messages, viral news claims, deceptive URLs, and screenshots.

Instead of providing opaque, binary verdicts like "safe" or "fake", TrustLens operates on a foundational principle:
> **"Don't just give a verdict. Explain the signals."**

Every assessment deconstructs content into clear threat signals, delivers a calibrated **TrustLens Score (0–100)**, details why the signals matter, and outlines actionable safety steps without claiming absolute certainty.

---

## 🌟 Core Features

1. **🚨 Scam Detector**
   - Analyzes SMS, WhatsApp messages, phishing emails, job offers, and payment requests.
   - Detects local urgency tactics, OTP/password solicitation, impersonation, unrealistic rewards, and coercive threats.
2. **📰 News & Claim Verifier**
   - Analyzes viral headlines, unverified health claims, and social media claims.
   - Identifies sensationalist wording, absolute claims, missing context, clickbait framing, and unverified attribution.
3. **🔗 Link & URL Safety Checker**
   - Deterministic structural checks before AI: unencrypted HTTP, direct IP hostnames, redirection shorteners, unusual ports, nested subdomains, and credential-harvesting paths.
   - Includes a security caution prompt before visiting external destinations.
4. **📸 Screenshot Analyzer (Upload & Camera Options)**
   - **Option 1: Upload Image** — Select an existing PNG, JPG, JPEG, or WEBP screenshot from your device (up to 5 MB).
   - **Option 2: Take Picture** — Snap a photo directly through your mobile or computer camera using browser MediaStream APIs with preferred rear-camera support (`facingMode: "environment"`).
   - Includes preview, retake, remove/replace options, in-memory OCR text extraction, and Gemini multimodal image analysis.
5. **🧠 Zero-Token Educational Hub & Spot the Scam Quiz**
   - 7 concise threat breakdown guides (Phishing, Social Engineering, Clickbait, Fake Offers, Impersonation, Misinformation vs. Disinformation, Suspicious URLs).
   - **"Can You Spot the Scam?"** interactive 5-question test running 100% locally from static data (0 API tokens consumed).
6. **💾 Private Local History**
   - Browser LocalStorage-based history saving compact assessment summaries without persisting raw sensitive messages or screenshot images (ready for optional Supabase sync).
7. **🌗 Modern Cybersecurity SaaS Aesthetic**
   - Dark mode by default with light mode toggle, glassmorphism cards, responsive navigation drawer, and fluid mobile-to-desktop adaptation.

---

## 🔬 Calibrated TrustLens Score System

| Score Range | Risk Level | Description |
| :--- | :--- | :--- |
| **0 – 30** | 🟢 **Low Concern** | Standard expected communication patterns with no obvious red flags. |
| **31 – 60** | 🟡 **Needs Verification** | Atypical wording, missing context, unverified attribution, or minor anomalies. |
| **61 – 80** | 🟠 **Suspicious** | Multiple warning signals, deceptive patterns, masked links, or pressure. |
| **81 – 100** | 🔴 **High Risk Indicators** | Direct credential/OTP demands, advance fees, wire transfer coercion, or severe threats. |

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Python 3.9+, FastAPI, Uvicorn, Pillow, Python-Multipart, Httpx
- **AI Intelligence:** Google Gemini API via official `google-genai` Python SDK
- **Database/Persistence:** LocalStorage (browser fallback) / Supabase (optional)

---

## 🏗️ Architecture & Data Pipeline

```text
User Input (Text / URL / Image)
              ↓
    Input & File Validation
              ↓
  Deterministic Local Heuristics (Urgency, OTP, IP Host, Shorteners, Punctuation)
              ↓
  In-Memory OCR Extraction (for screenshots)
              ↓
  Google Gemini API (Single Token-Optimized Structured JSON Request)
              ↓
  Structured Response Parsing & Risk Band Normalization
              ↓
  TrustLens Assessment Card (Score, Signals, Why It Matters, Recommendations)
```

- **Token Optimization:** Local heuristics run first. Only essential text snippets and detected pattern tags are sent to Gemini in **at most one call** per analysis.
- **Mock Development Mode:** If `GEMINI_API_KEY` is not configured, TrustLens runs seamlessly in local development mode using its calibrated deterministic pattern engine (`is_mock: true`).

---

## ⚙️ Environment Variables

Copy `.env.example` to `backend/.env`:

```bash
cp .env.example backend/.env
```

Configuration variables:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
SUPABASE_URL=
SUPABASE_ANON_KEY=
FRONTEND_URL=http://localhost:5173
```

> 🔒 **Security Notice:** The frontend NEVER directly calls Gemini or consumes API keys. All AI requests flow securely through the FastAPI backend. API keys are never logged, stored in Git, or returned in client responses.

---

## 🚀 Exact Local Setup

### 1. Prerequisites
- **Node.js** v18+ and `npm`
- **Python** 3.9+ and `venv`

### 2. Backend Setup

Open a Terminal:

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
Response:
```json
{
  "status": "ok",
  "service": "TrustLens AI",
  "version": "1.0.0",
  "ai_engine": "google-gemini"
}
```

### 3. Frontend Setup

Open another Terminal:

```bash
cd ~/Desktop/TrustLens-AI/frontend
npm install
npm run dev
```

Open your browser to:
```text
http://localhost:5173
```

---

## 🧪 Testing Instructions

Run the full automated backend test suite (validating all 18 test cases including empty inputs, scams, sensational headlines, URLs, image uploads, camera snapshots, MIME checks, and size limits):

```bash
cd ~/Desktop/TrustLens-AI/backend
source venv/bin/activate
python3 test_all_endpoints.py
```

Test production frontend build:

```bash
cd ~/Desktop/TrustLens-AI/frontend
npm run build
```

---

## 🔒 Security & Privacy Notes

1. **Zero Raw Content Logging:** Pasted messages, emails, and claims are analyzed in memory and never logged to persistent disk or console.
2. **Screenshots Never Stored:** Uploaded and camera-captured images are held in memory strictly for OCR and multimodal evaluation, then immediately freed from RAM.
3. **Safe URL Evaluation:** URLs are evaluated structurally; TrustLens never crawls dangerous remote hosts or executes downloaded payloads.
4. **Camera Track Release:** All active `MediaStream` camera tracks are explicitly stopped upon capture, cancelation, modal closing, or unmount.

---

## 📦 Deployment Guidance

### Backend Deployment (Render / Railway / Fly.io / Cloud Run)
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set environment variables: `GEMINI_API_KEY`, `GEMINI_MODEL`, `FRONTEND_URL`.

### Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` to your production backend URL.

---

## 🐙 GitHub Instructions

Ensure `.env` and `venv` are not committed:

```bash
cd ~/Desktop/TrustLens-AI
git status
git add .
git commit -m "feat: complete Gemini API integration and full TrustLens feature suite"
git push origin main
```
