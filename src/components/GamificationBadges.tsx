import { Card } from './Card';
import { Award, Lock } from 'lucide-react';

interface Badge {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  color: string;
}

export function GamificationBadges() {
  const badges: Badge[] = [
    { id: '1', title: 'Grammar Guru', icon: '📝', unlocked: true, color: 'from-yellow-400 to-yellow-600' },
    { id: '2', title: '7-Day Streak', icon: '🔥', unlocked: true, color: 'from-orange-400 to-red-500' },
    { id: '3', title: 'Speaking Star', icon: '🎤', unlocked: false, color: 'from-purple-400 to-purple-600' },
    { id: '4', title: 'Reading Pro', icon: '📚', unlocked: false, color: 'from-blue-400 to-blue-600' },
    { id: '5', title: 'Perfect Score', icon: '🏆', unlocked: false, color: 'from-green-400 to-green-600' },
  ];

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">Achievements</h3>
          <Award className="w-5 h-5 text-[#4F46E5]" />
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 relative transition-all ${
                badge.unlocked
                  ? `bg-gradient-to-br ${badge.color} shadow-lg`
                  : 'bg-gray-100 grayscale opacity-60'
              }`}
            >
              {!badge.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                  <Lock className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-2xl">{badge.icon}</span>
              <span className={`text-[10px] font-bold text-center px-1 ${
                badge.unlocked ? 'text-white' : 'text-gray-400'
              }`}>
                {badge.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
