import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';
import { Play } from 'lucide-react';
import { AnalyticsCard } from './AnalyticsCard';
import { GamificationBadges } from './GamificationBadges';

export function HomeScreen() {
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

            <PrimaryButton icon={Play}>
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
