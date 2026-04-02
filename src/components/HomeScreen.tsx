import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';
import { Play, Timer } from 'lucide-react';
import { AnalyticsCard } from './AnalyticsCard';
import { GamificationBadges } from './GamificationBadges';

interface HomeScreenProps {
  onStartSimulation?: () => void;
  onStartPractice?: (practiceType: 'grammar' | 'writing' | 'speaking') => void;
}

export function HomeScreen({ onStartSimulation, onStartPractice }: HomeScreenProps) {
  const currentScores = {
    Writing: 6.5,
    Speaking: 6.0,
    Reading: 7.0,
    Listening: 6.5,
  };

  const targetScores = {
    Writing: 7.5,
    Speaking: 7.5,
    Reading: 8.0,
    Listening: 7.5,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-[#4F46E5]">Hi, Alex</h2>
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
            style={{ boxShadow: '0px 4px 12px rgba(249, 115, 22, 0.3)' }}
          >
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-white">12 Day Streak</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 space-y-6">
        {/* Full Exam Simulation Card */}
        <div 
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            boxShadow: '0px 12px 32px rgba(30, 27, 75, 0.4)'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F46E5] rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#7C3AED] rounded-full opacity-20 blur-2xl"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/80 text-sm font-semibold">Test Day Protocol</span>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Full IELTS Simulation
              </h3>
              <p className="text-white/70 text-sm mb-1">
                Band 9 Protocol
              </p>
              <p className="text-white/60 text-sm">
                L • R • W • S | Strict Timing | No Pausing
              </p>
            </div>

            <button
              onClick={onStartSimulation}
              className="w-full bg-[#F43F5E] hover:bg-[#E11D48] text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 group"
              style={{ boxShadow: '0px 8px 24px rgba(244, 63, 94, 0.4)' }}
            >
              <span>Start Exam (2h 45m)</span>
              <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-white/50 text-xs text-center">
              ⚠️ This is a full-length exam simulation
            </p>
          </div>
        </div>

        {/* Action Card */}
        <Card glow={true}>
          <div className="space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-sm font-semibold">
              Your Adaptive Plan
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Fix Subject-Verb Agreement
              </h3>
              <p className="text-gray-600">
                Based on last Writing Task 2
              </p>
            </div>

            <PrimaryButton icon={Play} onClick={() => onStartPractice('grammar')}>
              Start Practice (5 min)
            </PrimaryButton>
          </div>
        </Card>

        {/* Analytics */}
        <AnalyticsCard 
          currentScores={currentScores}
          targetScores={targetScores}
        />

        {/* Gamification */}
        <GamificationBadges />
      </div>
    </div>
  );
}