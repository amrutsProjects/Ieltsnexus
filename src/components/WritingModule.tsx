import { useState } from 'react';
import { Card } from './Card';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';
import { Lock } from 'lucide-react';

type ViewMode = 'editor' | 'feedback';

export function WritingModule() {
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [showPrompt, setShowPrompt] = useState(false);
  const [timeLeft] = useState(2340); // 39 minutes in seconds
  const [wordCount] = useState(142);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sampleEssay = `Climate change is one of the most pressing issues facing our world today. Many people believes that individual actions can make a difference in addressing this problem.

Firstly, reducing personal carbon footprint through lifestyle changes is essential. People can use public transportation instead of private vehicles. This help to decrease emissions significantly.

Moreover, governments should implement stricter environmental policies. They needs to invest in renewable energy sources and promote sustainable practices across industries.

In conclusion, both individuals and governments have important roles to play in combating climate change through coordinated efforts.`;

  if (viewMode === 'feedback') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24">
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Feedback</h2>
            <button 
              onClick={() => setViewMode('editor')}
              className="text-[#4F46E5] font-semibold"
            >
              Back to Editor
            </button>
          </div>

          {/* Document with highlights */}
          <Card>
            <div className="space-y-4 font-mono text-sm leading-relaxed">
              <p>
                Climate change is one of the most pressing issues facing our world today. Many people{' '}
                <span className="relative inline-block">
                  <span className="border-b-2 border-red-500">believes</span>
                  <span className="absolute left-0 -bottom-8 bg-red-50 border border-red-200 rounded-lg px-2 py-1 text-xs whitespace-nowrap z-10 shadow-lg">
                    ❌ Correction: believe not believes
                  </span>
                </span>
                {' '}that individual actions can make a difference in addressing this problem.
              </p>

              <p className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                <span className="block text-yellow-800 font-semibold mb-1">⚠️ Cohesion Issue</span>
                Firstly, reducing personal carbon footprint through lifestyle changes is essential.{' '}
                <span className="text-yellow-700 font-semibold">Consider adding a linking phrase here.</span>
              </p>

              <p>
                People can use public transportation instead of private vehicles. This{' '}
                <span className="border-b-2 border-red-500 relative inline-block">
                  help
                  <span className="absolute left-0 -bottom-8 bg-red-50 border border-red-200 rounded-lg px-2 py-1 text-xs whitespace-nowrap z-10 shadow-lg">
                    ❌ Correction: helps
                  </span>
                </span>
                {' '}to decrease emissions{' '}
                <span className="bg-green-200 px-1 rounded">significantly</span>.
              </p>

              <p>
                Moreover, governments should{' '}
                <span className="bg-green-200 px-1 rounded">implement</span>
                {' '}stricter environmental policies. They{' '}
                <span className="border-b-2 border-red-500 relative inline-block">
                  needs
                  <span className="absolute left-0 -bottom-8 bg-red-50 border border-red-200 rounded-lg px-2 py-1 text-xs whitespace-nowrap z-10 shadow-lg">
                    ❌ Correction: need
                  </span>
                </span>
                {' '}to invest in renewable energy sources.
              </p>

              <p>
                In conclusion, both individuals and governments have important roles to play in combating climate change through{' '}
                <span className="bg-green-200 px-1 rounded">coordinated</span>
                {' '}efforts.
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600">Grammar Error</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-50 border-l-2 border-yellow-400 rounded"></div>
                <span className="text-xs text-gray-600">Cohesion</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <span className="text-xs text-gray-600">Advanced Vocab</span>
              </div>
            </div>
          </Card>

          {/* AI Score & Upsell */}
          <div className="mt-6">
            <Card className="border-2 border-[#F43F5E]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">AI Estimated Score</div>
                    <div className="text-4xl font-bold text-[#4F46E5]">6.5</div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#10B981] flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">6.5</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-gray-700 mb-4">
                    <span className="font-semibold text-[#F43F5E]">Not sure?</span> Get a Human Expert to verify your score for maximum accuracy.
                  </p>
                  <PrimaryButton 
                    variant="gradient" 
                    icon={Lock}
                    className="w-full"
                  >
                    Verify for $9.99
                  </PrimaryButton>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={() => setViewMode('feedback')}
            className="px-4 py-2 bg-[#4F46E5] text-white rounded-full text-sm font-semibold"
          >
            Get Feedback
          </button>
        </div>

        {/* Collapsible Prompt */}
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-semibold text-gray-700">
            {showPrompt ? 'Hide' : 'Show'} Task 2 Prompt
          </span>
          {showPrompt ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {showPrompt && (
          <div className="mt-3 p-4 bg-[#EEF2FF] rounded-lg">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold">Task 2:</span> Climate change is one of the most pressing issues of our time. Some people believe that individual actions can make a significant difference, while others think that only government policies can address the problem. Discuss both views and give your opinion.
            </p>
          </div>
        )}
      </div>

      {/* Editor Canvas */}
      <div className="px-6 pt-6">
        <Card>
          {/* Toolbar */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <div className="text-sm">
              <span className="text-gray-600">Word Count: </span>
              <span className={`font-bold ${wordCount >= 250 ? 'text-[#10B981]' : 'text-gray-900'}`}>
                {wordCount}/250
              </span>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <span className="font-bold text-gray-600">B</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <span className="italic text-gray-600">I</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <span className="underline text-gray-600">U</span>
              </button>
            </div>
          </div>

          {/* Editor */}
          <textarea
            className="w-full min-h-[400px] text-base leading-relaxed text-gray-900 resize-none outline-none font-mono"
            placeholder="Start writing your essay here..."
            defaultValue={sampleEssay}
          />
        </Card>
      </div>
    </div>
  );
}
