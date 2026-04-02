import { useState } from 'react';
import { Card } from './Card';
import { Mic, X, ChevronRight } from 'lucide-react';
import { ReviewChoiceModal } from './ReviewChoiceModal';

interface SpeakingSimulationProps {
  userTier?: 'free' | 'premium';
  availableCredits?: number;
}

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

export function SpeakingSimulation({ userTier = 'free', availableCredits = 0 }: SpeakingSimulationProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  const handleStopRecording = () => {
    setIsRecording(false);
    // Mark question as answered
    if (!answeredQuestions.includes(currentQuestion)) {
      setAnsweredQuestions([...answeredQuestions, currentQuestion]);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < speakingQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setShowReviewModal(true);
  };

  const handleAIReview = () => {
    setShowReviewModal(false);
    setShowAnalysis(true);
    setTestCompleted(true);
  };

  const handleHumanReview = () => {
    setShowReviewModal(false);
    setTestCompleted(true);
    alert('Submitted for Human Verification! You will receive results in 24-48 hours.');
  };

  const allQuestionsAnswered = answeredQuestions.length === speakingQuestions.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Speaking Test</h2>
            <p className="text-sm text-gray-600">Part 1: Introduction & Interview</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-xl font-bold text-[#4F46E5]">
              {answeredQuestions.length}/{speakingQuestions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#4F46E5] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredQuestions.length / speakingQuestions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-6">
        {/* AI Avatar */}
        <div className="flex flex-col items-center justify-center py-8">
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
            
            {/* Orb Avatar */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#10B981] flex items-center justify-center shadow-2xl">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#818CF8] to-[#A78BFA] flex items-center justify-center">
                  {isRecording ? (
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

          {/* Recording Status */}
          {isRecording && (
            <div className="mt-4 flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 rounded-full">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-red-600">Recording...</span>
            </div>
          )}
        </div>

        {/* Current Question */}
        <Card className="border-2 border-[#4F46E5]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="px-3 py-1 rounded-full bg-[#4F46E5] text-white text-sm font-semibold">
                Question {currentQuestion + 1} of {speakingQuestions.length}
              </div>
              {answeredQuestions.includes(currentQuestion) && (
                <span className="text-[#10B981] text-sm font-semibold flex items-center gap-1">
                  <span className="text-lg">✓</span> Answered
                </span>
              )}
            </div>

            <div className="p-6 bg-[#EEF2FF] rounded-xl border border-[#4F46E5]/30">
              <p className="text-gray-900 text-lg leading-relaxed">
                {speakingQuestions[currentQuestion]}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
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
              💡 Speak naturally - aim for 20-30 seconds per response
            </p>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-colors ${
                  currentQuestion === 0
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-[#4F46E5] text-[#4F46E5] hover:bg-[#EEF2FF]'
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestion === speakingQuestions.length - 1}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  currentQuestion === speakingQuestions.length - 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                }`}
              >
                Next Question
              </button>
            </div>
          </div>
        </Card>

        {/* Enhanced AI Analysis Section */}
        {showAnalysis && answeredQuestions.length > 0 && (
          <>
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-lg text-gray-900">Real-Time AI Analysis</h3>
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="text-[#4F46E5] text-sm font-semibold"
              >
                {showAnalysis ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Waveform Analysis */}
            <Card>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900">Audio Waveform</h4>
                  <span className="text-xs text-gray-500">Last Response</span>
                </div>
                
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
                    <div className="w-3 h-3 bg-[#4F46E5] rounded"></div>
                    <span className="text-gray-600">Normal Speech</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-gray-600">Hesitation</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[#10B981] rounded"></div>
                    <span className="text-gray-600">Fluency Peak</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Performance Metrics</h4>
                
                <div className="space-y-4">
                  {/* Fluency & Coherence */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Fluency & Coherence</span>
                      <span className="text-lg font-bold text-[#3B82F6]">7.0</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-full"
                        style={{ width: '77.8%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Good flow with minimal hesitation
                    </p>
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
                    <p className="text-xs text-gray-600 mt-1">
                      Clear speech, work on "th" sounds
                    </p>
                  </div>

                  {/* Lexical Resource */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Lexical Resource</span>
                      <span className="text-lg font-bold text-[#10B981]">7.5</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full"
                        style={{ width: '83.3%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Excellent use of varied vocabulary
                    </p>
                  </div>

                  {/* Grammatical Range */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">Grammatical Range</span>
                      <span className="text-lg font-bold text-[#F59E0B]">6.5</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-full"
                        style={{ width: '72.2%' }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Good variety, some complex structures
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Key Insights */}
            <Card className="border-2 border-[#10B981]">
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Key Insights
                </h4>
                
                <div className="space-y-3">
                  <div className="p-3 bg-[#ECFDF5] rounded-lg border-l-4 border-[#10B981]">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-[#10B981]">✓ Strength:</span> You're using excellent transitional phrases like "on the other hand" and "in addition to that"
                    </p>
                  </div>
                  
                  <div className="p-3 bg-[#FEF3C7] rounded-lg border-l-4 border-[#F59E0B]">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-[#F59E0B]">⚠ Watch Out:</span> You said "um" or "uh" 8 times. Try pausing silently instead
                    </p>
                  </div>
                  
                  <div className="p-3 bg-[#FFF1F2] rounded-lg border-l-4 border-[#F43F5E]">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-[#F43F5E]">⚡ Improve:</span> Practice the "th" sound in words like "think," "through," and "although"
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Submit Button - Fixed at bottom */}
      {allQuestionsAnswered && (
        <div className="fixed bottom-20 left-0 right-0 px-6 z-20">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-2xl font-bold text-white shadow-lg bg-[#10B981] hover:bg-[#059669] transition-all flex items-center justify-center gap-2"
            >
              <span>Submit for Review</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Review Choice Modal */}
      {showReviewModal && (
        <ReviewChoiceModal
          onClose={() => setShowReviewModal(false)}
          onSelectAI={handleAIReview}
          onSelectHuman={handleHumanReview}
          creditsRequired={1}
          availableCredits={availableCredits}
          userTier={userTier}
          type="speaking"
        />
      )}
    </div>
  );
}