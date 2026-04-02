# IELTS Nexus — Project Overview

## What Is IELTS Nexus?

IELTS Nexus is a **mobile-first AI-powered IELTS preparation platform** that helps students practice all four IELTS modules (Listening, Reading, Writing, Speaking) with instant AI feedback and optional human expert verification.

The platform combines adaptive learning, gamification, and a community-driven approach to create a comprehensive IELTS study experience.

---

## Core Value Proposition

| Feature | Free Tier | Premium Tier ($29/mo) |
|---|---|---|
| AI-generated tests | 1/day | Unlimited |
| AI feedback | Basic | Advanced + Knowledge Graph |
| Community access | ✅ | ✅ |
| Human verification credits | ❌ | 5/month |
| Weakness engine | 3 weaknesses | All weaknesses |
| Custom adaptive tests | 3 total | 20 total |
| Priority support | ❌ | ✅ |

**Human Verification** is also available as a standalone purchase at **$9.99 per credit** (1 credit = 1 writing or speaking review by a certified IELTS examiner).

---

## Feature Breakdown

### 1. Authentication & User Profiling
Multi-step signup flow that collects:
- **Step 1**: Name, email, password
- **Step 2**: Target band score (6.0–9.0), reason for taking IELTS (university, job, immigration, professional registration)
- **Step 3**: Self-identified weaknesses (grammar, vocabulary, speaking fluency, pronunciation, writing tasks, reading speed, listening, time management, coherence)
- **Step 4**: Current level (beginner/intermediate/advanced), target exam date

Demo login available: `demo@ielts.com` / `demo123`

### 2. Home Dashboard
- Personalized greeting with user's name
- **Study streak** counter (consecutive days of practice)
- **Full IELTS Simulation** launcher (2h 45m exam)
- **Adaptive practice plan** — AI suggests next weakness to fix (e.g., "Fix Subject-Verb Agreement")
- **Analytics radar chart** — Current scores vs target scores for all 4 modules
- **Projected score sparkline** — Score trend over time
- **Gamification badges** — Grammar Guru, 7-Day Streak, Speaking Star, Reading Pro, Perfect Score

### 3. Topic Selection
Grid of 12 IELTS topics with exam frequency labels:
- Environment, Education, Technology, Health, Work, Travel, Family, Media, Sports, Food, Globalization, Housing
- Each topic tagged as High/Medium/Low frequency
- Searchable via text input

### 4. Writing Module
Two-task writing interface mimicking real IELTS:
- **Task 1 (Report)**: Describe a chart/graph (bar chart provided). Minimum 150 words. 20 min recommended.
- **Task 2 (Essay)**: Discuss a topic. Minimum 250 words. 40 min recommended.
- Countdown timer (60 min total)
- Real-time word count with color-coded status
- Submit triggers **Review Choice Modal** (AI vs Human review)

**AI Feedback** includes:
- Inline grammar error highlighting (red underline with correction tooltips)
- Cohesion issue warnings (yellow blocks)
- Advanced vocabulary highlights (green)
- AI estimated band score
- Option to verify with human expert ($9.99)

### 5. Speaking Simulation
- 10-question interview format (Part 1: Introduction & Interview)
- AI avatar orb with animated recording indicators
- Record/Stop recording per question
- Progress tracking (answered/total)
- Submit triggers Review Choice Modal

**AI Analysis** includes:
- Audio waveform visualization (normal speech, hesitations, fluency peaks)
- Performance metrics with band scores for:
  - Fluency & Coherence
  - Pronunciation
  - Lexical Resource
  - Grammatical Range
- Key insights: strengths, warnings, improvement suggestions

### 6. Full Exam Simulation
Complete 4-phase IELTS exam with strict timing:
- **Phase 1 — Listening** (30 min): Audio player (disabled controls, mimicking real test), 10 MCQ questions
- **Phase 2 — Reading** (30 min): Full passage + 10 True/False/Not Given questions
- **Phase 3 — Writing** (60 min): Task 1 (chart description) + Task 2 (essay)
- **Phase 4 — Speaking** (10 min): 10 recorded questions
- Universal HUD (section title, countdown timer, question counter)
- Skip section / End exam confirmation modals
- End exam triggers Review Choice Modal (4 credits for full human review)

### 7. Grammar Practice
- MCQ format with fill-in-the-blank sentences
- 5 questions per session (e.g., Subject-Verb Agreement)
- Immediate feedback with explanations per question
- Results screen with percentage score and pass/fail message

