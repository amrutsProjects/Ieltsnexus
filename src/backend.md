# IELTS Nexus - Backend API Guide

## Overview
This document serves as a guide for implementing the backend APIs when moving from prototype to production. The app requires a full-stack architecture to handle AI scoring, human verification workflows, and user progress tracking.

---

## 1. Authentication & User Management

### POST /api/auth/register
**Purpose**: Create new user account with comprehensive onboarding data  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "hashedPassword",
  "name": "Alex Johnson",
  "goalScore": 7.5,
  "examReason": "university" | "job" | "immigration" | "professional",
  "weaknesses": ["Grammar & Sentence Structure", "Speaking Fluency"],
  "currentLevel": "beginner" | "intermediate" | "advanced",
  "targetDate": "2026-06-15"
}
```
**Response**:
```json
{
  "userId": "uuid",
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "profile": {
    "name": "Alex Johnson",
    "email": "user@example.com",
    "tier": "free",
    "goalScore": 7.5,
    "examReason": "university",
    "weaknesses": ["Grammar & Sentence Structure", "Speaking Fluency"],
    "currentLevel": "intermediate",
    "targetDate": "2026-06-15"
  }
}
```

### POST /api/auth/login
**Purpose**: User login  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET /api/user/profile
**Purpose**: Fetch user profile and stats  
**Response**:
```json
{
  "userId": "uuid",
  "name": "Alex Johnson",
  "email": "user@example.com",
  "tier": "premium",
  "targetBand": 8.0,
  "currentScores": {
    "writing": 6.5,
    "speaking": 6.0,
    "reading": 7.0,
    "listening": 6.5
  },
  "testsRemaining": 15,
  "humanVerificationsRemaining": 3,
  "verificationCredits": 5,
  "streak": 12
}
```

---

## 2. Practice Tests & Submissions

### POST /api/practice/writing/submit
**Purpose**: Submit writing task for AI scoring  
**Request Body**:
```json
{
  "taskType": "task1" | "task2",
  "topic": "climate-change",
  "essayText": "user's full essay text...",
  "wordCount": 287
}
```
**Response**:
```json
{
  "submissionId": "uuid",
  "aiScore": 7.5,
  "scoreType": "ai-estimated",
  "feedback": {
    "taskAchievement": { score: 7.5, feedback: "..." },
    "coherenceCohesion": { score: 7.0, feedback: "..." },
    "lexicalResource": { score: 8.0, feedback: "..." },
    "grammaticalAccuracy": { score: 7.5, feedback: "..." }
  },
  "grammarErrors": [
    {
      "original": "Many people believes",
      "correction": "Many people believe",
      "explanation": "Subject-verb agreement error"
    }
  ],
  "processingTime": 2.3
}
```

### POST /api/practice/speaking/submit
**Purpose**: Submit speaking recording for AI analysis  
**Request Body** (multipart/form-data):
```
audioFile: blob
questionId: "speaking-part1-q1"
duration: 45 (seconds)
```
**Response**:
```json
{
  "submissionId": "uuid",
  "aiScore": 6.5,
  "scoreType": "ai-estimated",
  "feedback": {
    "fluency": { score: 7.0, feedback: "..." },
    "pronunciation": { score: 6.0, feedback: "..." },
    "vocabulary": { score: 7.0, feedback: "..." },
    "grammar": { score: 6.5, feedback: "..." }
  },
  "transcription": "user's spoken text...",
  "pronunciationIssues": [
    { word: "thoroughly", issue: "th-sound", timestamp: 12.3 }
  ]
}
```

---

## 3. Human Verification System

### POST /api/verification/request
**Purpose**: Request human verification of a submission  
**Request Body**:
```json
{
  "submissionId": "uuid",
  "submissionType": "writing" | "speaking"
}
```
**Response**:
```json
{
  "verificationId": "uuid",
  "status": "pending",
  "estimatedCompletionTime": "24-48 hours",
  "creditsUsed": 1,
  "creditsRemaining": 2
}
```

### GET /api/verification/:verificationId/status
**Purpose**: Check status of human verification  
**Response**:
```json
{
  "verificationId": "uuid",
  "status": "completed" | "pending" | "in-progress",
  "humanScore": 7.0,
  "examinerFeedback": {
    "overallComment": "...",
    "strengths": ["...", "..."],
    "improvements": ["...", "..."]
  },
  "aiScore": 7.5,
  "scoreDifference": -0.5
}
```

---

## 4. Full Exam Simulation

### POST /api/exam/start
**Purpose**: Start a full 4-section exam  
**Response**:
```json
{
  "examSessionId": "uuid",
  "startTime": "2025-02-28T10:00:00Z",
  "sections": [
    { "name": "listening", "duration": 1800, "questions": 10 },
    { "name": "reading", "duration": 1800, "questions": 10 },
    { "name": "writing", "duration": 3600, "questions": 2 },
    { "name": "speaking", "duration": 600, "questions": 10 }
  ]
}
```

### POST /api/exam/:sessionId/submit
**Purpose**: Submit complete exam  
**Request Body**:
```json
{
  "listeningAnswers": [...],
  "readingAnswers": [...],
  "writingTask1": "text...",
  "writingTask2": "text...",
  "speakingRecordings": ["audioBlob1", "audioBlob2", ...]
}
```
**Response**:
```json
{
  "overallBand": 7.0,
  "sectionScores": {
    "listening": 7.5,
    "reading": 7.0,
    "writing": 6.5,
    "speaking": 7.0
  },
  "scoreType": "ai-estimated",
  "weaknesses": [
    { skill: "subject-verb-agreement", count: 3 },
    { skill: "th-pronunciation", count: 5 }
  ]
}
```

---

## 5. Community & Social Features

### GET /api/community/feed
**Purpose**: Fetch community posts  
**Query Params**: `?filter=trending|band8|verified&page=1&limit=20`  
**Response**:
```json
{
  "posts": [
    {
      "postId": "uuid",
      "author": { name: "Sarah Chen", isPremium: true, badge: "7.5" },
      "taskType": "writing",
      "topic": "climate-change",
      "score": 7.5,
      "isVerified": true,
      "likes": 42,
      "comments": 12,
      "preview": "essay excerpt...",
      "timestamp": "2h ago"
    }
  ],
  "pagination": { page: 1, totalPages: 10 }
}
```

### POST /api/community/post/:postId/like
**Purpose**: Like a community post  

### POST /api/community/post/:postId/save
**Purpose**: Save post to user's collection  

### POST /api/community/post/:postId/comment
**Purpose**: Add comment to a post  
**Request Body**:
```json
{
  "content": "Great essay! One small tip: watch out for..."
}
```

---

## 6. Analytics & Progress Tracking

### GET /api/analytics/dashboard
**Purpose**: Fetch user analytics for Command Center  
**Response**:
```json
{
  "radarData": {
    "writing": 6.5,
    "speaking": 6.0,
    "reading": 7.0,
    "listening": 6.5
  },
  "progressOverTime": [
    { date: "2025-02-01", overallBand: 6.0 },
    { date: "2025-02-15", overallBand: 6.5 },
    { date: "2025-02-28", overallBand: 7.0 }
  ],
  "weaknesses": [
    { id: "1", title: "Subject-Verb Agreement", category: "Grammar", count: 12 },
    { id: "2", title: "Th-Sound Pronunciation", category: "Speaking", count: 8 }
  ]
}
```

### GET /api/analytics/weaknesses
**Purpose**: Fetch detailed weakness breakdown  
**Response**:
```json
{
  "weaknesses": [
    {
      "id": "1",
      "skill": "subject-verb-agreement",
      "category": "grammar",
      "occurrences": 12,
      "lastSeen": "2025-02-28",
      "improvementRate": "declining",
      "practiceRecommendation": "grammar-drill-sva"
    }
  ]
}
```

---

## 7. Subscription & Payments

### GET /api/subscription/plans
**Purpose**: Fetch available subscription plans  
**Response**:
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "features": {
        "aiTests": 3,
        "verificationCredits": 0,
        "fullExams": 1
      }
    },
    {
      "id": "premium",
      "name": "Premium",
      "price": 29,
      "features": {
        "aiTests": 20,
        "verificationCredits": 5,
        "fullExams": "unlimited"
      }
    }
  ]
}
```

