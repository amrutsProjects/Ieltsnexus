import { useState, useRef, useEffect } from 'react';
import { Card } from './Card';
import { Mic, X, ChevronRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import { ReviewChoiceModal } from './ReviewChoiceModal';
import { apiCall } from '../lib/api';

interface SpeakingSimulationProps {
  userTier?: 'free' | 'premium';
  availableCredits?: number;
  topicId?: string | null;
  topicName?: string | null;
  onBack?: () => void;
  onCreditUpdate?: () => void;
}

// ─── Dynamic Topic Questions ─────────────────────────────────────────
function getSpeakingQuestions(topicName: string | null): string[] {
  const name = (topicName || '').toLowerCase();

  if (name.includes('environment') || name.includes('climate')) {
    return [
      "Let's talk about the environment. What do you do to protect the environment in your daily life?",
      "How has the environment in your country changed over the last 10 years?",
      "Do you think public transport is important for reducing air pollution?",
      "In Part 2, describe a time you saw pollution or environmental damage. You should say where it was, what caused it, and how it made you feel.",
      "How can governments encourage companies to be more environmentally friendly?",
      "Do you believe that climate change can be stopped?",
    ];
  }
  if (name.includes('technology') || name.includes('tech')) {
    return [
      "Let's talk about technology. What devices do you use most often?",
      "How does technology help you in your daily work or studies?",
      "Is there any piece of technology you want to buy in the future?",
      "In Part 2, describe a time when a piece of equipment or technology failed you. You should say what the equipment was, when it happened, and how you solved the problem.",
      "Do you think people rely too much on technology today?",
      "How might artificial intelligence change the way we work in the future?",
    ];
  }
  if (name.includes('health') || name.includes('medicine')) {
    return [
      "Let's discuss health and fitness. How do you keep healthy?",
      "What are your favorite forms of exercise?",
      "Do you think people in your country are healthier now than in the past?",
      "In Part 2, describe a time when you were ill or had a minor injury. You should say what happened, how you were treated, and how long it took to recover.",
      "What can the government do to improve public health?",
      "Do you think fast food should have warning labels like cigarettes?",
    ];
  }
  if (name.includes('education') || name.includes('school')) {
    return [
      "Let's talk about education. Do you prefer studying online or in a classroom?",
      "What was your favorite subject in high school?",
      "Do you think the current education system in your country is effective?",
      "In Part 2, describe a teacher who had a great influence on you. You should say what they taught, how they taught, and why they were inspiring.",
      "Should university education be free for everyone?",
      "What are the advantages of studying abroad?",
    ];
  }

  // Fallback
  return [
    `Let's talk about ${topicName || 'your daily life'}. Can you tell me what you find most interesting about it?`,
    "How has this topic changed the way people live in recent years?",
    "Do you think children should learn about this in school?",
    `In Part 2, describe an experience you had related to ${topicName || 'something new you tried'}. You should say what happened, who was with you, and how you felt.`,
    "What are the biggest challenges society faces regarding this issue today?",
    "Looking forward, how do you see this topic evolving in the next decade?",
  ];
}

type ViewMode = 'test' | 'loading' | 'feedback';

interface AITranscript {
  question_index: number;
  transcript: string;
  duration_seconds: number;
}

interface AIInsight {
  category: 'strength' | 'warning' | 'improvement';
  title: string;
  detail: string;
}

interface AIFeedback {
  overall_score: number;
  fluency_coherence: number;
  pronunciation: number;
  lexical_resource: number;
  grammatical_range: number;
  transcripts: AITranscript[];
  filler_count: number;
  insights: AIInsight[];
  average_response_seconds: number;
}

export function SpeakingSimulation({
  userTier = 'free',
  availableCredits = 0,
  topicId = null,
  topicName = null,
  onBack,
  onCreditUpdate,
}: SpeakingSimulationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('test');
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);

  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const speakingQuestions = getSpeakingQuestions(topicName);

  // Initialize test on mount
  useEffect(() => {
    const startTest = async () => {
      try {
        const response = await apiCall('/speaking/start', {
          method: 'POST',
          body: JSON.stringify({ topic_id: topicId || 'general' })
        });
        setSubmissionId(response.submission_id);
      } catch (err: any) {
        console.error('Failed to start speaking test:', err);
        setError('Failed to initialize test. Make sure the backend is running.');
      }
    };
    startTest();
  }, [topicId]);

  // Audio Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlobs((prev) => {
          const newBlobs = [...prev];
          newBlobs[currentQuestion] = blob;
          return newBlobs;
        });

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());

        // SILENTLY UPLOAD CHUNK TO BACKEND
        if (submissionId) {
          try {
            const formData = new FormData();
            formData.append('audio', blob, `question_${currentQuestion}.webm`);
            formData.append('question_index', currentQuestion.toString());
            formData.append('question_text', speakingQuestions[currentQuestion]);

            await apiCall(`/speaking/${submissionId}/response`, {
              method: 'POST',
              body: formData,
            });
          } catch (err) {
            console.error('Failed to upload audio chunk:', err);
            // Don't interrupt flow, just log it
          }
        }

        // Automatically move to next question if not at the end
        if (currentQuestion < speakingQuestions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
        } else {
          setShowReviewModal(true);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setError('Microphone access is required for the speaking test. Please allow access in your browser.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSkipQuestion = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      if (currentQuestion < speakingQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowReviewModal(true);
      }
    }
  };

  const handleEndTestAbruptly = () => {
    if (isRecording) {
      handleStopRecording();
    }
    setShowSkipModal(true);
  };

  const handleConfirmSkip = () => {
    setShowSkipModal(false);
    setShowReviewModal(true);
  };

  const handleAIReview = async () => {
    setShowReviewModal(false);
    setViewMode('loading');
    setError(null);

    // Filter out undefined blobs if user skipped some questions
    const validBlobs = audioBlobs.filter((blob) => blob !== undefined);

    if (validBlobs.length === 0) {
      setViewMode('test');
      setError("You didn't record any audio. Please answer at least one question.");
      return;
    }

    if (!submissionId) {
      setViewMode('test');
      setError("Cannot review: Test was not properly initialized with the backend.");
      return;
    }

    try {
      // 3. Ask AI to review the aggregated submission
      const submission = await apiCall(`/speaking/${submissionId}/review/ai`, {
        method: 'POST',
      });

      setAiFeedback(submission.feedback);
      setViewMode('feedback');
      onCreditUpdate?.();
    } catch (err: any) {
      console.error('Speaking AI Review failed:', err);
      setError(err.message || 'Failed to analyze audio. The AI service may be temporarily unavailable.');
      setViewMode('test');
    }
  };

  const handleHumanReview = () => {
    setShowReviewModal(false);
    alert('Submitted for Human Verification! You will receive results in 24-48 hours.');
    onCreditUpdate?.();
  };

  // ─── Loading Screen ─────────────────────────────────────────────
  if (viewMode === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#10B981] animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <Mic className="w-8 h-8 text-[#4F46E5] animate-bounce" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Voice</h2>
            <p className="text-gray-600">Our AI examiner is transcribing your audio...</p>
          </div>
          <div className="space-y-2 max-w-xs mx-auto text-left pl-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>Audio uploaded successfully</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 border-2 border-[#4F46E5] rounded-full animate-pulse"></div>
              <span>Running Whisper Transcription...</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              <span>Evaluating Fluency & Pronunciation</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">Audio processing takes up to 30 seconds</p>
        </div>
      </div>
    );
  }

  // ─── Feedback Screen ─────────────────────────────────────────────
  if (viewMode === 'feedback' && aiFeedback) {
    const fb = aiFeedback;
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24">
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Feedback</h2>
            <button onClick={onBack} className="text-[#4F46E5] font-semibold flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>

          {/* Overall Score */}
          <Card className="border-2 border-[#4F46E5] mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Estimated Band Score</div>
                  <div className="text-4xl font-bold text-[#4F46E5]">{fb.overall_score}</div>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#10B981] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{fb.overall_score}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <div className="bg-[#EEF2FF] rounded-xl p-3">
                  <div className="text-xs text-[#3B82F6] font-semibold">Fluency</div>
                  <div className="text-xl font-bold text-[#3B82F6]">{fb.fluency_coherence}</div>
                </div>
                <div className="bg-[#F5F3FF] rounded-xl p-3">
                  <div className="text-xs text-[#8B5CF6] font-semibold">Pronunciation</div>
                  <div className="text-xl font-bold text-[#8B5CF6]">{fb.pronunciation}</div>
                </div>
                <div className="bg-[#ECFDF5] rounded-xl p-3">
                  <div className="text-xs text-[#10B981] font-semibold">Lexical</div>
                  <div className="text-xl font-bold text-[#10B981]">{fb.lexical_resource}</div>
                </div>
                <div className="bg-[#FEF3C7] rounded-xl p-3">
                  <div className="text-xs text-[#F59E0B] font-semibold">Grammar</div>
                  <div className="text-xl font-bold text-[#F59E0B]">{fb.grammatical_range}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Delivery Metrics */}
          <Card className="mb-6 border-l-4 border-purple-500">
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-purple-500" />
                Delivery Metrics
              </h4>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Hesitations & Pauses</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {fb.filler_count} <span className="text-sm font-normal text-gray-500">pauses</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {fb.filler_count > 5 ? 'Try to use silent pauses instead of filler words.' : 'Good use of natural pauses.'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Pacing</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {fb.average_response_seconds?.toFixed(1) || '0.0'} <span className="text-sm font-normal text-gray-500">avg sec/answer</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {(fb.average_response_seconds || 0) < 15 ? 'Try expanding your answers with more details.' : 'Good response length and pacing.'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 col-span-2">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Estimated Confidence Level</div>
                    <div className="font-bold text-[#4F46E5]">{Math.round((fb.fluency_coherence / 9.0) * 100)}%</div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-[#4F46E5] to-[#10B981] h-2.5 rounded-full"
                      style={{ width: `${Math.round((fb.fluency_coherence / 9.0) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Insights */}
          <Card className="mb-6">
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="text-xl">💡</span> Key Insights
              </h4>

              <div className="space-y-3">
                {fb.insights && fb.insights.map((insight, i) => {
                  const isStrength = insight.category === 'strength';
                  const isWarning = insight.category === 'warning';

                  return (
                    <div key={`insight-${i}`} className={`p-3 rounded-lg border-l-4 ${isStrength ? 'bg-[#ECFDF5] border-[#10B981]' :
                      isWarning ? 'bg-[#FEF3C7] border-[#F59E0B]' :
                        'bg-[#FFF1F2] border-[#F43F5E]'
                      }`}>
                      <p className="text-sm text-gray-700">
                        <span className={`font-semibold ${isStrength ? 'text-[#10B981]' :
                          isWarning ? 'text-[#F59E0B]' :
                            'text-[#F43F5E]'
                          }`}>
                          {isStrength ? '✓ ' : isWarning ? '⚠ ' : '⚡ '}
                          {insight.title}:
                        </span>{' '}
                        {insight.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Test Screen ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} disabled={isRecording} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {topicName || 'Speaking Test'}
            </h2>
            <p className="text-sm text-[#4F46E5] font-semibold">
              Question {currentQuestion + 1} of {speakingQuestions.length}
            </p>
          </div>
        </div>
        <button
          onClick={handleEndTestAbruptly}
          className="text-xs text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded border border-red-200"
        >
          End Test
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1.5">
        <div
          className="bg-[#4F46E5] h-1.5 transition-all duration-300"
          style={{ width: `${(currentQuestion / speakingQuestions.length) * 100}%` }}
        ></div>
      </div>

      <div className="px-6 pt-6 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* AI Avatar & Recording Indication */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
              </>
            )}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#10B981] flex items-center justify-center shadow-2xl">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#818CF8] to-[#A78BFA] flex items-center justify-center">
                  {isRecording ? (
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-2 h-8 bg-white rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
          {isRecording && (
            <div className="mt-4 flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 rounded-full">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-red-600">Recording...</span>
            </div>
          )}
        </div>

        {/* Current Question */}
        <Card className="border-2 border-[#4F46E5]">
          <div className="space-y-6">
            <div className="p-6 bg-[#EEF2FF] rounded-xl border border-[#4F46E5]/30 min-h-[120px] flex items-center justify-center text-center">
              <p className="text-gray-900 text-lg leading-relaxed font-medium">
                {speakingQuestions[currentQuestion]}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => isRecording ? handleStopRecording() : handleStartRecording()}
                className={`w-full py-4 rounded-2xl font-bold transition-all shadow-md ${isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
                  }`}
              >
                {isRecording ? 'Stop Answering & Next' : 'Record Answer'}
              </button>

              <button
                onClick={handleSkipQuestion}
                disabled={isRecording}
                className="w-full py-3 rounded-2xl font-semibold border-2 border-gray-200 text-gray-500 disabled:opacity-50"
              >
                Skip Question
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              💡 {isRecording ? "Click when finished responding" : "Speak naturally - aim for 20-30 seconds per response"}
            </p>
          </div>
        </Card>
      </div>

      {/* Skip/End Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">End Test Early?</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to end the test abruptly and skip the remaining questions?
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSkipModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSkip}
                  className="flex-1 py-3 bg-[#4F46E5] text-white font-semibold rounded-xl"
                >
                  End & Score
                </button>
              </div>
            </div>
          </Card>
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