### 8. Community
- Feed of shared essays with author info, band scores, likes, comments
- Filter by: Trending, Band 8+ Only, Human Verified
- Essay preview with grammar error highlights
- "Try This Test" button to attempt the same topic

**Post Detail View**:
- Full essay display with AI correction diff (strikethrough errors + green corrections)
- Like, Save, Share, "Try This Test" actions
- Comment section with Premium member badges
- Add comment input

### 9. Profile & Settings
- User avatar, name, target band score
- **Tab: My Stats**
  - Free/Premium plan toggle (preview mode)
  - Weakness Snapshot carousel (scrollable weakness cards with "Fix This Now" buttons)
  - Plan comparison with pricing ($29/month premium)
  - Human Verification credits display and pricing (1 credit per writing/speaking review, $9.99 each)
  - Stats grid: Tests Completed, Current Band, Study Streak, Hours Practiced
- **Tab: Saved Posts**
  - Pinterest-style masonry grid of bookmarked community posts

### 10. Simulation Results
- Overall band score (large display)
- Skill breakdown grid (Listening, Reading, Writing, Speaking)
- **Free users**: Locked detailed analysis behind blur overlay with "Upgrade to Premium" CTA
- **Premium users**: 
  - Radar chart (skill balance visualization)
  - Expandable detailed analysis per module (writing analysis, speaking fluency, reading speed)
  - "Save to Knowledge Graph" button

---

## High-Level Architecture

> [!IMPORTANT]
> **All AI processing happens on the backend only.** The frontend NEVER calls Groq directly. The React app sends user submissions (text, audio files) to the Express.js backend, which then calls Groq services server-side and returns the results. This protects API keys and allows rate limiting.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│              Mobile-first SPA, deployed on Vercel               │
│         Sends text + audio blobs to backend via REST            │
└─────────────────────┬───────────────────────────────────────────┘
                      │ REST API calls (JSON + multipart/form-data)
┌─────────────────────▼───────────────────────────────────────────┐
│                     BACKEND (Express.js + Node.js)              │
│   Auth, Business Logic, AI Gateway (all Groq calls here)     │
└──────┬──────────────────────────┬───────────────────────────────┘
       │                          │
┌──────▼────────┐      ┌──────────▼──────────┐
│  PostgreSQL   │      │   Groq APIs       │
│  (Supabase)   │      │  GPT-4, Whisper,    │
│  + Storage    │      │  TTS                │
└───────────────┘      └─────────────────────┘
```

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS (via utility classes), Framer Motion, Recharts, Radix UI, Lucide Icons |
| Backend | Express.js (Node.js) — **to be built** |
| Database | PostgreSQL on Supabase — **to be built** |
| AI Services | Groq GPT-4, Whisper, TTS — **called from backend only, to be built** |
| Deployment | Vercel (frontend), Supabase (DB), Railway/Render (backend) |
| Payments | Stripe (for subscriptions and credit purchases) — **to be built** |

---

## Known Frontend Gaps (Must Be Built)

The current frontend is a **UI prototype only**. The following features are visually present but have no real implementation behind them:

| Gap | Current State | What Needs to Be Built |
|---|---|---|
| **Audio Recording** | `setIsRecording(true)` toggles UI only. No `MediaRecorder` or `getUserMedia` call exists. | Add browser `MediaRecorder` API to capture audio as WebM blobs, then upload to backend via `POST /api/speaking/:id/response` as `multipart/form-data`. |
| **Audio Playback (Listening)** | Static progress bar, play button is disabled. No actual audio file. | Backend generates listening audio (TTS or pre-recorded), frontend downloads and plays via `<audio>` element. |
| **Timer** | `useState(3600)` is set but the `useEffect` countdown only exists in `ExamSimulation.tsx`, not in `WritingModule.tsx`. | Add real countdown with auto-submit on timeout. |
| **API Calls** | Zero `fetch`/`axios` calls in the entire frontend. All data is hardcoded. | Connect every component to the backend REST API. |
| **Authentication** | `AuthScreen` sets local state only. No Supabase Auth SDK calls. | Integrate `@supabase/supabase-js` for real signup/login/JWT. |
| **Community** | All posts are hardcoded arrays. | Fetch from `/api/community/posts`, implement real like/comment/save. |
| **Stripe Payments** | "Upgrade" and "Top Up" buttons are non-functional. | Integrate Stripe Checkout via backend. |

---

## Related Documentation

- [02-database-schema.md](./02-database-schema.md) — Complete PostgreSQL schema
- [03-backend-api.md](./03-backend-api.md) — Express.js API specification
- [04-ai-integration.md](./04-ai-integration.md) — Groq service integration details
