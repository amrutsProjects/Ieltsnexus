import { useState } from 'react';
import { Card } from './Card';
import { Mic, X } from 'lucide-react';

export function SpeakingSimulation() {
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Speaking Test</h2>
          <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* AI Avatar */}
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            {/* Pulsing Rings */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-[#4F46E5] opacity-20 animate-ping" 
                     style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-0 rounded-full bg-[#4F46E5] opacity-20 animate-ping" 
                     style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
              </>
            )}
            
            {/* Orb Avatar */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#10B981] flex items-center justify-center shadow-2xl">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#818CF8] to-[#A78BFA] flex items-center justify-center">
                  {isListening ? (
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-8 bg-white rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-gray-700 font-medium">
            {isListening ? 'I\'m listening...' : 'Tap the microphone to start speaking'}
          </p>
        </div>

        {/* Current Question */}
        <Card>
          <div className="space-y-3">
            <div className="text-sm font-semibold text-[#4F46E5]">Part 2: Individual Long Turn</div>
            <p className="text-gray-900 leading-relaxed">
              Describe a time when you had to learn a new skill. You should say:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
              <li>What the skill was</li>
              <li>Why you needed to learn it</li>
              <li>How you learned it</li>
              <li>And explain how you felt about learning this skill</li>
            </ul>
          </div>
        </Card>

        {/* Waveform Analysis */}
        <Card>
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Audio Analysis</h3>
            
            {/* Waveform */}
            <div className="flex items-end gap-1 h-24 justify-center">
              {[...Array(40)].map((_, i) => {
                const heights = [30, 50, 70, 60, 40, 80, 60, 50, 40, 70, 90, 70, 50, 40, 60, 80, 70, 50, 40, 60, 70, 50, 40, 80, 60, 50, 70, 90, 70, 50, 40, 60, 50, 40, 70, 60, 50, 40, 60, 50];
                const isError = [5, 12, 23].includes(i);
                const isPeak = [10, 18, 27].includes(i);
                
                return (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all ${
                      isError ? 'bg-red-500' : isPeak ? 'bg-[#10B981]' : 'bg-[#4F46E5]'
                    }`}
                    style={{ height: `${heights[i]}%` }}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">Pronunciation Issue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[#10B981] rounded"></div>
                <span className="text-gray-600">Fluency Peak</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Activity Rings */}
        <Card>
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Performance Metrics</h3>
            
            <div className="space-y-4">
              {/* Fluency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Fluency</span>
                  <span className="text-lg font-bold text-[#3B82F6]">7.0</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full"
                    style={{ width: '77.8%' }}
                  ></div>
                </div>
              </div>

              {/* Pronunciation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Pronunciation</span>
                  <span className="text-lg font-bold text-[#8B5CF6]">6.5</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full"
                    style={{ width: '72.2%' }}
                  ></div>
                </div>
              </div>

              {/* Vocabulary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Vocabulary</span>
                  <span className="text-lg font-bold text-[#10B981]">7.5</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full"
                    style={{ width: '83.3%' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsListening(!isListening)}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-[#4F46E5] hover:bg-[#4338CA]'
          }`}
        >
          {isListening ? (
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
          ) : null}
          <Mic className="w-10 h-10 text-white relative z-10" />
        </button>
        <p className="text-center mt-2 text-sm font-semibold text-gray-600">
          {isListening ? 'Listening' : 'Tap to speak'}
        </p>
      </div>
    </div>
  );
}
