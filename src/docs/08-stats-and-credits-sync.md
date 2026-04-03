# Stats and Credits Sync Architecture

This document defines the unified approach to ensure that whenever a user consumes a service in *any* module (Writing, Speaking, Mock Exams), their profile statistics and credit balances are updated consistently across both the database and the frontend UI.

## 1. Core Rule: Backend Authority
All updates to user stats (hours practiced, study streaks, current band score, tests completed) and deductions of credits MUST happen on the backend server. The frontend must NEVER perform calculations or mutate these values locally, it should only send the activity duration (e.g., `time_spent_seconds`) and request the backend to process it.

## 2. Event Triggers (Backend Requirements)
Whenever a service usage is confirmed (e.g., successful AI feedback generation or human verification submission), the backend endpoints (like `POST /api/writing/:id/review/ai`, `POST /api/speaking/:id/review/ai`, etc.) must execute the following database updates grouped in a single transaction:

1. **Credit Deduction**: `UPDATE credits SET balance = balance - 1 WHERE user_id = <uid>`
2. **Tests Completed**: Increment total count in `score_history` or related aggregation.
3. **Hours Practiced**: `UPDATE user_stats SET hours_practiced = hours_practiced + (time_spent_seconds / 3600.0)`.
4. **Current Band**: Re-calculate moving average or update `current_band` based on the newly generated overall score.
5. **Study Streak**: Check `study_streaks` against `NOW()` and update the consecutive days count.

## 3. Frontend Synchronization Pattern
To ensure the `ProfileScreen`, `HomeScreen`, and `ReviewChoiceModal` always reflect the exact database state, the frontend must strictly follow this pattern:

1. App-level state management in `App.tsx` controls `userProfile`, `userStats`, and `availableCredits`.
2. This state is fetched on mount and whenever `activeScreen` changes via the `refreshProfile()` function.
3. Complex modules (e.g., `WritingModule`, `SpeakingSimulation`) receive an `onCreditUpdate` or `onStatsUpdate` callback via props (mapped to `refreshProfile()` in `App.tsx`).
4. Immediately after successfully `await`ing a submission endpoint that triggers backend stats changes, the module MUST fire `onCreditUpdate()`.

### Example Flow:
```typescript
try {
  // 1. Submit attempt to Groq / Whisper
  const reviewResponse = await apiCall(`/module/${id}/review`, { method: 'POST' });
  
  // 2. Set local UI state for feedback
  setAiFeedback(reviewResponse.feedback);
  
  // 3. FORCE APP-WIDE STATS REFRESH (triggers GET /api/profile in App.tsx)
  onCreditUpdate?.();
} catch (error) {
  // Handle gracefully
}
```

By adhering to this pattern, the frontend will never go out-of-sync with the backend, allowing users to instantly see their changes in credits, hours practiced, and testing streaks across the entire app.
