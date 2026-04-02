# IELTS Nexus — Backend API Specification (Express.js)

This document is a **complete, standalone specification** for the IELTS Nexus backend. A developer should be able to build the entire backend from this document alone, without access to the frontend code.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Architecture Overview](#2-architecture-overview)
3. [Middleware](#3-middleware)
4. [Authentication APIs](#4-authentication-apis)
5. [Profile APIs](#5-profile-apis)
6. [Topic APIs](#6-topic-apis)
7. [Writing APIs](#7-writing-apis)
8. [Speaking APIs](#8-speaking-apis)
9. [Exam Simulation APIs](#9-exam-simulation-apis)
10. [Grammar Practice APIs](#10-grammar-practice-apis)
11. [AI Feedback APIs](#11-ai-feedback-apis)
12. [Human Review APIs](#12-human-review-apis)
13. [Community APIs](#13-community-apis)
14. [Profile Stats & Weakness APIs](#14-profile-stats--weakness-apis)
15. [Subscription & Credit APIs](#15-subscription--credit-apis)
16. [Streak & Badge APIs](#16-streak--badge-apis)
17. [Error Handling](#17-error-handling)
18. [Environment Variables](#18-environment-variables)
19. [Project Structure](#19-project-structure)

---

## 1. Project Setup

```bash
mkdir ielts-nexus-backend && cd ielts-nexus-backend
npm init -y
npm install express cors helmet morgan dotenv
npm install @supabase/supabase-js
npm install groq-sdk
npm install stripe
npm install multer  # for audio file uploads
npm install jsonwebtoken
npm install express-rate-limit
npm install -D typescript @types/express @types/node @types/cors @types/multer ts-node nodemon
```

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

**`package.json` scripts:**
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

## 2. Architecture Overview

```
src/
├── index.ts              # App entry, Express setup
├── config/
│   ├── supabase.ts       # Supabase client init
│   ├── groq.ts           # Groq client init
│   └── stripe.ts         # Stripe client init
├── middleware/
│   ├── auth.ts           # JWT verification
│   ├── rateLimit.ts      # Rate limiting
│   ├── tierCheck.ts      # Free/Premium tier enforcement
│   └── errorHandler.ts   # Global error handler
├── routes/
│   ├── auth.ts
│   ├── profile.ts
│   ├── topics.ts
│   ├── writing.ts
│   ├── speaking.ts
│   ├── exam.ts
│   ├── grammar.ts
│   ├── ai.ts
│   ├── reviews.ts
│   ├── community.ts
│   ├── subscriptions.ts
│   └── streaks.ts
├── services/
│   ├── aiService.ts      # Groq wrapper functions
│   ├── scoringService.ts # Band score calculation
│   ├── streakService.ts  # Streak logic
│   └── badgeService.ts   # Badge unlock logic
├── types/
│   └── index.ts          # TypeScript interfaces
└── utils/
    ├── validators.ts     # Input validation
    └── helpers.ts        # Utility functions
```

---

## 3. Middleware

### 3.1 Auth Middleware (`middleware/auth.ts`)

Verifies the Supabase JWT from the `Authorization: Bearer <token>` header.

```typescript
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  userId?: string;
  userTier?: 'free' | 'premium';
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing auth token' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.userId = user.id;

  // Fetch tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();
  
  req.userTier = profile?.tier || 'free';
  next();
}
```

### 3.2 Tier Check Middleware (`middleware/tierCheck.ts`)

Enforces feature limits per tier.

```typescript
export function requirePremium(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userTier !== 'premium') {
    return res.status(403).json({ error: 'Premium subscription required' });
  }
  next();
}
```

### 3.3 Rate Limiting (`middleware/rateLimit.ts`)

```typescript
import rateLimit from 'express-rate-limit';

// General API limit
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

// AI endpoint limit (more restrictive)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 AI requests per minute
});

// Free tier daily test limit
export const freeTestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1, // 1 generated test per day for free users
  keyGenerator: (req: AuthRequest) => `free_test_${req.userId}`,
  skip: (req: AuthRequest) => req.userTier === 'premium',
});
```

---

## 4. Authentication APIs

Authentication is handled by Supabase Auth. The backend validates tokens but does NOT handle signup/login directly (the frontend calls Supabase Auth SDK directly).

### `POST /api/auth/complete-profile`
Called after Supabase signup to create the user profile with onboarding data.

**Request Body:**
```json
{
  "name": "Alex Johnson",
  "goal_score": 7.5,
  "exam_reason": "university",
  "current_level": "intermediate",
  "target_date": "2026-07-15",
  "weaknesses": ["grammar", "speaking_fluency", "pronunciation"]
}
```

**Response `201`:**
```json
{
  "profile": {
    "id": "uuid",
    "name": "Alex Johnson",
    "email": "alex@email.com",
    "goal_score": 7.5,
    "tier": "free",
    "created_at": "2026-04-02T10:00:00Z"
  }
}
```

**Logic:**
1. Get `userId` from auth middleware
2. Insert into `profiles` table
3. Insert each weakness into `signup_weaknesses`
4. Create initial `user_weaknesses` records from self-reported weaknesses
5. Initialize `study_streaks` record
6. Initialize `credits` record (balance = 0)

---

## 5. Profile APIs

### `GET /api/profile`
Returns the authenticated user's profile.

**Response `200`:**
```json
{
  "profile": {
    "id": "uuid",
    "name": "Alex Johnson",
    "email": "alex@email.com",
    "avatar_url": null,
    "goal_score": 7.5,
    "exam_reason": "university",
    "current_level": "intermediate",
    "target_date": "2026-07-15",
    "tier": "premium"
  },
  "stats": {
    "tests_completed": 47,
    "current_band": 6.5,
    "study_streak": 12,
    "hours_practiced": 38
  },
  "credits_balance": 5
}
```

**Logic:**
1. Fetch profile from `profiles`
2. Count `tests_completed` = count of `writing_submissions` + `speaking_submissions` + `exam_simulations` + `grammar_sessions`
3. Get `current_band` = latest entry in `score_history` where module = 'overall'
4. Get `study_streak` from `study_streaks`
5. Estimate `hours_practiced` from `daily_activity` sum of `duration_minutes`
6. Get `credits_balance` from `credits`

### `PATCH /api/profile`
Updates profile fields (name, avatar_url, goal_score, target_date).

**Request Body (partial):**
```json
{
  "name": "Alex J.",
  "goal_score": 8.0
}
```

### `POST /api/profile/avatar`
Upload a profile picture (multipart/form-data).

---

## 6. Topic APIs

### `GET /api/topics`
Returns the list of available topics.

**Query Parameters:**
- `search` (optional): Filter by name
- `frequency` (optional): Filter by High | Medium | Low

**Response `200`:**
```json
{
  "topics": [
    { "id": "environment", "name": "Environment", "emoji": "🌍", "frequency": "High" },
    { "id": "education", "name": "Education", "emoji": "🎓", "frequency": "High" }
  ]
}
```

### `GET /api/topics/:topicId/prompt`
Generates an AI-powered writing/speaking prompt for a given topic.

**Query Parameters:**
- `type`: `writing_task1` | `writing_task2` | `speaking`

**Response `200`:**
```json
{
  "prompt": {
    "type": "writing_task2",
    "topic_id": "environment",
    "text": "Some people believe that...",
    "chart_data": null,
    "time_limit_minutes": 40,
    "min_words": 250
  }
}
```

**Logic:** Calls Groq to generate a prompt based on topic + type (see AI Integration doc).

---

## 7. Writing APIs

### `POST /api/writing/submit`
Submits a writing attempt.

**Request Body:**
```json
{
  "topic_id": "environment",
  "task1_prompt": "The chart below shows...",
  "task1_text": "The bar chart illustrates...",
  "task1_word_count": 172,
  "task2_prompt": "Some people believe that...",
  "task2_text": "Climate change is one of...",
  "task2_word_count": 287,
  "time_spent_seconds": 3420
}
```

**Response `201`:**
```json
{
  "submission_id": "uuid",
  "status": "submitted"
}
```

### `POST /api/writing/:submissionId/review/ai`
Triggers AI review of a writing submission.

**Response `200`:**
```json
{
  "feedback": {
    "overall_score": 6.5,
    "task_achievement": 6.0,
    "coherence_cohesion": 7.0,
    "lexical_resource": 7.0,
    "grammatical_range": 6.0,
    "corrections": [
      {
        "position": { "paragraph": 1, "word_start": 42, "word_end": 50 },
        "original": "believes",
        "correction": "believe",
        "type": "grammar",
        "explanation": "Subject-verb agreement: 'people' is plural, use 'believe'"
      }
    ],
    "insights": [
      {
        "category": "cohesion",
        "title": "Cohesion Issue",
        "detail": "Consider adding a linking phrase between paragraphs",
        "severity": "warning"
      }
    ],
    "suggestions": [
      { "text": "Use varied transition words instead of repeating 'moreover'", "priority": "high" }
    ],
    "vocabulary_highlights": [
      { "word": "significantly", "type": "advanced" },
      { "word": "implement", "type": "advanced" },
      { "word": "coordinated", "type": "advanced" }
    ]
  }
}
```

**Logic:** See [AI Integration doc](./04-ai-integration.md) for GPT-4 prompt details.

### `POST /api/writing/:submissionId/review/human`
Submits writing for human review. Deducts 1 credit.

**Response `201`:**
```json
{
  "review_id": "uuid",
  "status": "pending",
  "credits_remaining": 4,
  "estimated_completion": "24-48 hours"
}
```

### `GET /api/writing/:submissionId`
Returns the submission with all feedback.

### `GET /api/writing/history`
Returns paginated list of user's writing submissions.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional): submitted | ai_reviewed | human_reviewed

---

## 8. Speaking APIs

### `POST /api/speaking/start`
Creates a speaking session.

**Request Body:**
```json
{
  "topic_id": "environment"
}
```

**Response `201`:**
```json
{
  "submission_id": "uuid",
  "questions": [
    "Let's talk about where you live. Do you live in a house or an apartment?",
    "What do you like most about your neighborhood?",
    ...
  ]
}
```

### `POST /api/speaking/:submissionId/response`
Uploads an audio recording for a specific question. Uses `multipart/form-data`.

**Form Data:**
- `audio` (file): WebM/WAV audio file
- `question_index` (int): 0–9
- `question_text` (string): The question text

**Response `201`:**
```json
{
  "response_id": "uuid",
  "audio_url": "https://supabase-storage/...",
  "duration_seconds": 24.5
}
```

**Logic:**
1. Upload audio to Supabase Storage (`speaking-recordings` bucket)
2. Create `speaking_responses` record

### `POST /api/speaking/:submissionId/review/ai`
Triggers AI review of all speaking responses.

**Response `200`:**
```json
{
  "feedback": {
    "overall_score": 6.5,
    "fluency_coherence": 7.0,
    "pronunciation": 6.5,
    "lexical_resource": 7.5,
    "grammatical_range": 6.5,
    "transcripts": [
      {
        "question_index": 0,
        "transcript": "I currently live in an apartment...",
        "duration_seconds": 22.3
      }
    ],
    "insights": [
      {
        "category": "strength",
        "title": "Transitional phrases",
        "detail": "Excellent use of 'on the other hand' and 'in addition to that'"
      },
      {
        "category": "warning",
        "title": "Filler words",
        "detail": "You said 'um' or 'uh' 8 times. Try pausing silently instead"
      },
      {
        "category": "improvement",
        "title": "Pronunciation",
        "detail": "Practice the 'th' sound in words like 'think', 'through', 'although'"
      }
    ],
    "filler_count": 8,
    "average_response_seconds": 23.5
  }
}
```

**Logic:**
1. For each `speaking_responses.audio_url`, call Groq Whisper for transcription
2. Concatenate all transcripts
3. Call GPT-4 for speaking analysis (see AI Integration doc)
4. Store in `ai_feedback`

### `POST /api/speaking/:submissionId/review/human`
Submit for human review. Deducts 1 credit.

### `GET /api/speaking/:submissionId`
Returns submission with all responses and feedback.

### `GET /api/speaking/history`
Paginated history of speaking submissions.

---

## 9. Exam Simulation APIs

### `POST /api/exam/start`
Creates a new full exam simulation.

**Response `201`:**
```json
{
  "exam_id": "uuid",
  "phases": ["listening", "reading", "writing", "speaking"],
  "listening": {
    "passage_text": "You will hear a conversation...",
    "audio_url": "https://...",
    "questions": [
      {
        "number": 1,
        "text": "What is the student's main reason for visiting?",
        "options": ["To register for courses", "To collect documents", "To request information"]
      }
    ]
  }
}
```

### `POST /api/exam/:examId/listening/submit`
Submit listening answers.

**Request Body:**
```json
{
  "answers": [
    { "question_number": 1, "selected_answer": "A" },
    { "question_number": 2, "selected_answer": "C" }
  ]
}
```

### `GET /api/exam/:examId/reading`
Fetch the reading passage and questions.

### `POST /api/exam/:examId/reading/submit`
Submit reading answers.

### `POST /api/exam/:examId/writing/submit`
Submit writing portion (same body as `/api/writing/submit`). Links to exam.

### `POST /api/exam/:examId/speaking/response`
Upload speaking recordings (same as `/api/speaking/:id/response`). Links to exam.

### `POST /api/exam/:examId/complete`
Marks exam as completed, triggers AI review of all sections.

**Response `200`:**
```json
{
  "exam_id": "uuid",
  "status": "completed",
  "results": {
    "listening": 6.0,
    "reading": 6.5,
    "writing": 6.0,
    "speaking": 7.0,
    "overall": 6.5
  }
}
```

### `POST /api/exam/:examId/review/human`
Submit full exam for human review. Deducts **4 credits**.

### `GET /api/exam/:examId/results`
Returns full results with all feedback (locked/unlocked by tier).

**Response for free users**: Only overall and per-module scores. Detailed analysis returns `"locked": true`.

**Response for premium users**: Full analysis with radar data, detailed insights, corrections.

### `GET /api/exam/history`
Paginated exam history.

---

## 10. Grammar Practice APIs

### `GET /api/grammar/session`
Creates a new grammar practice session.

**Query Parameters:**
- `category` (optional): e.g., `subject-verb-agreement`. If empty, picks based on user weaknesses.
- `count` (default: 5): Number of questions

**Response `200`:**
```json
{
  "session_id": "uuid",
  "category": "subject-verb-agreement",
  "questions": [
    {
      "id": "uuid",
      "sentence": "The team _____ working hard to meet the deadline.",
      "options": ["is", "are", "was", "were"]
    }
  ]
}
```

> **Note:** `correct_answer_index` and `explanation` are NOT sent to the client in this response.

### `POST /api/grammar/session/:sessionId/answer`
Submit answer for a single question.

**Request Body:**
```json
{
  "question_id": "uuid",
  "selected_answer_index": 0
}
```

**Response `200`:**
```json
{
  "is_correct": true,
  "correct_answer_index": 0,
  "explanation": "Use 'is' because 'team' is a collective noun treated as singular."
}
```

### `POST /api/grammar/session/:sessionId/complete`
Complete the session and record results.

**Response `200`:**
```json
{
  "score": 4,
  "total": 5,
  "percentage": 80.0,
  "passed": true,
  "badges_unlocked": ["grammar_guru"]
}
```

---

## 11. AI Feedback APIs

### `GET /api/feedback/:feedbackId`
Returns a stored AI feedback record.

### `GET /api/feedback/history`
Returns paginated AI feedback for the user.

**Query Parameters:**
- `type`: writing | speaking | exam

---

## 12. Human Review APIs

### `GET /api/reviews`
Returns all human reviews for the user.

**Query Parameters:**
- `status` (optional): pending | in_review | completed

### `GET /api/reviews/:reviewId`
Returns a specific human review.

### Admin Endpoints (internal use, protected by admin API key):

### `GET /api/admin/reviews/pending`
Returns all pending reviews for reviewer dashboard.

### `PATCH /api/admin/reviews/:reviewId`
Update review with scores and feedback.

**Request Body:**
```json
{
  "overall_score": 7.0,
  "task_achievement": 7.0,
  "coherence_cohesion": 7.5,
  "lexical_resource": 7.0,
  "grammatical_range": 6.5,
  "feedback_text": "Good essay structure...",
  "corrections": [...],
  "status": "completed"
}
```

---

## 13. Community APIs

### `GET /api/community/posts`
Returns paginated community feed.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `filter`: `trending` | `band8plus` | `human_verified`
- `sort`: `latest` | `popular`

**Response `200`:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "author": {
        "id": "uuid",
        "name": "Sarah Chen",
        "is_premium": true
      },
      "title": "Writing Task 2: Environmental Policy",
      "topic_id": "environment",
      "band_score": 7.5,
      "essay_preview": "Climate change is one of...",
      "is_human_verified": true,
      "likes_count": 42,
      "comments_count": 12,
      "is_liked": false,
      "is_saved": false,
      "created_at": "2026-04-02T08:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 156 }
}
```

### `GET /api/community/posts/:postId`
Returns full post detail with essay, AI feedback diff, and comments.

**Response `200`:**
```json
{
  "post": {
    "id": "uuid",
    "author": { "id": "uuid", "name": "Alex Johnson", "is_premium": true },
    "title": "Writing Task 2: Environmental Policy",
    "band_score": 7.5,
    "topic": { "id": "environment", "name": "Environment" },
    "prompt_text": "Climate change is one of the most pressing issues...",
    "essay_text": "Climate change is one of the most pressing...",
    "ai_corrections": [
      {
        "original": "believes",
        "correction": "believe",
        "position": { "paragraph": 1 }
      }
    ],
    "is_human_verified": true,
    "likes_count": 1247,
    "is_liked": false,
    "is_saved": false,
    "comments": [
      {
        "id": "uuid",
        "author": { "name": "Sarah Chen", "is_premium": true },
        "content": "This is excellent!...",
        "likes_count": 24,
        "created_at": "2026-04-02T10:00:00Z"
      }
    ]
  }
}
```

### `POST /api/community/posts`
Publish a writing submission to community.

**Request Body:**
```json
{
  "writing_submission_id": "uuid",
  "title": "Writing Task 2: Environmental Policy"
}
```

### `POST /api/community/posts/:postId/like`
Toggle like on a post.

**Response `200`:**
```json
{
  "liked": true,
  "likes_count": 1248
}
```

### `POST /api/community/posts/:postId/save`
Toggle save on a post.

### `POST /api/community/posts/:postId/comments`
Add a comment.

**Request Body:**
```json
{
  "content": "Great essay! One small tip...",
  "parent_id": null
}
```

### `POST /api/community/comments/:commentId/like`
Toggle like on a comment.

### `GET /api/community/saved`
Returns user's saved posts.

---

## 14. Profile Stats & Weakness APIs

### `GET /api/profile/weaknesses`
Returns user's weakness snapshot.

**Response `200`:**
```json
{
  "weaknesses": [
    {
      "id": "uuid",
      "title": "Subject-Verb Agreement",
      "category": "Grammar",
      "severity": "high",
      "source": "ai_detected",
      "practice_count": 3,
      "is_resolved": false
    }
  ],
  "limit_reached": false,
  "max_weaknesses": 20
}
```

For free users: limited to 3 weaknesses visible; remaining return `"locked": true`.

### `POST /api/profile/weaknesses/:weaknessId/practice`
Records a practice attempt against a weakness.

### `GET /api/profile/score-history`
Returns score trend data for analytics.

**Query Parameters:**
- `module`: writing | speaking | reading | listening | overall
- `period`: 7d | 30d | 90d | all

**Response `200`:**
```json
{
  "scores": [
    { "score": 6.0, "date": "2026-03-01" },
    { "score": 6.5, "date": "2026-03-15" },
    { "score": 7.0, "date": "2026-04-01" }
  ],
  "projected_score": 7.5
}
```

### `GET /api/profile/analytics`
Returns the radar chart data (current vs target scores).

**Response `200`:**
```json
{
  "current_scores": {
    "writing": 6.5,
    "speaking": 6.0,
    "reading": 7.0,
    "listening": 6.5
  },
  "target_scores": {
    "writing": 7.5,
    "speaking": 7.5,
    "reading": 8.0,
    "listening": 7.5
  }
}
```

---

## 15. Subscription & Credit APIs

### `POST /api/subscriptions/create-checkout`
Creates a Stripe Checkout session for premium subscription ($29/month).

**Response `200`:**
```json
{
  "checkout_url": "https://checkout.stripe.com/..."
}
```

### `POST /api/subscriptions/webhook`
Stripe webhook handler (no auth required, verified by signature).

**Handled events:**
- `checkout.session.completed` → Activate premium, grant 5 credits
- `invoice.paid` → Renew subscription, grant monthly 5 credits
- `customer.subscription.deleted` → Downgrade to free
- `invoice.payment_failed` → Set status to `past_due`

### `GET /api/subscriptions/status`
Returns current subscription status.

### `POST /api/credits/purchase`
Creates a Stripe Checkout session for buying individual credits.

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response `200`:**
```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "amount": 29.97,
  "credits": 3
}
```

### `GET /api/credits/balance`
Returns current credit balance.

### `GET /api/credits/transactions`
Returns credit transaction history.

---

## 16. Streak & Badge APIs

### `POST /api/streaks/record`
Records daily activity (called automatically by the frontend when any practice is completed).

**Request Body:**
```json
{
  "activity_type": "writing",
  "duration_minutes": 35
}
```

**Response `200`:**
```json
{
  "current_streak": 13,
  "longest_streak": 13,
  "is_new_day": true,
  "badges_unlocked": []
}
```

### `GET /api/streaks`
Returns current streak info.

### `GET /api/badges`
Returns all badges with unlocked status.

**Response `200`:**
```json
{
  "badges": [
    { "id": "grammar_guru", "title": "Grammar Guru", "icon": "📝", "unlocked": true, "unlocked_at": "2026-03-20" },
    { "id": "7_day_streak", "title": "7-Day Streak", "icon": "🔥", "unlocked": true, "unlocked_at": "2026-03-25" },
    { "id": "speaking_star", "title": "Speaking Star", "icon": "🎤", "unlocked": false },
    { "id": "reading_pro", "title": "Reading Pro", "icon": "📚", "unlocked": false },
    { "id": "perfect_score", "title": "Perfect Score", "icon": "🏆", "unlocked": false }
  ]
}
```

---

## 17. Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Human-readable error message",
  "code": "INSUFFICIENT_CREDITS",
  "details": {}
}
```

**Standard error codes:**

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |
| `FORBIDDEN` | 403 | Premium feature, insufficient tier |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Invalid request body |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits for human review |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_ERROR` | 502 | Groq API failure |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 18. Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJ...  # service_role key (NOT anon key)
SUPABASE_ANON_KEY=eyJ...

# Groq
GROQ_API_KEY=gsk-...
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_WHISPER_MODEL=whisper-large-v3

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_CREDIT_PRICE_ID=price_...

# Credits
MONTHLY_CREDIT_GRANT=5
CREDIT_PRICE_CENTS=999
```

---

## 19. Project Structure

```
ielts-nexus-backend/
├── src/
│   ├── index.ts
│   ├── config/
│   │   ├── supabase.ts
│   │   ├── groq.ts
│   │   └── stripe.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rateLimit.ts
│   │   ├── tierCheck.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── profile.ts
│   │   ├── topics.ts
│   │   ├── writing.ts
│   │   ├── speaking.ts
│   │   ├── exam.ts
│   │   ├── grammar.ts
│   │   ├── ai.ts
│   │   ├── reviews.ts
│   │   ├── community.ts
│   │   ├── subscriptions.ts
│   │   └── streaks.ts
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── scoringService.ts
│   │   ├── streakService.ts
│   │   └── badgeService.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── validators.ts
│       └── helpers.ts
├── .env
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

---

## Related Documentation

- [01-project-overview.md](./01-project-overview.md) — What the project is
- [02-database-schema.md](./02-database-schema.md) — Complete database design
- [04-ai-integration.md](./04-ai-integration.md) — Groq service integration details
