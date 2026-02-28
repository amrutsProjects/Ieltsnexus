import { useState, useEffect } from 'react';
import { Card } from './Card';
import { X, ChevronRight, Mic, Play, Pause } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ExamSimulationProps {
  onEndExam: () => void;
}

type ExamPhase = 'listening' | 'reading' | 'writing' | 'speaking';

const speakingQuestions = [
  "Let's talk about where you live. Do you live in a house or an apartment?",
  "What do you like most about your neighborhood?",
  "How long have you been living in your current home?",
  "Would you like to move to a different area in the future?",
  "Now let's discuss hobbies. What do you enjoy doing in your free time?",
  "How often do you practice your hobbies?",
  "Have your hobbies changed since you were a child?",
  "Do you think hobbies are important? Why?",
  "Let's move on to food. What is your favorite type of cuisine?",
  "Do you prefer eating at home or in restaurants?",
];

export function ExamSimulation({ onEndExam }: ExamSimulationProps) {
  const [currentPhase, setCurrentPhase] = useState<ExamPhase>('listening');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingQuestionIndex, setSpeakingQuestionIndex] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [writingTask, setWritingTask] = useState<1 | 2>(1);

  const phaseConfig = {
    listening: { title: 'Listening - Section 1', totalQuestions: 10, duration: 1800 },
    reading: { title: 'Reading - Passage 1', totalQuestions: 10, duration: 1800 },
    writing: { title: 'Writing - Task 1', totalQuestions: 2, duration: 3600 },
    speaking: { title: 'Speaking - Part 1', totalQuestions: 10, duration: 600 },
  };

  const config = phaseConfig[currentPhase];

  // Chart data for writing task
  const chartData = [
    { year: '2015', students: 120 },
    { year: '2016', students: 145 },
    { year: '2017', students: 165 },
    { year: '2018', students: 190 },
    { year: '2019', students: 210 },
    { year: '2020', students: 185 },
  ];

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextSection = () => {
    const phases: ExamPhase[] = ['listening', 'reading', 'writing', 'speaking'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      setCurrentPhase(phases[currentIndex + 1]);
      setCurrentQuestion(1);
      setTimeLeft(phaseConfig[phases[currentIndex + 1]].duration);
      setSpeakingQuestionIndex(0);
    }
  };

  const handleEndExam = () => {
    setShowEndModal(false);
    onEndExam();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Move to next speaking question
    if (speakingQuestionIndex < speakingQuestions.length - 1) {
      setTimeout(() => {
        setSpeakingQuestionIndex(speakingQuestionIndex + 1);
        setCurrentQuestion(currentQuestion + 1);
      }, 500);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Universal HUD - Top Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Section Title */}
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{config.title}</h3>
          </div>

          {/* Countdown Timer */}
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
              <span className="font-mono font-bold text-red-600">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Question Counter */}
          <div className="flex-1 flex justify-end">
            <span className="font-semibold text-gray-700">
              Question {currentQuestion} of {config.totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 py-8 pb-32">
        {/* Phase 1: Listening */}
        {currentPhase === 'listening' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="border-2 border-[#4F46E5]">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Section 1</h2>
                  <p className="text-gray-600">
                    You will hear a conversation between a student and a university administrator.
                  </p>
                </div>

                {/* Audio Player */}
                <div className="bg-[#EEF2FF] rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      disabled
                      className="w-12 h-12 rounded-full bg-[#4F46E5]/50 flex items-center justify-center cursor-not-allowed"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-1" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="h-2 bg-white rounded-full overflow-hidden">
                        <div className="h-full bg-[#4F46E5]" style={{ width: '35%' }}></div>
                      </div>
                    </div>
                    <span className="text-gray-700 font-mono text-sm">02:15 / 06:30</span>
                  </div>
                  <p className="text-xs text-gray-600 text-center">
                    ⚠️ Audio controls disabled - mimics real test conditions
                  </p>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900">Questions 1-10</h3>
                  <p className="text-gray-700 mb-4">
                    Choose the correct letter, A, B, or C.
                  </p>

                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <div key={num} className="space-y-2">
                      <p className="text-gray-900 font-semibold">
                        {num}. What is the student's main reason for visiting?
                      </p>
                      <div className="space-y-2 ml-4">
                        {['To register for courses', 'To collect documents', 'To request information'].map((option, i) => (
                          <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#EEF2FF] cursor-pointer transition-colors border border-gray-200">
                            <input
                              type="radio"
                              name={`q${num}`}
                              className="w-4 h-4 accent-[#4F46E5]"
                            />
                            <span className="text-gray-700">{String.fromCharCode(65 + i)}. {option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Phase 2: Reading */}
        {currentPhase === 'reading' && (
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Mobile: Stacked Layout */}
            <div className="space-y-4">
              {/* Passage */}
              <Card className="border-2 border-[#10B981]">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Passage 1</h2>
                <h3 className="text-xl font-semibold text-[#10B981] mb-4">The History of Writing</h3>
                
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>
                    Writing is one of humanity's greatest inventions, enabling the preservation and transmission of knowledge across generations. The earliest known writing systems emerged independently in several ancient civilizations.
                  </p>
                  <p>
                    Mesopotamian cuneiform, dating back to around 3400 BCE, is considered one of the oldest forms of writing. It began as a series of pictographs used for record-keeping in the Sumerian city of Uruk. Over time, these symbols evolved into a more abstract script written with a wedge-shaped stylus on clay tablets.
                  </p>
                  <p>
                    Egyptian hieroglyphs developed around 3200 BCE and were used for religious texts and monumental inscriptions. Unlike cuneiform, hieroglyphs maintained their pictorial nature throughout their usage, though they also developed phonetic components.
                  </p>
                  <p>
                    The Chinese writing system emerged around 1200 BCE during the Shang Dynasty. Oracle bone inscriptions reveal a sophisticated system that has evolved continuously to the present day, making Chinese one of the world's oldest continuously used writing systems.
                  </p>
                  <p>
                    The alphabet, as we know it today, has its roots in the Phoenician script developed around 1050 BCE. This system was revolutionary because it used symbols to represent individual sounds rather than entire words or syllables, making writing more accessible and efficient.
                  </p>
                </div>
              </Card>

              {/* Questions */}
              <Card className="border-2 border-[#10B981]">
                <h3 className="font-bold text-gray-900 text-xl mb-4">Questions 1-10</h3>
                <p className="text-gray-700 mb-6">
                  Do the following statements agree with the information in the passage?
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Write TRUE, FALSE, or NOT GIVEN
                </p>

                <div className="space-y-6">
                  {[
                    'Cuneiform was primarily used for literary purposes.',
                    'Egyptian hieroglyphs remained pictorial throughout their history.',
                    'Chinese writing originated during the Shang Dynasty.',
                    'The Phoenician alphabet made writing more accessible.',
                    'All ancient civilizations developed writing at the same time.',
                    'Oracle bones were used for religious ceremonies.',
                    'Cuneiform used a wedge-shaped stylus on clay tablets.',
                    'The Phoenician script represents entire words.',
                    'Writing systems emerged independently in different civilizations.',
                    'Hieroglyphs had no phonetic components.',
                  ].map((statement, i) => (
                    <div key={i} className="space-y-2">
                      <p className="text-gray-900 font-semibold">{i + 1}. {statement}</p>
                      <div className="flex gap-3 ml-4">
                        {['TRUE', 'FALSE', 'NOT GIVEN'].map((answer) => (
                          <label key={answer} className="flex items-center gap-2 cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-[#ECFDF5] transition-colors">
                            <input
                              type="radio"
                              name={`reading-q${i + 1}`}
                              className="w-4 h-4 accent-[#10B981]"
                            />
                            <span className="text-sm text-gray-700 font-medium">{answer}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Phase 3: Writing */}
        {currentPhase === 'writing' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Task Navigation Tabs */}
            <div className="flex gap-3">
              <button
                onClick={() => setWritingTask(1)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  writingTask === 1
                    ? 'bg-[#F43F5E] text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Task 1: Report
              </button>
              <button
                onClick={() => setWritingTask(2)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                  writingTask === 2
                    ? 'bg-[#F43F5E] text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Task 2: Essay
              </button>
            </div>

            {/* Task 1: Chart Description */}
            {writingTask === 1 && (
              <Card className="border-2 border-[#F43F5E]">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Writing Task 1</h2>
                    <p className="text-gray-600">
                      You should spend about 20 minutes on this task. Write at least 150 words.
                    </p>
                  </div>

                  {/* Task Prompt */}
                  <div className="p-4 bg-[#FFF1F2] rounded-xl border border-[#F43F5E]/30">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      The chart below shows the number of international students enrolled at universities in three countries between 2015 and 2020.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Summarize the information by selecting and reporting the main features, and make comparisons where relevant.
                    </p>
                  </div>

                  {/* Chart */}
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                    <h4 className="font-bold text-gray-900 mb-4 text-center">
                      International Student Enrollment (in thousands)
                    </h4>
                    <div className="w-full" style={{ height: '250px' }}>
                      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="year" 
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                          />
                          <YAxis 
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            label={{ value: 'Students (thousands)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 12 } }}
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
                    <span className={`font-bold ${wordCount >= 150 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                      {wordCount} / 150 minimum
                    </span>
                  </div>

                  {/* Editor */}
                  <textarea
                    onChange={handleTextChange}
                    className="w-full min-h-[300px] p-4 bg-white text-gray-900 rounded-xl border-2 border-gray-300 outline-none focus:border-[#F43F5E] transition-colors resize-none text-sm leading-relaxed"
                    placeholder="Begin writing your response here..."
                  />

                  <p className="text-xs text-gray-500">
                    ⚠️ No AI hints available during exam mode
                  </p>
                </div>
              </Card>
            )}

            {/* Task 2: Essay */}
            {writingTask === 2 && (
              <Card className="border-2 border-[#F43F5E]">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Writing Task 2</h2>
                    <p className="text-gray-600">
                      You should spend about 40 minutes on this task. Write at least 250 words.
                    </p>
                  </div>

                  {/* Task Prompt */}
                  <div className="p-4 bg-[#FFF1F2] rounded-xl border border-[#F43F5E]/30">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      <span className="font-bold">Topic:</span> Some people believe that technology has made our lives more complex. Others think it has simplified daily tasks and improved our quality of life.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Discuss both views and give your own opinion.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Give reasons for your answer and include any relevant examples from your own knowledge or experience.
                    </p>
                  </div>

                  {/* Word Count */}
                  <div className="flex items-center justify-between text-sm px-2">
                    <span className="text-gray-600">Word Count:</span>
                    <span className={`font-bold ${wordCount >= 250 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                      {wordCount} / 250 minimum
                    </span>
                  </div>

                  {/* Editor */}
                  <textarea
                    onChange={handleTextChange}
                    className="w-full min-h-[400px] p-4 bg-white text-gray-900 rounded-xl border-2 border-gray-300 outline-none focus:border-[#F43F5E] transition-colors resize-none text-sm leading-relaxed"
                    placeholder="Begin writing your essay here..."
                  />

                  <p className="text-xs text-gray-500">
                    ⚠️ No AI hints available during exam mode
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Phase 4: Speaking */}
        {currentPhase === 'speaking' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* AI Avatar - Larger */}
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                {/* Recording indicator rings */}
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping" 
                         style={{ animationDuration: '2s' }}></div>
                    <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping" 
                         style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                  </>
                )}
                
                {/* Orb Avatar - Larger */}
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#10B981] flex items-center justify-center shadow-2xl">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#818CF8] to-[#A78BFA] flex items-center justify-center">
                      {isRecording ? (
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-3 h-10 bg-white rounded-full animate-pulse"
                              style={{ animationDelay: `${i * 0.2}s` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Mic className="w-16 h-16 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Status */}
              {isRecording && (
                <div className="mt-6 flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 rounded-full">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-red-600">Recording...</span>
                </div>
              )}
            </div>

            {/* Question Card */}
            <Card className="border-2 border-[#4F46E5]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 rounded-full bg-[#4F46E5] text-white text-sm font-semibold">
                    Part 1: Introduction
                  </div>
                  <span className="text-gray-600 text-sm">Question {speakingQuestionIndex + 1} of {config.totalQuestions}</span>
                </div>

                <div className="p-6 bg-[#EEF2FF] rounded-xl border border-[#4F46E5]/30">
                  <p className="text-gray-900 text-lg leading-relaxed">
                    {speakingQuestions[speakingQuestionIndex]}
                  </p>
                </div>

                <div className="flex items-center justify-center">
                  <button
                    onClick={() => isRecording ? handleStopRecording() : setIsRecording(true)}
                    className={`px-8 py-4 rounded-2xl font-bold transition-all ${
                      isRecording 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
                    }`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  ⚠️ Speak naturally - you have 45 seconds to respond
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-20 shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* End Exam Button */}
          <button
            onClick={() => setShowEndModal(true)}
            className="px-6 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors border border-red-200"
          >
            End Exam
          </button>

          {/* Skip to Next Section */}
          <button
            onClick={() => setShowSkipModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white font-bold rounded-xl hover:bg-[#4338CA] transition-colors shadow-md"
          >
            <span>Skip to Next Section</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* End Exam Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <Card className="max-w-md w-full bg-white">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">End Exam?</h3>
                <button
                  onClick={() => setShowEndModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <p className="text-gray-700 leading-relaxed">
                Are you sure you want to end the exam? Your progress will be submitted and you cannot return to this test.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Continue Test
                </button>
                <button
                  onClick={handleEndExam}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                >
                  End & Submit
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Skip Section Confirmation Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <Card className="max-w-md w-full bg-white">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Skip Section?</h3>
                <button
                  onClick={() => setShowSkipModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <p className="text-gray-700 leading-relaxed">
                Are you sure you want to skip to the next section? Your progress in the current section will be saved.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Stay in Section
                </button>
                <button
                  onClick={() => {
                    setShowSkipModal(false);
                    handleNextSection();
                  }}
                  className="flex-1 px-6 py-3 bg-[#4F46E5] text-white font-bold rounded-xl hover:bg-[#4338CA] transition-colors"
                >
                  Skip & Continue
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}