import { Card } from './Card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Line, LineChart, ResponsiveContainer } from 'recharts';

interface AnalyticsCardProps {
  currentScores: {
    Writing: number;
    Speaking: number;
    Reading: number;
    Listening: number;
  };
  targetScores: {
    Writing: number;
    Speaking: number;
    Reading: number;
    Listening: number;
  };
}

export function AnalyticsCard({ currentScores, targetScores }: AnalyticsCardProps) {
  const radarData = [
    { subject: 'Writing', current: currentScores.Writing, target: targetScores.Writing },
    { subject: 'Speaking', current: currentScores.Speaking, target: targetScores.Speaking },
    { subject: 'Reading', current: currentScores.Reading, target: targetScores.Reading },
    { subject: 'Listening', current: currentScores.Listening, target: targetScores.Listening },
  ];

  const sparklineData = [
    { score: 6.0 },
    { score: 6.2 },
    { score: 6.5 },
    { score: 6.8 },
    { score: 7.0 },
    { score: 7.2 },
    { score: 7.5 },
  ];

  return (
    <Card>
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-gray-900">Your Progress</h3>
        
        {/* Radar Chart */}
        <div className="h-64 -mx-2 w-full" style={{ minHeight: '256px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 9]} 
                tick={{ fill: '#9CA3AF', fontSize: 10 }}
              />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#4F46E5"
                fill="#4F46E5"
                fillOpacity={0.5}
                strokeWidth={2}
              />
              <Radar
                name="Target"
                dataKey="target"
                stroke="#10B981"
                fill="none"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4F46E5]"></div>
            <span className="text-gray-600 font-medium">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-[#10B981] rounded-full border-dashed"></div>
            <span className="text-gray-600 font-medium">Target</span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-end justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Projected Score</span>
            <span className="text-2xl font-bold text-[#4F46E5]">7.5</span>
          </div>
          <div className="h-16 w-full" style={{ minHeight: '64px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>6.0</span>
            <span className="text-[#10B981] font-semibold">↑ 1.5 points</span>
          </div>
        </div>
      </div>
    </Card>
  );
}