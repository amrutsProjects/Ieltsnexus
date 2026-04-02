import { useState } from 'react';
import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';
import { ChevronRight, Target, Briefcase, GraduationCap, Globe, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { apiCall } from '../lib/api';

interface AuthScreenProps {
  onAuthComplete: (userData: UserProfile) => void;
}

export interface UserProfile {
  name: string;
  email: string;
  goalScore: number;
  examReason: string;
  weaknesses: string[];
  currentLevel: string;
  targetDate: string;
}

type AuthMode = 'landing' | 'login' | 'signup';
type SignupStep = 1 | 2 | 3 | 4;

export function AuthScreen({ onAuthComplete }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('landing');
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goalScore, setGoalScore] = useState<number>(7.0);
  const [examReason, setExamReason] = useState('');
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const examReasons = [
    { id: 'university', label: 'Foreign University', icon: GraduationCap },
    { id: 'job', label: 'Foreign Job', icon: Briefcase },
    { id: 'immigration', label: 'Immigration/PR', icon: Globe },
    { id: 'professional', label: 'Professional Registration', icon: Target },
  ];

  const commonWeaknesses = [
    'Grammar & Sentence Structure',
    'Vocabulary Range',
    'Speaking Fluency',
    'Pronunciation',
    'Writing Task 1 (Charts/Graphs)',
    'Writing Task 2 (Essays)',
    'Reading Speed',
    'Listening Comprehension',
    'Time Management',
    'Coherence & Cohesion',
  ];

  const currentLevels = [
    { value: 'beginner', label: 'Beginner (Band 4.0-5.0)', description: 'Just starting IELTS prep' },
    { value: 'intermediate', label: 'Intermediate (Band 5.5-6.5)', description: 'Some practice done' },
    { value: 'advanced', label: 'Advanced (Band 7.0+)', description: 'Experienced test-taker' },
  ];

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      // Get profile to pass to app
      const { profile } = await apiCall('/profile');
      
      const userProfile: UserProfile = {
        name: profile.name || 'User',
        email: loginEmail,
        goalScore: profile.goal_score || 7.0,
        examReason: profile.exam_reason || 'university',
        weaknesses: [], 
        currentLevel: profile.current_level || 'intermediate',
        targetDate: profile.target_date || '',
      };
      
      onAuthComplete(userProfile);
    } catch (err: any) {
      alert(err.message || 'Login failed Check your credentials.');
    }
  };

  const handleSignupComplete = async () => {
    if (!name || !email || !password) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) throw error;

      // Create profile via our backend
      await apiCall('/auth/complete-profile', {
        method: 'POST',
        body: JSON.stringify({
          name,
          goal_score: goalScore,
          exam_reason: examReason,
          weaknesses,
          current_level: currentLevel,
          target_date: targetDate,
        })
      });
      
      const userProfile: UserProfile = {
        name,
        email,
        goalScore,
        examReason,
        weaknesses,
        currentLevel,
        targetDate,
      };
      
      onAuthComplete(userProfile);
    } catch (err: any) {
      alert(err.message || 'Signup failed');
    }
  };

  const toggleWeakness = (weakness: string) => {
    if (weaknesses.includes(weakness)) {
      setWeaknesses(weaknesses.filter(w => w !== weakness));
    } else {
      setWeaknesses([...weaknesses, weakness]);
    }
  };

  const canProceedStep2 = name && email && password;
  const canProceedStep3 = goalScore && examReason;
  const canProceedStep4 = weaknesses.length > 0;

  if (authMode === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#10B981] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo & Title */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-white flex items-center justify-center shadow-2xl"
            >
              <span className="text-5xl font-bold bg-gradient-to-br from-[#4F46E5] to-[#10B981] bg-clip-text text-transparent">IN</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-white mb-3"
            >
              IELTS Nexus
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-lg"
            >
              AI-Powered Practice.<br />Human-Verified Results.
            </motion.p>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3 mb-8"
          >
            {[
              '🎯 Personalized Learning Path',
              '⚡ Instant AI Feedback',
              '✅ Human Expert Verification',
              '📊 Real-Time Progress Tracking',
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 text-white font-medium"
              >
                {feature}
              </motion.div>
            ))}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-3"
          >
            <button
              onClick={() => setAuthMode('signup')}
              className="w-full bg-white text-[#4F46E5] font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              Get Started Free
            </button>
            
            <button
              onClick={() => setAuthMode('login')}
              className="w-full bg-white/10 backdrop-blur-sm text-white font-bold py-4 rounded-2xl border-2 border-white/30 hover:bg-white/20 transition-all"
            >
              Already have an account? Log In
            </button>
          </motion.div>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
          >
            <p className="text-white/80 text-xs text-center mb-2">Demo Credentials:</p>
            <p className="text-white text-xs text-center font-mono">demo@ielts.com / demo123</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (authMode === 'login') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <button
            onClick={() => setAuthMode('landing')}
            className="mb-6 text-[#4F46E5] font-semibold flex items-center gap-2"
          >
            ← Back
          </button>

          <Card>
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                <p className="text-gray-600">Log in to continue your IELTS journey</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="demo@ielts.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#4F46E5] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="demo123"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#4F46E5] outline-none transition-colors"
                  />
                </div>
              </div>

              <PrimaryButton
                icon={ChevronRight}
                onClick={handleLogin}
                className="w-full"
              >
                Log In
              </PrimaryButton>

              <div className="text-center">
                <button
                  onClick={() => setAuthMode('signup')}
                  className="text-[#4F46E5] font-semibold text-sm"
                >
                  Don't have an account? Sign Up
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Signup flow with multiple steps
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-6">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              if (signupStep === 1) {
                setAuthMode('landing');
              } else {
                setSignupStep((signupStep - 1) as SignupStep);
              }
            }}
            className="text-[#4F46E5] font-semibold"
          >
            ← Back
          </button>
          <span className="text-sm text-gray-600">Step {signupStep} of 4</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#4F46E5] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(signupStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="px-6 pt-6">
        {/* Step 1: Basic Info */}
        {signupStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-5xl mb-4 block">👋</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's get started!</h2>
                  <p className="text-gray-600">Tell us a bit about yourself</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Johnson"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#4F46E5] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@email.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#4F46E5] outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#4F46E5] outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setSignupStep(2)}
                  disabled={!canProceedStep2}
                  className={`w-full py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                    canProceedStep2 
                      ? 'bg-[#4F46E5] hover:bg-[#4338CA]' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Goals */}
        {signupStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-5xl mb-4 block">🎯</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your goal?</h2>
                  <p className="text-gray-600">Let's personalize your experience</p>
                </div>

                {/* Goal Score */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Target Band Score</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((score) => (
                      <button
                        key={score}
                        onClick={() => setGoalScore(score)}
                        className={`py-3 rounded-xl font-bold transition-all ${
                          goalScore === score
                            ? 'bg-[#4F46E5] text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exam Reason */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Why are you taking IELTS?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {examReasons.map((reason) => {
                      const Icon = reason.icon;
                      return (
                        <button
                          key={reason.id}
                          onClick={() => setExamReason(reason.id)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            examReason === reason.id
                              ? 'border-[#4F46E5] bg-[#EEF2FF]'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${
                            examReason === reason.id ? 'text-[#4F46E5]' : 'text-gray-600'
                          }`} />
                          <p className={`text-sm font-semibold ${
                            examReason === reason.id ? 'text-[#4F46E5]' : 'text-gray-700'
                          }`}>
                            {reason.label}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setSignupStep(3)}
                  disabled={!canProceedStep3}
                  className={`w-full py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                    canProceedStep3
                      ? 'bg-[#4F46E5] hover:bg-[#4338CA]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Weaknesses */}
        {signupStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-5xl mb-4 block">💪</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">What areas need work?</h2>
                  <p className="text-gray-600">Select all that apply - be honest!</p>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {commonWeaknesses.map((weakness) => (
                    <button
                      key={weakness}
                      onClick={() => toggleWeakness(weakness)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                        weaknesses.includes(weakness)
                          ? 'border-[#4F46E5] bg-[#EEF2FF]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${
                        weaknesses.includes(weakness)
                          ? 'border-[#4F46E5] bg-[#4F46E5]'
                          : 'border-gray-300'
                      }`}>
                        {weaknesses.includes(weakness) && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className={`font-semibold ${
                        weaknesses.includes(weakness) ? 'text-[#4F46E5]' : 'text-gray-700'
                      }`}>
                        {weakness}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="text-center text-sm text-gray-600">
                  {weaknesses.length} area{weaknesses.length !== 1 ? 's' : ''} selected
                </div>

                <button
                  onClick={() => setSignupStep(4)}
                  disabled={weaknesses.length === 0}
                  className={`w-full py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                    weaknesses.length > 0
                      ? 'bg-[#4F46E5] hover:bg-[#4338CA]'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Experience Level & Target Date */}
        {signupStep === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-5xl mb-4 block">🚀</span>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost done!</h2>
                  <p className="text-gray-600">Just a couple more details</p>
                </div>

                {/* Current Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Current Level</label>
                  <div className="space-y-3">
                    {currentLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setCurrentLevel(level.value)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          currentLevel === level.value
                            ? 'border-[#4F46E5] bg-[#EEF2FF]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`font-bold mb-1 ${
                          currentLevel === level.value ? 'text-[#4F46E5]' : 'text-gray-900'
                        }`}>
                          {level.label}
                        </div>
                        <div className="text-sm text-gray-600">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Date (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Exam Date (Optional)</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#4F46E5] outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={handleSignupComplete}
                  disabled={!currentLevel}
                  className={`w-full py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                    currentLevel
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#10B981] hover:shadow-lg'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span>Start Your Journey!</span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}