### POST /api/subscription/upgrade
**Purpose**: Upgrade to premium  
**Request Body**:
```json
{
  "planId": "premium",
  "paymentMethodId": "stripe-pm-id"
}
```

### POST /api/credits/purchase
**Purpose**: Purchase additional verification credits (à la carte)  
**Request Body**:
```json
{
  "quantity": 3,
  "paymentMethodId": "stripe-pm-id"
}
```
**Response**:
```json
{
  "orderId": "uuid",
  "creditsPurchased": 3,
  "totalCost": 29.97,
  "newCreditBalance": 8
}
```

### GET /api/credits/balance
**Purpose**: Get current credit balance  
**Response**:
```json
{
  "verificationCredits": 5,
  "tier": "premium",
  "monthlyAllocation": 5,
  "nextRefreshDate": "2025-03-01"
}
```

---

## 7a. Review Choice Workflow

### POST /api/review/choice
**Purpose**: Record user's review choice after submission  
**Request Body**:
```json
{
  "submissionId": "uuid",
  "submissionType": "exam" | "writing" | "speaking",
  "reviewType": "ai" | "human",
  "creditsRequired": 4 | 1
}
```
**Response** (AI Review):
```json
{
  "reviewId": "uuid",
  "reviewType": "ai",
  "status": "completed",
  "creditsUsed": 0,
  "feedback": {
    // AI-generated feedback
  }
}
```
**Response** (Human Review):
```json
{
  "reviewId": "uuid",
  "reviewType": "human",
  "status": "pending",
  "creditsUsed": 1,
  "creditsRemaining": 4,
  "estimatedCompletion": "24-48 hours",
  "verificationId": "uuid"
}
```

