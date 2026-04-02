# IELTS Nexus — Step-by-Step Implementation Guide

This guide walks you through building the entire IELTS Nexus backend from scratch, phase by phase. Each phase is independent — your frontend stays untouched and working until you're ready to connect it.

**Rule**: Don't move to the next phase until the ✅ checkpoint passes.

---

## Phases Overview

| Phase | What You Build | Time Estimate |
|---|---|---|
| 1 | Supabase project + database tables | 1–2 hours |
| 2 | Express.js backend scaffold | 1 hour |
| 3 | Auth + Profile APIs | 2–3 hours |
| 4 | Topics + Writing APIs | 2–3 hours |
| 5 | Groq integration (writing feedback) | 2–3 hours |
| 6 | Speaking APIs + Whisper | 3–4 hours |
| 7 | Grammar + Exam APIs | 2–3 hours |
| 8 | Community APIs | 2–3 hours |
| 9 | Streaks, Badges, Analytics APIs | 2 hours |
| 10 | Stripe payments | 2–3 hours |
| 11 | Deploy backend | 1–2 hours |
| 12 | Connect frontend to backend | 3–5 hours |

**Total**: ~25–35 hours of work spread across days/weeks.

---

## Phase 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (GitHub login works)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `ielts-nexus`
   - **Database Password**: Generate a strong password and **save it somewhere safe**
   - **Region**: Choose the closest one to your users (e.g., `South Asia (Mumbai)` for India)
4. Click **"Create new project"** — wait 2 minutes for it to spin up

### 1.2 Get Your API Keys

1. In your Supabase project dashboard, go to **Settings → API**
2. You'll see two keys. Copy and save both:
   - **`anon` public key** — used by the frontend (safe to expose)
   - **`service_role` secret key** — used by the backend only (**never expose this**)
3. Also copy the **Project URL** (e.g., `https://abcdefgh.supabase.co`)

Save these in a notepad — you'll need them in Phase 2.

### 1.3 Create Database Tables

1. In the Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open `02-database-schema.md` and copy-paste the SQL for **each table**, one by one. Run them in this exact order (because of foreign key dependencies):

**Run order:**
```
1. profiles
2. subscriptions
3. credits
4. credit_transactions
5. topics (including the INSERT seed data)
6. exam_simulations
7. writing_submissions
8. speaking_submissions
9. speaking_responses
10. exam_listening_answers
11. exam_reading_answers
12. grammar_questions
13. grammar_sessions
14. grammar_answers
15. ai_feedback
16. human_reviews
17. community_posts
18. comments
19. post_likes
20. comment_likes
21. saved_posts
22. user_weaknesses
23. signup_weaknesses
24. badges (including seed INSERT)
25. user_badges
26. study_streaks
27. daily_activity
28. score_history
```

> **Tip**: You can paste multiple CREATE TABLE statements in one query. Just make sure tables that reference other tables come AFTER the referenced table.

