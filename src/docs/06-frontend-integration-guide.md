# Frontend Integration Guide

This document is a comprehensive standalone guide for frontend developers integrating the IELTS Nexus React/React Native application with the Express.js Backend.

## 1. Free vs. Premium Users & Subscriptions

**Yes, the backend natively supports the database schemas for both Free and Premium users (`profiles.tier`).** 
However, because the **Stripe Payment Integration was intentionally skipped**, the automated mechanism to evaluate payment hooks does not exist yet. 

**What this means for the Frontend:**
- When a user signs up via `POST /api/auth/complete-profile`, their profile initializes natively as `'free'`, but they are **automatically granted 15 free credits** as a signup bonus to test out your system.
- The frontend should still implement UI locks based on the `tier` parameter in `GET /api/profile`.

To test Premium features, you have two options:
1. Manually change the user's `tier` to `'premium'` directly inside the Supabase `profiles` table via the dashboard.
2. Hit the newly exposed helper endpoint: `POST /api/profile/upgrade-premium-demo`. This completely overrides the skipped Stripe boundaries, upgrading the current user to Premium **and instantly adding 60 credits** to their account automatically!

---

## 2. Deviations from the Original Specifications

We closely followed `03-backend-api.md` and `05-implementation-guide.md`, but made a few critical architectural pivots for optimization:

### A. Groq replaced OpenAI
Originally, the project requested OpenAI (GPT-4) and OpenAI Whisper. We fully transitioned the AI Service layer to **Groq (`llama-3.3-70b-versatile`)** and **Groq Whisper (`whisper-large-v3`)**. 
- **Why?** Groq operates at speeds 10x-50x faster than standard LLMs, generating JSON structured feedback for essays and speaking exams almost instantly. It is also significantly cheaper/free while yielding competitive band-scoring accuracy.

### B. Human Reviews & Credits Skipped
Features involving Human Reviews (`/api/reviews`) and Credit Transactions were skipped. The focus remains heavily on the instant AI-Feedback loop. All "Credit Deductions" mentioned in the early specs for AI reviews are currently disabled so users can infinitely use the AI APIs.

### C. Stripe / Subscriptions Skipped
The `POST /api/subscriptions/...` Stripe checkout endpoints were skipped in favor of preparing the immediate product for production deployment.

---

## 3. How to Integrate: Authentication

The backend **does not perform email/password operations directly**. It trusts Supabase Auth.
1. The frontend must use the `@supabase/supabase-js` client library to perform user sign-up and sign-in directly.
2. Upon successful login, the frontend receives a `session` containing an `access_token` (JWT).
3. The frontend must pass this JWT as a **Bearer Token** to *every* backend request.

**Headers format for backend requests:**
```json
{
  "Authorization": "Bearer YOUR_SUPABASE_JWT_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
```

*Important:* Supabase tokens expire every 1 hour. Make sure your frontend fetches a refreshed session using `supabase.auth.getSession()` before sending long-lived requests.

---

## 4. How to Integrate: Essential Flows

### A. Onboarding (First Time Login)
Right after your user makes an account via Supabase, call:
`POST /api/auth/complete-profile`
```json
{
  "name": "John Doe",
  "goal_score": 7.5,
  "exam_reason": "university",
  "current_level": "intermediate"
}
```
*This initializes their statistics, streaks, and weakness trackers! If you don't call this, other APIs will fail due to Foreign Key constraints.*

### B. Uploading Speaking Audio
Transcribing audio uses a specialized route requiring `multipart/form-data` instead of generic JSON.
1. Use the browser `MediaRecorder` API to record WebM or MP4 blobs.
2. Form your request using `FormData`:
```javascript
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.webm');
formData.append('question_index', 0);
formData.append('question_text', "What is your hometown?");

fetch('http://localhost:3001/api/speaking/YOUR_SUBMISSION_ID/response', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }, // NO Content-Type header, let browser set boundary
    body: formData
});
```

### C. Displaying the Dashboard
Fetch these endpoints on the main dashboard load:
1. `GET /api/profile` - Retrieves their name, `tests_completed`, and current streak count.
2. `GET /api/profile/analytics` - Use this data to render a Radar/Spider chart comparing their `current_scores` against their `target_scores`.
3. `GET /api/streaks` - Fetches calendar details tracking if they have broken their streak.
4. `GET /api/streaks/badges` - Displays all globally available badges and grays out the ones lacking the `unlocked: true` boolean.

### D. Executing the unified Exam Module
When the user sits down for the multi-part Mock Exam:
1. Hit `POST /api/exam/start` -> Saves session, stores `exam_id`.
2. Iterate through sections sequentially:
   - `POST /api/exam/:examId/listening/submit`
   - `POST /api/exam/:examId/reading/submit`
   - `POST /api/exam/:examId/writing/submit`
   - `POST /api/exam/:examId/speaking/response`
3. Hit `POST /api/exam/:examId/complete`. The backend stitches the sections together to produce an exact IELTS Band calculation ranging from 1 to 9.

### E. Community Feed
Build a social feed leveraging `GET /api/community/posts`. Note that `likes_count` and `comments_count` will accurately display relations joined alongside the user's `author` detail wrapper.
To like a post, send an empty body to `POST /api/community/posts/:postId/like`. The UI should optimistically assume it succeeded and swap the heart icon.

---

## 5. Deployment Information
The backend has been standardized for headless deployment instances. 
- It uses standard `npm run build` and `npm start` execution.
- It exposes `/` and `/api/health` for Render/Railway network routing pings.
- The entire project is completely detached from `.env` secrets. Ensure you replicate your `.env` pairs (especially your API keys and `FRONTEND_URL`) inside your provider's dashboard limits safely.
