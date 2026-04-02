import { useState } from 'react';
import { Card } from './Card';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';
import { Lock } from 'lucide-react';
import { ReviewChoiceModal } from './ReviewChoiceModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ViewMode = 'editor' | 'feedback';

interface WritingModuleProps {
  userTier?: 'free' | 'premium';
  availableCredits?: number;
}

export function WritingModule({ userTier = 'free', availableCredits = 0 }: WritingModuleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [showPrompt, setShowPrompt] = useState(false);
  const [timeLeft] = useState(3600); // 60 minutes in seconds
  const [wordCount, setWordCount] = useState(0);
  const [task1WordCount, setTask1WordCount] = useState(0);
  const [task2WordCount, setTask2WordCount] = useState(0);
  const [writingTask, setWritingTask] = useState<1 | 2>(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>, taskNum: 1 | 2) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const count = text.trim() === '' ? 0 : words.length;
    
    if (taskNum === 1) {
      setTask1Text(text);
      setTask1WordCount(count);
    } else {
      setTask2Text(text);
      setTask2WordCount(count);
    }
  };

  const handleSubmit = () => {
    setShowReviewModal(true);
  };

  const handleAIReview = () => {
    setShowReviewModal(false);
    setViewMode('feedback');
  };

  const handleHumanReview = () => {
    setShowReviewModal(false);
    // TODO: Submit for human review
    alert('Submitted for Human Verification! You will receive results in 24-48 hours.');
  };

  const chartData = [
    { year: '2015', students: 120 },
    { year: '2016', students: 145 },
    { year: '2017', students: 165 },
    { year: '2018', students: 190 },
    { year: '2019', students: 210 },
    { year: '2020', students: 185 },
  ];

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

  const canSubmit = task1WordCount >= 150 && task2WordCount >= 250;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Writing Practice</h2>
            <p className="text-sm text-gray-600">Complete both tasks</p>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Task Navigation Tabs */}
      <div className="px-6 pt-6">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setWritingTask(1)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              writingTask === 1
                ? 'bg-[#F43F5E] text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div>Task 1: Report</div>
              <div className="text-xs mt-1 opacity-80">
                {task1WordCount}/150 words
              </div>
            </div>
          </button>
          <button
            onClick={() => setWritingTask(2)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              writingTask === 2
                ? 'bg-[#F43F5E] text-white shadow-md'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div>Task 2: Essay</div>
              <div className="text-xs mt-1 opacity-80">
                {task2WordCount}/250 words
              </div>
            </div>
          </button>
        </div>

        {/* Task 1: Chart Description */}
        {writingTask === 1 && (
          <Card className="border-2 border-[#F43F5E]">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Writing Task 1</h3>
                <p className="text-gray-600 text-sm">
                  You should spend about 20 minutes on this task. Write at least 150 words.
                </p>
              </div>

              {/* Task Prompt */}
              <div className="p-4 bg-[#FFF1F2] rounded-xl border border-[#F43F5E]/30">
                <p className="text-gray-700 leading-relaxed text-sm mb-3">
                  The chart below shows the number of international students enrolled at universities in three countries between 2015 and 2020.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Summarize the information by selecting and reporting the main features, and make comparisons where relevant.
                </p>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <h4 className="font-bold text-gray-900 mb-4 text-center text-sm">
                  International Student Enrollment (in thousands)
                </h4>
                <div className="w-full" style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                      />
                      <Bar dataKey="students" fill="#F43F5E" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Word Count */}
              <div className="flex items-center justify-between text-sm px-2">
                <span className="text-gray-600">Word Count:</span>
                <span className={`font-bold ${task1WordCount >= 150 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                  {task1WordCount} / 150 minimum
                </span>
              </div>

              {/* Editor */}
              <textarea
                value={task1Text}
                onChange={(e) => handleTextChange(e, 1)}
                className="w-full min-h-[300px] p-4 bg-white text-gray-900 rounded-xl border-2 border-gray-300 outline-none focus:border-[#F43F5E] transition-colors resize-none text-sm leading-relaxed"
                placeholder="Begin writing your response here..."
              />
            </div>
          </Card>
        )}

        {/* Task 2: Essay */}
        {writingTask === 2 && (
          <Card className="border-2 border-[#F43F5E]">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Writing Task 2</h3>
                <p className="text-gray-600 text-sm">
                  You should spend about 40 minutes on this task. Write at least 250 words.
                </p>
              </div>

              {/* Task Prompt */}
              <div className="p-4 bg-[#FFF1F2] rounded-xl border border-[#F43F5E]/30">
                <p className="text-gray-700 leading-relaxed text-sm mb-3">
                  <span className="font-bold">Topic:</span> Climate change is one of the most pressing issues of our time. Some people believe that individual actions can make a significant difference, while others think that only government policies can address the problem.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm mb-3">
                  Discuss both views and give your own opinion.
                </p>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Give reasons for your answer and include any relevant examples from your own knowledge or experience.
                </p>
              </div>

              {/* Word Count */}
              <div className="flex items-center justify-between text-sm px-2">
                <span className="text-gray-600">Word Count:</span>
                <span className={`font-bold ${task2WordCount >= 250 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                  {task2WordCount} / 250 minimum
                </span>
              </div>

              {/* Editor */}
              <textarea
                value={task2Text}
                onChange={(e) => handleTextChange(e, 2)}
                className="w-full min-h-[400px] p-4 bg-white text-gray-900 rounded-xl border-2 border-gray-300 outline-none focus:border-[#F43F5E] transition-colors resize-none text-sm leading-relaxed"
                placeholder="Begin writing your essay here..."
              />
            </div>
          </Card>
        )}
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="fixed bottom-20 left-0 right-0 px-6 z-20">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all text-sm ${
              canSubmit
                ? 'bg-[#F43F5E] hover:bg-[#E11D48]'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {canSubmit ? 'Submit for Review' : 'Complete Tasks to Submit'}
          </button>
          {!canSubmit && (
            <p className="text-center text-xs text-gray-600 mt-2">
              Task 1: {task1WordCount >= 150 ? '✓' : '✗'} 150+ • Task 2: {task2WordCount >= 250 ? '✓' : '✗'} 250+
            </p>
          )}
        </div>
      </div>

      {/* Review Choice Modal */}
      {showReviewModal && (
        <ReviewChoiceModal
          onClose={() => setShowReviewModal(false)}
          onSelectAI={handleAIReview}
          onSelectHuman={handleHumanReview}
          creditsRequired={1}
          availableCredits={availableCredits}
          userTier={userTier}
          type="writing"
        />
      )}
    </div>
  );
}