### GET /api/review/:reviewId
**Purpose**: Fetch review details and status  
**Response**:
```json
{
  "reviewId": "uuid",
  "reviewType": "human",
  "status": "completed" | "pending" | "in-progress",
  "submissionType": "writing",
  "creditsUsed": 1,
  "completedAt": "2025-03-01T14:30:00Z",
  "humanScore": 7.0,
  "aiScore": 7.5,
  "examinerFeedback": {
    "overallBand": 7.0,
    "criteria": {
      "taskAchievement": { score: 7.0, feedback: "..." },
      "coherenceCohesion": { score: 7.0, feedback: "..." },
      "lexicalResource": { score: 7.5, feedback: "..." },
      "grammaticalAccuracy": { score: 7.0, feedback: "..." }
    },
    "strengths": ["...", "..."],
    "improvements": ["...", "..."],
    "examinerNotes": "Overall strong essay with good vocabulary range..."
  }
}
```

---

## 8. AI Integration Layer

### Internal Service: AI Scoring Engine
**Technology Stack Options**:
- OpenAI GPT-4 API for writing assessment
- Whisper API for speech-to-text
- Custom fine-tuned model for IELTS-specific scoring

**Key Considerations**:
- Response time targets: <3 seconds for writing, <5 seconds for speaking
- Cost optimization: Use caching for similar essays
- Fallback mechanisms if AI service is down

---

## 9. Database Schema (High-Level)

### Users Table
- `id`, `email`, `password_hash`, `name`, `tier`, `target_band`, `streak`, `created_at`

### Submissions Table
- `id`, `user_id`, `type` (writing/speaking), `content`, `ai_score`, `human_score`, `feedback_json`, `created_at`

### Verifications Table
- `id`, `submission_id`, `examiner_id`, `status`, `human_score`, `feedback`, `completed_at`

### Community_Posts Table
- `id`, `user_id`, `submission_id`, `likes`, `saves`, `is_public`, `created_at`

### Weaknesses Table
- `id`, `user_id`, `skill_name`, `occurrence_count`, `last_seen`, `improvement_trend`

---

## 10. Security & Privacy

### Must-Haves
- JWT-based authentication with short-lived access tokens
- HTTPS only
- Rate limiting on all endpoints
- User data encryption at rest
- GDPR compliance (right to delete, data export)
- Audio/text submissions stored securely (S3 with encryption)

### Rate Limits
- Free tier: 3 writing submissions/month, 3 speaking/month
- Premium tier: 20 writing/month, 20 speaking/month
- Human verification: 5/month (premium only)

---

## 11. Third-Party Integrations

### Payment Processing
- **Stripe**: For subscription management
- Webhooks for subscription events

### AI Services
- **OpenAI API**: For essay scoring and feedback
- **Whisper API**: For speech-to-text transcription
- Consider: ElevenLabs for AI voice feedback

### Storage
- **AWS S3**: For audio file storage
- **CloudFront CDN**: For fast audio delivery

### Analytics
- **Mixpanel** or **Amplitude**: User behavior tracking
- **Sentry**: Error tracking

---

## 12. Performance Targets

- API response time: <200ms (excluding AI processing)
- AI scoring time: <3s for writing, <5s for speaking
- Uptime: 99.9%
- Database query time: <50ms average

---

## Notes for Future Updates
This document will be updated as new features are added to the app. Key areas to expand:
- Gamification backend (achievements, badges, leaderboards)
- Collaborative study groups
- Practice test marketplace
- AI tutor chat interface