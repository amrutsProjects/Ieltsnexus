import { useState } from 'react';
import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';
import { Lock, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

type UserTier = 'free' | 'premium';

interface SimulationResultsProps {
  userTier?: UserTier;
  onGoHome?: () => void;
}

export function SimulationResults({ userTier: initialTier = 'free', onGoHome }: SimulationResultsProps) {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<UserTier>(initialTier);

  const scores = {
    listening: 6.0,
    reading: 6.5,
    writing: 6.0,
    speaking: 7.0,
    overall: 6.5,
  };

  const radarData = [
    { skill: 'Listening', score: 6.0, fullMark: 9 },
    { skill: 'Reading', score: 6.5, fullMark: 9 },
    { skill: 'Writing', score: 6.0, fullMark: 9 },
    { skill: 'Speaking', score: 7.0, fullMark: 9 },
  ];

  const insights = [
    {
      id: 'writing',
      title: 'Writing Task 2 Analysis',
      preview: 'You overused transition words...',
      full: 'You overused transition words like "moreover" and "furthermore" without varying your cohesive devices. Consider using phrases like "in addition," "what\'s more," or restructuring sentences for better flow. Your grammatical range is strong, but subject-verb agreement errors appeared 3 times.',
    },
    {
      id: 'speaking',
      title: 'Speaking Fluency',
      preview: 'Excellent vocabulary range...',
      full: 'Excellent vocabulary range with strong use of idiomatic expressions. However, there were 5 instances of false starts and self-corrections that affected fluency. Practice recording yourself and aim for smoother delivery.',
    },
    {
      id: 'reading',
      title: 'Reading Speed',
      preview: 'Time management needs improvement...',
      full: 'Time management needs improvement - you spent 25 minutes on passage 1 (recommended: 20 min). This left only 10 minutes for passage 3. Practice skimming techniques and answer True/False/Not Given questions faster.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h2 className="text-3xl font-bold text-[#4F46E5] mb-2">Test Results</h2>
        <p className="text-gray-600">Full IELTS Simulation Report</p>
      </div>

      <div className="px-6 space-y-6">
        {/* Tier Preview Toggle */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-700">Preview as:</h3>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setUserTier('free')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  userTier === 'free'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-500'
                }`}
              >
                Free
              </button>
              <button
                onClick={() => setUserTier('premium')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  userTier === 'premium'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-500'
                }`}
              >
                Premium
              </button>
            </div>
          </div>
        </Card>

        {/* Overall Score */}
        <Card className="border-2 border-[#4F46E5]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Overall Band Score</div>
              <div className="text-5xl font-bold text-[#4F46E5]">{scores.overall}</div>
            </div>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#10B981] flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{scores.overall}</span>
            </div>
          </div>
        </Card>

        {/* Skill Breakdown */}
        <Card>
          <h3 className="font-bold text-lg text-gray-900 mb-4">Skill Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#EEF2FF] rounded-2xl p-4">
              <div className="text-sm text-[#4F46E5] mb-1">Listening</div>
              <div className="text-3xl font-bold text-[#4F46E5]">{scores.listening}</div>
            </div>
            <div className="bg-[#ECFDF5] rounded-2xl p-4">
              <div className="text-sm text-[#10B981] mb-1">Reading</div>
              <div className="text-3xl font-bold text-[#10B981]">{scores.reading}</div>
            </div>
            <div className="bg-[#FFF1F2] rounded-2xl p-4">
              <div className="text-sm text-[#F43F5E] mb-1">Writing</div>
              <div className="text-3xl font-bold text-[#F43F5E]">{scores.writing}</div>
            </div>
            <div className="bg-[#DBEAFE] rounded-2xl p-4">
              <div className="text-sm text-[#3B82F6] mb-1">Speaking</div>
              <div className="text-3xl font-bold text-[#3B82F6]">{scores.speaking}</div>
            </div>
          </div>
        </Card>

        {/* Free User: Locked Content */}
        {userTier === 'free' && (
          <div className="relative">
            <Card className="relative overflow-hidden">
              {/* Blurred Content */}
              <div className="filter blur-md pointer-events-none">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Detailed Mistake Analysis & AI Recommendations</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700">Sed do eiusmod tempor incididunt ut labore...</p>
                  </div>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-[#4F46E5] flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Premium</h3>
                <p className="text-gray-600 text-center mb-6 max-w-xs">
                  Get detailed insights, mistake analysis, and personalized recommendations
                </p>
                <PrimaryButton icon={Lock}>
                  Upgrade to Premium
                </PrimaryButton>
              </div>
            </Card>
          </div>
        )}

        {/* Premium User: Full Access */}
        {userTier === 'premium' && (
          <>
            {/* Radar Chart */}
            <Card>
              <h3 className="font-bold text-lg text-gray-900 mb-4">Skill Balance</h3>
              <div className="w-full" style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis 
                      dataKey="skill" 
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 9]} 
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#4F46E5"
                      fill="#4F46E5"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Detailed Insights */}
            <Card>
              <h3 className="font-bold text-lg text-gray-900 mb-4">Detailed Analysis</h3>
              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight.id}>
                    <button
                      onClick={() => setExpandedInsight(
                        expandedInsight === insight.id ? null : insight.id
                      )}
                      className="w-full flex items-center justify-between bg-[#F8FAFC] rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="text-left flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                        {expandedInsight !== insight.id && (
                          <p className="text-sm text-gray-600">{insight.preview}</p>
                        )}
                      </div>
                      {expandedInsight === insight.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 ml-2 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 ml-2 flex-shrink-0" />
                      )}
                    </button>
                    {expandedInsight === insight.id && (
                      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-2">
                        <p className="text-gray-700 leading-relaxed">{insight.full}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Save to Knowledge Graph */}
            <PrimaryButton icon={Save} className="w-full">
              Save to Knowledge Graph
            </PrimaryButton>
          </>
        )}

        {/* Return to Home Button */}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="w-full py-4 bg-[#4F46E5] text-white font-bold rounded-2xl hover:bg-[#4338CA] transition-colors"
          >
            Return to Home
          </button>
        )}
      </div>
    </div>
  );
}