4. After running all CREATE statements, run all the `CREATE INDEX` statements.
5. Then run all the RLS policies (the `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and `CREATE POLICY` statements).

### 1.4 Create Storage Buckets

1. Go to **Storage** (left sidebar)
2. Click **"New bucket"** — create these 5 buckets:

| Bucket Name | Public? |
|---|---|
| `speaking-recordings` | ❌ No (private) |
| `speaking-question-audio` | ✅ Yes (public) |
| `listening-audio` | ✅ Yes (public) |
| `avatars` | ✅ Yes (public) |
| `writing-charts` | ✅ Yes (public) |

3. For the `speaking-recordings` bucket, add the RLS policies from `02-database-schema.md` (the "Voice Storage Details" section). Go to **Storage → speaking-recordings → Policies** and add them.

### 1.5 Enable Auth Providers

1. Go to **Authentication → Providers**
2. Make sure **Email** provider is enabled (it is by default)
3. Under **Email Auth Settings**, Toggle OFF "Confirm email" for development (you can enable it later for production)

### ✅ Phase 1 Checkpoint

**Verify**: Go to **Table Editor** (left sidebar). You should see all 28 tables listed. Click on `topics` — you should see the 12 seed rows (Environment, Education, etc.). Click on `badges` — you should see 5 seed rows.

---

## Phase 2: Backend Project Setup

### 2.1 Create the Project

Open a terminal in a **separate folder** from your frontend (NOT inside the Ieltsnexus folder):

```bash
mkdir ielts-nexus-backend
cd ielts-nexus-backend
npm init -y
```

### 2.2 Install Dependencies

```bash
# Core
npm install express cors helmet morgan dotenv

# Supabase
npm install @supabase/supabase-js

# File uploads (for audio)
npm install multer

# TypeScript
npm install -D typescript @types/express @types/node @types/cors @types/multer ts-node nodemon
```

> We'll install `groq` and `stripe` later when we need them.

### 2.3 Create Project Structure

```bash
mkdir -p src/{config,middleware,routes,services,types,utils}
```

### 2.4 Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### 2.5 Create `.env`

```bash
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase (paste your values from Phase 1.2)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=eyJ...your-service-role-key...
SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

### 2.6 Create `.gitignore`

```
node_modules/
dist/
.env
*.log
```

### 2.7 Create `src/config/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // service_role key for backend
);
```

### 2.8 Create `src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
```

### 2.9 Update `package.json` scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 2.10 Start the Server

```bash
npm run dev
```

### ✅ Phase 2 Checkpoint

Open your browser or use curl:
```bash
curl http://localhost:3001/api/health
```
You should see:
```json
{"status":"ok","timestamp":"2026-04-02T..."}
```

---

## Phase 3: Auth + Profile APIs

### 3.1 Create Auth Middleware

Create `src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthRequest extends Request {
  userId?: string;
  userTier?: 'free' | 'premium';
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Missing auth token' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.userId = user.id;

  // Fetch user tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  req.userTier = (profile?.tier as 'free' | 'premium') || 'free';
  next();
}
```

### 3.2 Create Error Handler

Create `src/middleware/errorHandler.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
}
```

### 3.3 Create Auth Routes

Create `src/routes/auth.ts`:

```typescript
import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/complete-profile
// Called after Supabase signup to save onboarding data
router.post('/complete-profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, goal_score, exam_reason, current_level, target_date, weaknesses } = req.body;
    const userId = req.userId!;

    // 1. Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name,
        email: (await supabase.auth.getUser(req.headers.authorization!.replace('Bearer ', ''))).data.user?.email,
        goal_score: goal_score || 7.0,
        exam_reason: exam_reason || 'university',
        current_level: current_level || 'intermediate',
        target_date,
      })
      .select()
      .single();

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // 2. Save self-reported weaknesses
    if (weaknesses && weaknesses.length > 0) {
      const weaknessRows = weaknesses.map((w: string) => ({
        user_id: userId,
        weakness_label: w,
      }));
      await supabase.from('signup_weaknesses').insert(weaknessRows);

      // Also create user_weaknesses records
      const userWeaknessRows = weaknesses.map((w: string) => ({
        user_id: userId,
        title: w.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        category: categorizeWeakness(w),
        severity: 'medium',
        source: 'self_reported',
      }));
      await supabase.from('user_weaknesses').insert(userWeaknessRows);
    }

    // 3. Initialize streak tracker
    await supabase.from('study_streaks').insert({ user_id: userId });

    // 4. Initialize credits
    await supabase.from('credits').insert({ user_id: userId, balance: 0 });

    res.status(201).json({ profile });
  } catch (err) {
    console.error('Error completing profile:', err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

function categorizeWeakness(weakness: string): string {
  const categories: Record<string, string> = {
    grammar: 'Grammar',
    vocabulary: 'Writing',
    speaking_fluency: 'Speaking',
    pronunciation: 'Speaking',
    writing_tasks: 'Writing',
    reading_speed: 'Reading',
    listening: 'Listening',
    time_management: 'Reading',
    coherence: 'Writing',
  };
  return categories[weakness] || 'General';
}

export default router;
```

### 3.4 Create Profile Routes

Create `src/routes/profile.ts`:

```typescript
import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/profile
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    // Fetch profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Fetch stats
    const [writingCount, speakingCount, examCount, grammarCount] = await Promise.all([
      supabase.from('writing_submissions').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('speaking_submissions').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('exam_simulations').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('grammar_sessions').select('id', { count: 'exact' }).eq('user_id', userId),
    ]);

    const testsCompleted = (writingCount.count || 0) + (speakingCount.count || 0)
      + (examCount.count || 0) + (grammarCount.count || 0);

    // Fetch streak
    const { data: streak } = await supabase
      .from('study_streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single();

    // Fetch credits
    const { data: credits } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    res.json({
      profile,
      stats: {
        tests_completed: testsCompleted,
        current_band: 0, // will be updated when score history exists
        study_streak: streak?.current_streak || 0,
        hours_practiced: 0, // will be calculated from daily_activity
      },
      credits_balance: credits?.balance || 0,
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PATCH /api/profile
router.patch('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const allowedFields = ['name', 'avatar_url', 'goal_score', 'target_date'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ profile: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
```

### 3.5 Register Routes in `src/index.ts`

Add these lines to your `src/index.ts`, after the middleware but before `app.listen`:

```typescript
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
```

Also add the error handler at the very end (after routes, before `app.listen`):

```typescript
import { errorHandler } from './middleware/errorHandler';
app.use(errorHandler);
```

### ✅ Phase 3 Checkpoint

**Test with Supabase Dashboard**:
1. Go to **Authentication → Users** in Supabase Dashboard
2. Click **"Add user"** → Create a test user: `test@ielts.com` / `test123456`
3. Get a JWT token for testing. Go to **SQL Editor** and run:
   ```sql
   SELECT id FROM auth.users WHERE email = 'test@ielts.com';
   ```
   Copy the user ID.

4. Use the Supabase API to get a token. In your terminal:
   ```bash
   curl -X POST 'https://YOUR-PROJECT.supabase.co/auth/v1/token?grant_type=password' \
     -H 'apikey: YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"email":"test@ielts.com","password":"test123456"}'
   ```
   Copy the `access_token` from the response.

5. Test the complete-profile endpoint:
   ```bash
   curl -X POST http://localhost:3001/api/auth/complete-profile \
     -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
     -H 'Content-Type: application/json' \
     -d '{
       "name": "Test User",
       "goal_score": 7.5,
       "exam_reason": "university",
       "current_level": "intermediate",
       "weaknesses": ["grammar", "pronunciation"]
     }'
   ```
   You should get back a `201` with the profile data.

6. Test the profile fetch:
   ```bash
   curl http://localhost:3001/api/profile \
     -H 'Authorization: Bearer YOUR_ACCESS_TOKEN'
   ```
   You should see the profile + stats + credits.

7. Check the Supabase **Table Editor** → `profiles` table should have a new row, `user_weaknesses` should have 2 rows, `study_streaks` should have 1 row.

---

## Phase 4: Topics + Writing APIs

### 4.1 Create Topics Route

Create `src/routes/topics.ts`:

```typescript
import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET /api/topics
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('topics').select('*');

    if (req.query.search) {
      query = query.ilike('name', `%${req.query.search}%`);
    }
    if (req.query.frequency) {
      query = query.eq('frequency', req.query.frequency);
    }

    const { data, error } = await query.order('name');
    if (error) return res.status(400).json({ error: error.message });

    res.json({ topics: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

export default router;
```

### 4.2 Create Writing Route

Create `src/routes/writing.ts`:

```typescript
import { Router } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/writing/submit
router.post('/submit', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const {
      topic_id, task1_prompt, task1_text, task1_word_count,
      task2_prompt, task2_text, task2_word_count, time_spent_seconds
    } = req.body;

    const { data, error } = await supabase
      .from('writing_submissions')
      .insert({
        user_id: userId,
        topic_id,
        task1_prompt, task1_text, task1_word_count,
        task2_prompt, task2_text, task2_word_count,
        time_spent_seconds,
        status: 'submitted',
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ submission_id: data.id, status: 'submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit writing' });
  }
});

// GET /api/writing/history
router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('writing_submissions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ submissions: data, pagination: { page, limit, total: count } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/writing/:submissionId
router.get('/:submissionId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('writing_submissions')
      .select('*')
      .eq('id', req.params.submissionId)
      .eq('user_id', req.userId!)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Submission not found' });
    res.json({ submission: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
});

export default router;
```

### 4.3 Register Routes

In `src/index.ts`:
```typescript
import topicRoutes from './routes/topics';
import writingRoutes from './routes/writing';

app.use('/api/topics', topicRoutes);
app.use('/api/writing', writingRoutes);
```

### ✅ Phase 4 Checkpoint

```bash
# Test topics (no auth needed)
curl http://localhost:3001/api/topics
# Should return 12 topics

# Test with search
curl "http://localhost:3001/api/topics?search=tech"
# Should return Technology

# Test writing submit (use your token from Phase 3)
curl -X POST http://localhost:3001/api/writing/submit \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "topic_id": "environment",
    "task1_prompt": "The chart shows...",
    "task1_text": "The bar chart illustrates the number of international students...",
    "task1_word_count": 172,
    "task2_prompt": "Some people believe...",
    "task2_text": "Climate change is one of the most pressing...",
    "task2_word_count": 287,
    "time_spent_seconds": 3420
  }'
# Should return 201 with submission_id

# Verify in Supabase Table Editor → writing_submissions should have a row
```

---

## Phase 5: Groq Integration (Writing Feedback)

### 5.1 Get Your Groq API Key

1. Go to [https://platform.groq.com](https://platform.groq.com)
2. Sign up or log in
3. Go to **API Keys** (left sidebar) or [https://platform.groq.com/api-keys](https://platform.groq.com/api-keys)
4. Click **"Create new secret key"**
5. Name it `ielts-nexus-backend`
6. Copy the key (starts with `sk-...`) — **you can only see it once**
7. Add billing: Go to **Settings → Billing** → Add a payment method and set a usage limit ($10 is plenty to start)

> **Cost**: GPT-4-turbo costs ~$0.01–0.03 per writing review. You can use `llama-3.1-8b-instant` during development to save money (much cheaper, ~$0.001 per review).

### 5.2 Add to `.env`

```bash
GROQ_API_KEY=sk-...your-key...
GROQ_MODEL=llama-3.1-8b-instant  # use llama-3.3-70b-versatile for production
```

### 5.3 Install Groq SDK

```bash
npm install groq-sdk
```

### 5.4 Create Groq Config

Create `src/config/groq.ts`:

```typescript
import Groq from 'groq-sdk';

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const MODELS = {
  CHAT: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  WHISPER: 'whisper-large-v3',
  TTS: 'tts-1',
};
```

### 5.5 Create AI Service

Create `src/services/aiService.ts`:

```typescript
import { groq, MODELS } from '../config/groq';

const WRITING_SYSTEM_PROMPT = `You are a certified IELTS examiner with 15+ years of experience. Evaluate IELTS Academic Writing submissions (Task 1 and Task 2).

Evaluate using official IELTS Band Descriptors across four criteria:
1. Task Achievement / Task Response
2. Coherence and Cohesion
3. Lexical Resource
4. Grammatical Range and Accuracy

Assign band scores from 0.0 to 9.0 in 0.5 increments.

Respond in JSON with this exact structure:
{
  "overall_score": 6.5,
  "task_achievement": 6.0,
  "coherence_cohesion": 7.0,
  "lexical_resource": 7.0,
  "grammatical_range": 6.0,
  "corrections": [
    {
      "original": "believes",
      "correction": "believe",
      "type": "grammar",
      "explanation": "Subject-verb agreement error",
      "paragraph": 1
    }
  ],
  "cohesion_issues": [
    {
      "location": "Between paragraph 1 and 2",
      "issue": "Abrupt transition",
      "suggestion": "Add a cohesive device"
    }
  ],
  "vocabulary_highlights": [
    { "word": "significantly", "type": "advanced" }
  ],
  "suggestions": [
    { "text": "Vary your cohesive devices", "priority": "high" }
  ]
}

Rules:
- Find EVERY grammar, spelling, and punctuation error.
- Overall score = average of four criteria, rounded to nearest 0.5.
- Be encouraging but honest.`;

export async function analyzeWriting(
  task1Prompt: string,
  task1Text: string,
  task2Prompt: string,
  task2Text: string
) {
  const response = await groq.chat.completions.create({
    model: MODELS.CHAT,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    max_tokens: 2000,
    messages: [
      { role: 'system', content: WRITING_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `## Task 1 Prompt\n${task1Prompt}\n\n## Task 1 Response\n${task1Text}\n\n## Task 2 Prompt\n${task2Prompt}\n\n## Task 2 Response\n${task2Text}`,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

### 5.6 Add AI Review Route to Writing

Add this to `src/routes/writing.ts`:

```typescript
import { analyzeWriting } from '../services/aiService';

// POST /api/writing/:submissionId/review/ai
router.post('/:submissionId/review/ai', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    // 1. Fetch the submission
    const { data: submission, error: fetchError } = await supabase
      .from('writing_submissions')
      .select('*')
      .eq('id', req.params.submissionId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // 2. Call Groq
    const feedback = await analyzeWriting(
      submission.task1_prompt,
      submission.task1_text,
      submission.task2_prompt,
      submission.task2_text
    );

    // 3. Store AI feedback
    await supabase.from('ai_feedback').insert({
      user_id: userId,
      writing_submission_id: submission.id,
      feedback_type: 'writing',
      overall_score: feedback.overall_score,
      task_achievement: feedback.task_achievement,
      coherence_cohesion: feedback.coherence_cohesion,
      lexical_resource: feedback.lexical_resource,
      grammatical_range: feedback.grammatical_range,
      corrections: feedback.corrections,
      insights: feedback.cohesion_issues,
      suggestions: feedback.suggestions,
      raw_response: feedback,
    });

    // 4. Update submission status
    await supabase
      .from('writing_submissions')
      .update({ status: 'ai_reviewed', review_type: 'ai' })
      .eq('id', submission.id);

    // 5. Record score in history
    await supabase.from('score_history').insert({
      user_id: userId,
      module: 'writing',
      score: feedback.overall_score,
      source: 'ai',
      source_id: submission.id,
    });

    res.json({ feedback });
  } catch (err: any) {
    console.error('AI Review Error:', err);
    res.status(500).json({ error: 'AI review failed. Please try again.' });
  }
});
```

### ✅ Phase 5 Checkpoint

Use the submission_id from Phase 4:
```bash
curl -X POST http://localhost:3001/api/writing/SUBMISSION_ID/review/ai \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

You should get back a JSON with `overall_score`, `corrections`, `suggestions`, etc.

Check **Supabase Table Editor**:
- `ai_feedback` should have 1 new row
- `writing_submissions` status should be `ai_reviewed`
- `score_history` should have 1 row for writing

🎉 **Congratulations! You now have a working AI-powered essay reviewer!**

---

## Phase 6: Speaking APIs + Whisper

### 6.1 Create Speaking Route

Create `src/routes/speaking.ts`:

```typescript
import { Router } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

const SPEAKING_QUESTIONS = [
  "Let's talk about where you live. Do you live in a house or an apartment?",
  "What do you like most about your neighborhood?",
  "How long have you been living in your current home?",
  "Would you like to move to a different area in the future?",
  "Now let's discuss hobbies. What do you enjoy doing in your free time?",
  "How often do you practice your hobbies?",
  "Have your hobbies changed since you were a child?",
  "Do you think hobbies are important? Why?",
  "Let's move on to food. What is your favorite type of cuisine?",
  "Do you prefer eating at home or in restaurants?",
];

// POST /api/speaking/start
router.post('/start', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabase
      .from('speaking_submissions')
      .insert({
        user_id: req.userId!,
        topic_id: req.body.topic_id || null,
        status: 'submitted',
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ submission_id: data.id, questions: SPEAKING_QUESTIONS });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start speaking session' });
  }
});

// POST /api/speaking/:submissionId/response
router.post('/:submissionId/response', authMiddleware, upload.single('audio'), async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { submissionId } = req.params;
    const { question_index, question_text } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No audio file provided' });

    // Upload to Supabase Storage
    const filePath = `${userId}/${submissionId}/q${question_index}.webm`;
    const { error: uploadError } = await supabase.storage
      .from('speaking-recordings')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype || 'audio/webm',
        upsert: true,
      });

    if (uploadError) return res.status(400).json({ error: uploadError.message });

    // Get the URL
    const { data: urlData } = supabase.storage
      .from('speaking-recordings')
      .getPublicUrl(filePath);

    // Save to database
    const { data, error } = await supabase
      .from('speaking_responses')
      .insert({
        submission_id: submissionId,
        question_index: parseInt(question_index),
        question_text,
        audio_url: filePath, // store the path, not public URL (bucket is private)
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ response_id: data.id, audio_path: filePath });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to upload response' });
  }
});

export default router;
```

### 6.2 Add Whisper Transcription to AI Service

Add to `src/services/aiService.ts`:

```typescript
import { Readable } from 'stream';

export async function transcribeAudio(audioBuffer: Buffer, filename: string): Promise<string> {
  // Convert Buffer to a File-like object for Groq
  const file = new File([audioBuffer], filename, { type: 'audio/webm' });

  const transcription = await groq.audio.transcriptions.create({
    model: MODELS.WHISPER,
    file: file,
    language: 'en',
  });

  return transcription.text;
}

const SPEAKING_SYSTEM_PROMPT = `You are a certified IELTS Speaking examiner. Analyze transcribed speaking responses.

Evaluate using IELTS Speaking Band Descriptors:
1. Fluency and Coherence
2. Pronunciation (inferred from text patterns)
3. Lexical Resource
4. Grammatical Range and Accuracy

Count filler words (um, uh, like, you know, I mean).

Respond in JSON:
{
  "overall_score": 6.5,
  "fluency_coherence": 7.0,
  "pronunciation": 6.5,
  "lexical_resource": 7.5,
  "grammatical_range": 6.5,
  "insights": [
    { "category": "strength", "title": "Transitional Phrases", "detail": "Good use of linking words" },
    { "category": "warning", "title": "Filler Words", "detail": "8 instances of um/uh" },
    { "category": "improvement", "title": "Pronunciation", "detail": "Practice th sounds" }
  ],
  "filler_count": 8
}`;

export async function analyzeSpeaking(
  transcripts: Array<{ question: string; answer: string; duration_seconds: number }>
) {
  const formatted = transcripts
    .map((t, i) => `Q${i + 1}: ${t.question}\nA${i + 1} (${t.duration_seconds}s): ${t.answer}`)
    .join('\n\n');

  const response = await groq.chat.completions.create({
    model: MODELS.CHAT,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    max_tokens: 1500,
    messages: [
      { role: 'system', content: SPEAKING_SYSTEM_PROMPT },
      { role: 'user', content: formatted },
    ],
  });

  return JSON.parse(response.choices[0].message.content!);
}
```

### 6.3 Add AI Review Route for Speaking

Add this to `src/routes/speaking.ts`:

```typescript
import { transcribeAudio, analyzeSpeaking } from '../services/aiService';

// POST /api/speaking/:submissionId/review/ai
router.post('/:submissionId/review/ai', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;

    // 1. Fetch all responses
    const { data: responses, error } = await supabase
      .from('speaking_responses')
      .select('*')
      .eq('submission_id', req.params.submissionId)
      .order('question_index');

    if (error || !responses || responses.length === 0) {
      return res.status(404).json({ error: 'No responses found' });
    }

    // 2. Download and transcribe each audio
    const transcripts = await Promise.all(
      responses.map(async (response) => {
        const { data: audioData } = await supabase.storage
          .from('speaking-recordings')
          .download(response.audio_url);

        if (!audioData) throw new Error(`Failed to download ${response.audio_url}`);

        const buffer = Buffer.from(await audioData.arrayBuffer());
        const transcript = await transcribeAudio(buffer, `q${response.question_index}.webm`);

        // Save transcript back
        await supabase
          .from('speaking_responses')
          .update({ transcript })
          .eq('id', response.id);

        return {
          question: response.question_text,
          answer: transcript,
          duration_seconds: response.duration_seconds || 20,
        };
      })
    );

    // 3. Analyze with GPT-4
    const feedback = await analyzeSpeaking(transcripts);

    // 4. Store feedback
    await supabase.from('ai_feedback').insert({
      user_id: userId,
      speaking_submission_id: req.params.submissionId,
      feedback_type: 'speaking',
      overall_score: feedback.overall_score,
      fluency_coherence: feedback.fluency_coherence,
      pronunciation: feedback.pronunciation,
      speaking_lexical: feedback.lexical_resource,
      speaking_grammatical: feedback.grammatical_range,
      insights: feedback.insights,
      raw_response: feedback,
    });

    // 5. Record score
    await supabase.from('score_history').insert({
      user_id: userId,
      module: 'speaking',
      score: feedback.overall_score,
      source: 'ai',
    });

    res.json({ feedback: { ...feedback, transcripts } });
  } catch (err: any) {
    console.error('Speaking AI Review Error:', err);
    res.status(500).json({ error: 'Speaking review failed' });
  }
});
```

### 6.4 Register Speaking Routes

In `src/index.ts`:
```typescript
import speakingRoutes from './routes/speaking';
app.use('/api/speaking', speakingRoutes);
```

### ✅ Phase 6 Checkpoint

You can't easily test audio upload from curl, but you can test the endpoint exists:
```bash
# Test session creation
curl -X POST http://localhost:3001/api/speaking/start \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"topic_id": "environment"}'
# Should return 201 with submission_id and 10 questions
```

To fully test audio upload, you'll need the frontend connected (Phase 12) or use a tool like Postman to send a multipart form with an audio file.

---

## Phase 7: Grammar + Exam APIs

Follow the same patterns as Phases 4–6. Create:
- `src/routes/grammar.ts` — MCQ sessions with AI-generated questions
- `src/routes/exam.ts` — Full simulation with listening/reading/writing/speaking

Refer to `03-backend-api.md` for exact endpoint specs.

### ✅ Phase 7 Checkpoint
Test `GET /api/grammar/session` returns questions and `POST .../answer` validates them.

---

## Phase 8: Community APIs

Create `src/routes/community.ts` with:
- `GET /api/community/posts` — paginated feed
- `GET /api/community/posts/:id` — full post detail
- `POST /api/community/posts` — publish essay to community
- `POST /api/community/posts/:id/like` — toggle like
- `POST /api/community/posts/:id/save` — toggle save
- `POST /api/community/posts/:id/comments` — add comment

Refer to `03-backend-api.md` for exact specs.

### ✅ Phase 8 Checkpoint
```bash
curl http://localhost:3001/api/community/posts \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

---

## Phase 9: Streaks, Badges, Analytics

Create `src/routes/streaks.ts` and `src/services/badgeService.ts`. This handles:
- Recording daily activity
- Updating streak counter
- Checking and unlocking badges
- Score history for analytics

### ✅ Phase 9 Checkpoint
Record an activity and verify the streak increases in the database.

---

## Phase 10: Stripe Payments

### 10.1 Get Stripe Keys

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com) and sign up
2. Stay in **Test Mode** (toggle at the top)
3. Go to **Developers → API keys**
4. Copy:
   - **Publishable key** (`pk_test_...`) — for frontend
   - **Secret key** (`sk_test_...`) — for backend

### 10.2 Create Products in Stripe

1. Go to **Products** → Click **"Add product"**
2. Create **"IELTS Nexus Premium"**:
   - Price: $29/month, recurring
   - Copy the **Price ID** (`price_...`)
3. Create **"Human Verification Credit"**:
   - Price: $9.99, one-time
   - Copy the **Price ID**

### 10.3 Setup Webhook

1. Go to **Developers → Webhooks**
2. Click **"Add endpoint"**
3. URL: `https://your-backend-url/api/subscriptions/webhook` (use `localhost` with Stripe CLI for testing)
4. Select events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
5. Copy the **Webhook signing secret** (`whsec_...`)

### 10.4 Add to `.env`

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_CREDIT_PRICE_ID=price_...
```

```bash
npm install stripe
```

Create `src/routes/subscriptions.ts` following the specs in `03-backend-api.md`.

### ✅ Phase 10 Checkpoint

Test using Stripe CLI locally:
```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

stripe listen --forward-to localhost:3001/api/subscriptions/webhook
# Copy the webhook signing secret it prints

# In another terminal, trigger a test event:
stripe trigger checkout.session.completed
```

---

## Phase 11: Deploy Backend

### Option A: Railway (Recommended — easiest)

1. Go to [https://railway.app](https://railway.app) and sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your backend repository
4. Railway auto-detects Node.js. Set:
   - **Build command**: `npm run build`
   - **Start command**: `npm start`
5. Go to **Variables** → Add all your `.env` variables
6. Railway gives you a URL like `https://ielts-nexus-backend.up.railway.app`
7. Update your `FRONTEND_URL` variable to your Vercel frontend URL

### Option B: Render (Free tier available)

1. Go to [https://render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set:
   - **Build command**: `npm install && npm run build`
   - **Start command**: `npm start`
4. Add environment variables
5. Deploy

### After Deployment

1. Update your Stripe webhook URL to the deployed backend URL
2. Test `https://your-backend.railway.app/api/health`
3. Test `https://your-backend.railway.app/api/topics`

### ✅ Phase 11 Checkpoint

```bash
curl https://your-deployed-url/api/health
# Should return {"status":"ok",...}

curl https://your-deployed-url/api/topics
# Should return 12 topics
```

---

## Phase 12: Connect Frontend to Backend

This is the final phase. You'll modify the React frontend **one screen at a time** so nothing breaks all at once.

### 12.1 Install Supabase Client in Frontend

```bash
cd /media/amrut-patankar/New\ Volume1/star-ielts/Ieltsnexus
npm install @supabase/supabase-js
```

### 12.2 Create API Config

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);
```

Create `src/lib/api.ts`:
```typescript
const API_URL = 'https://your-backend.railway.app/api';

export async function apiCall(path: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

### 12.3 Connect Screens One by One

**Order to connect** (each step keeps the app working):

1. **AuthScreen** — replace local state with real Supabase Auth
2. **HomeScreen** — fetch real profile data and stats from `/api/profile`
3. **TopicSelection** — fetch from `/api/topics`
4. **WritingModule** — submit to `/api/writing/submit`, trigger AI review
5. **SpeakingSimulation** — add real `MediaRecorder`, upload audio
6. **ExamSimulation** — connect all four phases
7. **CommunityScreen** — fetch from `/api/community/posts`
8. **ProfileScreen** — fetch stats, weaknesses, credits

> **Tip**: When connecting a screen, keep the hardcoded data as fallback. Use it when the API call fails or is loading. This way the app never looks broken.

```typescript
// Example: safe data fetching pattern
const [topics, setTopics] = useState(HARDCODED_TOPICS); // fallback
const [loading, setLoading] = useState(true);

useEffect(() => {
  apiCall('/topics')
    .then(data => setTopics(data.topics))
    .catch(() => console.log('Using fallback data'))
    .finally(() => setLoading(false));
}, []);
```

### ✅ Phase 12 Final Checkpoint

1. Sign up with a real email → profile created in Supabase
2. Write an essay → submit → get AI feedback with band score
3. Record speaking → transcription + analysis returned
4. Community feed shows real posts
5. Profile shows real stats

---

## Quick Reference: Where Things Live

| Thing | Location |
|---|---|
| Frontend code | `/media/amrut-patankar/New Volume1/star-ielts/Ieltsnexus/` |
| Backend code | `~/ielts-nexus-backend/` (separate project) |
| Database | Supabase Dashboard → Table Editor |
| Audio files | Supabase Dashboard → Storage → speaking-recordings |
| AI prompts | `backend/src/services/aiService.ts` |
| Stripe config | Stripe Dashboard (Test Mode) |
| Backend deployment | Railway / Render dashboard |
| Frontend deployment | Vercel |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `401 Unauthorized` | Token expired. Get a new one from Supabase Auth |
| `RLS policy violation` | Check that you enabled RLS AND added the policies |
| Groq `429 Rate limited` | You're sending too many requests. Add a delay or use `llama-3.1-8b-instant` |
| Groq `Insufficient quota` | Add billing at platform.groq.com → Settings → Billing |
| `Cannot find module` | Run `npm install` in the backend folder |
| Supabase Storage upload fails | Check bucket exists and CORS is configured |
| CORS error from frontend | Verify `FRONTEND_URL` in backend `.env` matches exactly |
