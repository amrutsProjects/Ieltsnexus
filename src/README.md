# IELTS Nexus

An AI-powered IELTS preparation platform that solves the "AI Trust Deficit" by distinguishing between AI-estimated scores (fast/iterative) and human-verified scores (premium/trust).

## Demo Credentials

To quickly test the app, use these demo credentials:

- **Email**: `demo@ielts.com`
- **Password**: `demo123`

## Key Features

### 🔐 User Authentication & Onboarding
- **Landing Screen**: Engaging welcome experience with feature highlights
- **Login**: Secure authentication with demo credentials
- **Signup Flow**: 4-step personalized onboarding
  1. Basic Info (name, email, password)
  2. Goals (target band score, exam reason)
  3. Weaknesses (select areas needing improvement)
  4. Experience Level & Target Date

The signup process collects:
- Goal Score (6.0 - 9.0)
- Exam Reason (University, Job, Immigration, Professional Registration)
- Weaknesses (Grammar, Vocabulary, Speaking, Pronunciation, etc.)
- Current Level (Beginner, Intermediate, Advanced)
- Target Exam Date (optional)

### 📝 Writing Module
- Two-task structure (Task 1: Report, Task 2: Essay)
- Real-time word counting
- Minimum word requirements (150 for Task 1, 250 for Task 2)
- Submit button enabled only when both tasks meet requirements
- AI feedback with grammar highlighting
- Review choice modal (AI vs Human verification)

### 🎙️ Speaking Simulation
- 10-question interview format
- 3D animated orb avatar
- Progress tracking
- Submit button appears when all questions are answered
- **AI Analysis shown AFTER submission** (not during test)
- Real-time waveform visualization
- Performance metrics breakdown
- Key insights with strengths and improvements

### 🏠 Command Center (Home)
- Radar chart analytics
- Progress tracking
- Full exam simulation
- Gamification elements (streaks, badges)

### 👥 Community
- User-generated content
- Filter by trending, band score, verified status
- Like, save, and comment on posts

### 👤 Profile
- Tier management (Free/Premium)
- Credit tracking
- Weakness analysis
- Human verification options

## Technical Stack

- **React** with TypeScript
- **Tailwind CSS v4** for styling
- **Motion** (Framer Motion) for animations
- **Recharts** for data visualization
- **Lucide React** for icons

## Mobile-First Design

Optimized for **iPhone 15 Pro** (393px width) with:
- Glassmorphic bottom navigation
- Brand colors: Electric Indigo (#4F46E5), Mint Green (#10B981), Coral Salmon (#F43F5E)
- Inter typography
- Soft rounded containers (16px-24px radii)
- Ultra-soft shadows

## Color Strategy

- **Indigo/Mint**: AI-estimated scores (fast, iterative)
- **Coral/Salmon**: Human-verified scores (premium, trust)

## Getting Started

1. The app starts with the authentication screen
2. Use demo credentials or sign up with the onboarding flow
3. Complete the personalized setup (goals, weaknesses, level)
4. Access all features from the bottom navigation

## API Integration

See `/backend.md` for complete API documentation including:
- Enhanced registration endpoint with onboarding data
- User profile management
- Review submission workflows
- Human verification system
- Analytics and progress tracking

## Future Enhancements

- Backend API integration for live AI scoring
- Real audio recording and speech-to-text
- Payment integration (Stripe)
- Advanced gamification features
- Collaborative study groups
