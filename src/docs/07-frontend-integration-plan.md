# IELTS Nexus — Phase-by-Phase Frontend Integration & Testing Plan

This document breaks down the process of converting the React prototype UI into a fully functional application connected to the Render backend (`https://ieltsbackend-gogn.onrender.com/`).

> **Golden Rule**: **Always keep a fallback.** While changing a component, if the API call fails or is still `loading`, display the hardcoded prototype data. This ensures your app never visibly breaks during the transition.

---

## Phase 1: Environment & API Client

**Objective**: Configure the environment and build a wrapper to inject the Supabase JWT token automatically into every backend request.

**1. Create `.env.local`**
```bash
VITE_API_URL=https://ieltsbackend-gogn.onrender.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**2. Create `src/lib/supabase.ts`**
Import `@supabase/supabase-js`, initialize the client with the keys above, and export it.

**3. Create `src/lib/api.ts`**
Build a fetch wrapper `apiCall(path, options)` that:
- Calls `supabase.auth.getSession()` to get the JWT.
- Automatically appends `Authorization: Bearer <token>`.
- Appends `Content-Type: application/json` (unless it's FormData).
- Prepends `VITE_API_URL` to all requests.

**🧪 UI Testing Plan for Phase 1**:
- Add a tiny test script in `App.tsx`'s `useEffect`: `apiCall('/health').then(console.log)`.
- **Pass if**: Developer console prints `{"status":"ok", "timestamp":"..."}`.

---

## Phase 2: Authentication (`AuthScreen.tsx`)

**Objective**: Replace local component state login with real Supabase Auth, and trigger backend profile initialization.

**Integration Steps**:
1. In `AuthScreen.tsx`, switch the fake "Sign In" button to call `supabase.auth.signInWithPassword({ email, password })`.
2. For "Sign Up", call `supabase.auth.signUp()`.
3. Inside the `onSignUpSuccess` flow (once signup is successful), call:
   `POST /api/auth/complete-profile` with the `goal_score`, `target_date`, etc. from the UI forms.
4. Elevate the Supabase user session state to `App.tsx` to conditionally render `AuthScreen` vs `HomeScreen`.

**🧪 UI Testing Plan for Phase 2**:
- Log out (clear localStorage/session).
- Fill out the Sign-Up form with real data.
- **Pass if**: 
  - Supabase dashboard shows the new user in `auth.users` and the `profiles` table.
  - The UI correctly transitions to the `HomeScreen`.

---

## Phase 3: Dashboard & Profile (`HomeScreen.tsx` & `ProfileScreen.tsx`)

**Objective**: Fetch real statistics directly from the backend to replace the hardcoded "Tests taken: 47".

**Integration Steps**:
1. In `ProfileScreen.tsx`, call `GET /api/profile` on mount.
2. Bind the UI variables (Current Band, Streak, Hours Practiced) to the `stats` object returned by the API.
3. Bind the user's name and Tier (Free/Premium) to the `profile` object.
4. Bind the Credit count to the UI (used later for "Upgrade/Top-Up").

**🧪 UI Testing Plan for Phase 3**:
- Load the Profile screen.
- **Pass if**: 
  - Statistics read `0` since the user is newly created.
  - Display name matches the one chosen during Phase 2 signup.
  - Hit the `POST /api/profile/upgrade-premium-demo` endpoint manually in Postman/Curl. Refresh the page. Tier badge should turn from Free to Premium, and credits should increase to 60.

---

## Phase 4: Topics & Writing Module (`WritingModule.tsx`)

**Objective**: Fetch dynamic topics and submit essays to Groq for JSON feedback.

**Integration Steps**:
1. In `TopicSelection.tsx`, fetch `GET /api/topics`. Map the DB topics instead of hardcoded arrays.
2. In `WritingModule.tsx`, when the user clicks **"Submit for AI Review"**:
   - `POST /api/writing/submit` -> Retrieves a `submission_id`.
   - Take the `submission_id` and immediately call `POST /api/writing/:submissionId/review/ai`.
3. Replace the `AI Feedback` UI blocks (Band Score, Corrections, Insights) by mapping them to the response from the AI Review call.

**🧪 UI Testing Plan for Phase 4**:
- Click a topic and type a short essay. 
- Click "Submit for AI Review". 
- Add a loading spinner while waiting for Groq.
- **Pass if**: 
  - The UI populates with Groq's exact corrections mapped to the text.
  - Profile Stats (`GET /api/profile`) now show `tests_completed: 1`.

---

## Phase 5: Speaking Module (`SpeakingSimulation.tsx`)

**Objective**: Record real human voice using the browser, send it to the backend for Groq Whisper transcription, and receive scoring.

**Integration Steps**:
1. Upgrade `setIsRecording(true)`: Implement `navigator.mediaDevices.getUserMedia` and `MediaRecorder`.
2. When the timer hits zero or user clicks "Next", capture the `.webm` audio Blob.
3. Send to `POST /api/speaking/:submissionId/response` via `FormData` (multipart upload).
4. After answering all 10 questions, trigger `POST /api/speaking/:submissionId/review/ai`.
5. Map the returned Whisper transcript and Groq score to the results screen.

**🧪 UI Testing Plan for Phase 5**:
- Run a speaking simulation. Ensure browser asks for Microphone permissions.
- Speak out loud for 3 questions.
- **Pass if**: 
  - The final analysis screen shows the *exact* words you said (transcriptions), filler counts ("um", "uh"), and highlights pronunciation/fluency weaknesses.
  - You see your audio files appear in your Supabase dashboard `speaking-recordings` storage bucket.

---

## Phase 6: Unified Exam Simulation (`ExamSimulation.tsx`)

**Objective**: Link all modules together under a single `exam_id`.

**Integration Steps**:
1. Start with `POST /api/exam/start`.
2. For the Listening and Reading phases, currently use mock local data or the structure mapped in `api/exam/:examId/listening`.
3. For Writing and Speaking, reuse the API components from Phases 4 & 5, but append them to the `examId` routes rather than standalone routes.
4. Call `POST /api/exam/:examId/complete`.

**🧪 UI Testing Plan for Phase 6**:
- Enter full exam mode. Skip aggressively using test buttons mapping to the endpoints.
- **Pass if**: 
  - The final results page generates the comprehensive Radar Chart mapping all 4 skills successfully against the Groq AI responses.

---

## Phase 7: Community (`CommunityScreen.tsx`)

**Objective**: Bring life to the social feed.

**Integration Steps**:
1. Mount `GET /api/community/posts`. 
2. When clicking the ♥️ button on any essay card, call `POST /api/community/posts/:postId/like` and optimistically increment the UI integer by 1.
3. Call `POST /api/community/posts` whenever the user clicks "Publish to community" from an excellent AI review screen.

**🧪 UI Testing Plan for Phase 7**:
- Review an essay in Phase 4. Click publish.
- Navigate to the community screen.
- **Pass if**: You see your own essay populated in the "Latest" feed, and you can successfully like it.
