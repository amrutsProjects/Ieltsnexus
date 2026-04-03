import { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { X, ChevronRight, Mic, Play, Pause, AlertTriangle, Volume2, SkipForward, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ReviewChoiceModal } from './ReviewChoiceModal';
import { apiCall } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ListeningQuestion {
  number: number;
  type: string;
  text: string;
  options: string[] | null;
  instruction: string | null;
}

interface ListeningSection {
  section_number: number;
  audio_url: string;
  questions: ListeningQuestion[];
}

interface ReadingQuestion {
  number: number;
  type: string;
  text: string;
  options: string[] | null;
  instruction: string | null;
}

interface ReadingPassage {
  passage_number: number;
  title: string;
  text: string;
  questions: ReadingQuestion[];
}

interface ExamSimulationProps {
  onEndExam: (results: any) => void;
  userTier?: 'free' | 'premium';
  availableCredits?: number;
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

// ─── Component ────────────────────────────────────────────────────────────────
export function ExamSimulation({ onEndExam, userTier = 'free', availableCredits = 0 }: ExamSimulationProps) {
  const [examId, setExamId] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<ExamPhase>('listening');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [examLoading, setExamLoading] = useState(true);

  // ─── Listening State ──────────────────────────────────────────────────────
  const [listeningSections, setListeningSections] = useState<ListeningSection[]>([]);
  const [currentListeningSection, setCurrentListeningSection] = useState(0);
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, string>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Reading State ────────────────────────────────────────────────────────
  const [readingPassages, setReadingPassages] = useState<ReadingPassage[]>([]);
  const [currentReadingPassage, setCurrentReadingPassage] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState<Record<number, string>>({});

  // ─── Writing State ────────────────────────────────────────────────────────
  const [writingTask, setWritingTask] = useState<1 | 2>(1);
  const [task1Text, setTask1Text] = useState("");
  const [task2Text, setTask2Text] = useState("");
  const wordCount1 = task1Text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const wordCount2 = task2Text.trim().split(/\s+/).filter((w) => w.length > 0).length;

  // ─── Speaking State ───────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [speakingQuestionIndex, setSpeakingQuestionIndex] = useState(0);
  const [speakingSubmissionId, setSpeakingSubmissionId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Chart data for writing task
  const chartData = [
    { year: '2015', students: 120 },
    { year: '2016', students: 145 },
    { year: '2017', students: 165 },
    { year: '2018', students: 190 },
    { year: '2019', students: 210 },
    { year: '2020', students: 185 },
  ];

  // ─── Derived Values ───────────────────────────────────────────────────────
  const activeSection = listeningSections[currentListeningSection];
  const activePassage = readingPassages[currentReadingPassage];

  const sectionQuestions = activeSection?.questions || [];
  const passageQuestions = activePassage?.questions || [];

  const allSectionQsAnswered = sectionQuestions.length > 0 && sectionQuestions.every(
    q => listeningAnswers[q.number] !== undefined && listeningAnswers[q.number] !== ''
  );
  const allPassageQsAnswered = passageQuestions.length > 0 && passageQuestions.every(
    q => readingAnswers[q.number] !== undefined && readingAnswers[q.number] !== ''
  );

  const isLastListeningSection = currentListeningSection >= listeningSections.length - 1;
  const isLastReadingPassage = currentReadingPassage >= readingPassages.length - 1;

  const phaseConfig = {
    listening: {
      title: `Listening - Section ${currentListeningSection + 1}`,
      totalQuestions: listeningSections.reduce((sum, s) => sum + s.questions.length, 0) || 40,
      duration: 1800,
    },
    reading: {
      title: `Reading - Passage ${currentReadingPassage + 1}`,
      totalQuestions: readingPassages.reduce((sum, p) => sum + p.questions.length, 0) || 26,
      duration: 3600,
    },
    writing: { title: 'Writing', totalQuestions: 2, duration: 3600 },
    speaking: { title: 'Speaking - Part 1', totalQuestions: 10, duration: 600 },
  };

  const config = phaseConfig[currentPhase];

  // ─── Initialize Exam ─────────────────────────────────────────────────────
  useEffect(() => {
    const startExam = async () => {
      setExamLoading(true);
      try {
        const response = await apiCall('/exam/start', { method: 'POST' });
        setExamId(response.exam_id);
        if (response.listening?.sections) {
          setListeningSections(response.listening.sections);
        }
      } catch (err) {
        console.error('Failed to start exam:', err);
      } finally {
        setExamLoading(false);
      }
    };
    startExam();
  }, []);

  // ─── Fetch Reading Data on Phase Transition ───────────────────────────────
  useEffect(() => {
    if (currentPhase === 'reading' && examId && readingPassages.length === 0) {
      apiCall(`/exam/${examId}/reading`)
        .then(res => {
          if (res.passages) setReadingPassages(res.passages);
        })
        .catch(err => console.error('Failed to fetch reading data:', err));
    }
  }, [currentPhase, examId]);

  // ─── Speaking Sub-session ─────────────────────────────────────────────────
  useEffect(() => {
    if (currentPhase === 'speaking' && !speakingSubmissionId) {
      apiCall('/speaking/start', {
        method: 'POST',
        body: JSON.stringify({ topic_id: 'technology' })
      })
        .then(res => setSpeakingSubmissionId(res.submission_id))
        .catch(err => console.error('Failed to initialize speaking sub-session:', err));
    }
  }, [currentPhase, speakingSubmissionId]);

  // ─── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Cleanup Recorder on Unmount ──────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // ─── Audio Player Handlers ────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioProgress(audioRef.current.currentTime);
    }
  };

  const handleAudioLoaded = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const formatAudioTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Section Navigation (within Listening / Reading) ──────────────────────
  const handleNextSubSection = () => {
    if (currentPhase === 'listening') {
      if (isLastListeningSection) {
        // All listening sections done → submit & move to reading
        handleNextPhase();
      } else {
        setCurrentListeningSection(prev => prev + 1);
        setIsPlaying(false);
        setAudioProgress(0);
        setAudioDuration(0);
      }
    } else if (currentPhase === 'reading') {
      if (isLastReadingPassage) {
        // All reading passages done → submit & move to writing
        handleNextPhase();
      } else {
        setCurrentReadingPassage(prev => prev + 1);
      }
    }
  };

  const handleSkipSubSection = () => {
    if (currentPhase === 'listening') {
      if (isLastListeningSection) {
        handleNextPhase();
      } else {
        setCurrentListeningSection(prev => prev + 1);
        setIsPlaying(false);
        setAudioProgress(0);
        setAudioDuration(0);
      }
    } else if (currentPhase === 'reading') {
      if (isLastReadingPassage) {
        handleNextPhase();
      } else {
        setCurrentReadingPassage(prev => prev + 1);
      }
    }
  };

  // ─── Phase-Level Navigation ───────────────────────────────────────────────
  const handleNextPhase = async () => {
    try {
      if (currentPhase === 'listening' && examId) {
        const answers = Object.entries(listeningAnswers).map(([num, val]) => ({
          question_number: parseInt(num), selected_answer: val
        }));
        await apiCall(`/exam/${examId}/listening/submit`, {
          method: 'POST', body: JSON.stringify({ answers })
        }).catch(err => console.warn('Listening submit skipped:', err.message));
      } else if (currentPhase === 'reading' && examId) {
        const answers = Object.entries(readingAnswers).map(([num, val]) => ({
          question_number: parseInt(num), selected_answer: val
        }));
        await apiCall(`/exam/${examId}/reading/submit`, {
          method: 'POST', body: JSON.stringify({ answers })
        }).catch(err => console.warn('Reading submit skipped:', err.message));
      } else if (currentPhase === 'writing' && examId) {
        await apiCall('/writing/submit', {
          method: 'POST',
          body: JSON.stringify({
            topic_id: 'technology',
            task1_prompt: 'The chart below shows the number of international students enrolled at universities in three countries between 2015 and 2020.',
            task2_prompt: 'Some people believe that technology has made our lives more complex. Others think it has simplified daily tasks and improved our quality of life. Discuss both views and give your own opinion.',
            task1_text: task1Text,
            task2_text: task2Text,
            task1_word_count: wordCount1,
            task2_word_count: wordCount2,
            time_spent_seconds: 3600 - timeLeft
          })
        });
      }
    } catch (err) {
      console.error(`Failed to submit phase ${currentPhase}:`, err);
    }

    // Transition to next phase
    const phases: ExamPhase[] = ['listening', 'reading', 'writing', 'speaking'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];
      setCurrentPhase(nextPhase);
      setCurrentQuestion(1);
      setTimeLeft(phaseConfig[nextPhase].duration);
      setSpeakingQuestionIndex(0);
      setIsPlaying(false);
    }
  };

  const handleEndExam = () => {
    setShowEndModal(false);
    setShowReviewModal(true);
  };

  const handleAIReview = async () => {
    setShowReviewModal(false);
    if (speakingSubmissionId) {
      try {
        await apiCall(`/speaking/${speakingSubmissionId}/review/ai`, { method: 'POST' });
      } catch (err) {
        console.warn('Speaking AI review skipped:', err);
      }
    }
    try {
      if (examId) {
        const response = await apiCall(`/exam/${examId}/complete`, { method: 'POST' });
        console.log('Exam Completed & Graded:', response.results);
        onEndExam(response.results);
        return;
      }
    } catch (error) {
      console.warn('Exam complete endpoint not available:', error);
    }
    onEndExam(null);
  };

  const handleHumanReview = () => {
    setShowReviewModal(false);
    alert('Submitted for Human Verification! You will receive results in 24-48 hours.');
    onEndExam(null);
  };

  // ─── Speaking Recording ───────────────────────────────────────────────────
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        if (examId && speakingSubmissionId) {
          try {
            const formData = new FormData();
            formData.append('audio', blob, `question_${speakingQuestionIndex}.webm`);
            formData.append('question_index', speakingQuestionIndex.toString());
            formData.append('question_text', speakingQuestions[speakingQuestionIndex]);
            await apiCall(`/speaking/${speakingSubmissionId}/response`, {
              method: 'POST',
              body: formData,
            });
          } catch (err) {
            console.error('Failed to upload exam audio chunk:', err);
          }
        }

        if (speakingQuestionIndex < speakingQuestions.length - 1) {
          setSpeakingQuestionIndex(prev => prev + 1);
          setCurrentQuestion(prev => prev + 1);
        } else {
          setShowEndModal(true);
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to access microphone", err);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // ─── Question Rendering Helpers ───────────────────────────────────────────
  const renderMCQ = (q: ListeningQuestion | ReadingQuestion, answers: Record<number, string>, setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>, accentColor: string) => {
    const options = q.options || [];
    return (
      <div key={q.number} className="space-y-2">
        <p className="text-gray-900 font-semibold">{q.number}. {q.text}</p>
        <div className="space-y-2 ml-4">
          {options.map((option, i) => {
            // Handle both "A. text" and plain "text" formats
            const letter = option.match(/^([A-Z])\.?\s/) ? option.match(/^([A-Z])/)![1] : String.fromCharCode(65 + i);
            return (
              <label key={i} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${answers[q.number] === letter ? `border-2 bg-opacity-10` : 'border-gray-200 hover:bg-gray-50'}`}
                style={answers[q.number] === letter ? { borderColor: accentColor, backgroundColor: `${accentColor}10` } : {}}>
                <input
                  type="radio"
                  name={`q-${q.number}`}
                  checked={answers[q.number] === letter}
                  onChange={() => setAnswers(prev => ({ ...prev, [q.number]: letter }))}
                  className="w-4 h-4"
                  style={{ accentColor }}
                />
                <span className="text-gray-700">{option}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFillBlank = (q: ListeningQuestion | ReadingQuestion, answers: Record<number, string>, setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>, accentColor: string) => {
    return (
      <div key={q.number} className="space-y-2">
        <p className="text-gray-900 font-semibold">{q.number}. {q.text}</p>
        <input
          type="text"
          value={answers[q.number] || ''}
          onChange={e => setAnswers(prev => ({ ...prev, [q.number]: e.target.value }))}
          className="w-full p-3 rounded-lg border-2 border-gray-300 outline-none transition-colors text-gray-900 ml-4"
          style={{ maxWidth: '400px' }}
          onFocus={e => e.target.style.borderColor = accentColor}
          onBlur={e => e.target.style.borderColor = '#D1D5DB'}
          placeholder="Type your answer..."
        />
      </div>
    );
  };

  const renderTrueFalseNG = (q: ReadingQuestion, answers: Record<number, string>, setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>, accentColor: string) => {
    return (
      <div key={q.number} className="space-y-2">
        <p className="text-gray-900 font-semibold">{q.number}. {q.text}</p>
        <div className="flex gap-3 ml-4 flex-wrap">
          {['True', 'False', 'Not Given'].map(answer => (
            <label key={answer} className={`flex items-center gap-2 cursor-pointer px-4 py-2 border rounded-lg transition-colors ${answers[q.number] === answer ? 'border-2 font-semibold' : 'border-gray-300 hover:bg-gray-50'}`}
              style={answers[q.number] === answer ? { borderColor: accentColor, backgroundColor: `${accentColor}10` } : {}}>
              <input
                type="radio"
                name={`q-${q.number}`}
                checked={answers[q.number] === answer}
                onChange={() => setAnswers(prev => ({ ...prev, [q.number]: answer }))}
                className="w-4 h-4"
                style={{ accentColor }}
              />
              <span className="text-sm text-gray-700">{answer}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderParagraphMatch = (q: ReadingQuestion, answers: Record<number, string>, setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>, accentColor: string) => {
    const letters = q.options || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return (
      <div key={q.number} className="space-y-2">
        <p className="text-gray-900 font-semibold">{q.number}. {q.text}</p>
        <div className="flex gap-2 ml-4 flex-wrap">
          {letters.map(letter => (
            <button key={letter}
              onClick={() => setAnswers(prev => ({ ...prev, [q.number]: letter }))}
              className={`w-10 h-10 rounded-lg font-bold text-sm border-2 transition-all ${answers[q.number] === letter ? 'text-white shadow-md' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              style={answers[q.number] === letter ? { backgroundColor: accentColor, borderColor: accentColor } : {}}>
              {letter}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderQuestion = (q: ListeningQuestion | ReadingQuestion, answers: Record<number, string>, setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>, accentColor: string) => {
    const type = q.type?.toLowerCase() || 'mcq';
    if (type === 'mcq') return renderMCQ(q, answers, setAnswers, accentColor);
    if (type === 'true_false_ng') return renderTrueFalseNG(q as ReadingQuestion, answers, setAnswers, accentColor);
    if (type === 'paragraph_match') return renderParagraphMatch(q as ReadingQuestion, answers, setAnswers, accentColor);
    if (['fill_blank', 'form_completion', 'short_answer', 'summary_completion', 'table_completion'].includes(type)) {
      return renderFillBlank(q, answers, setAnswers, accentColor);
    }
    // Fallback: treat as fill blank
    return renderFillBlank(q, answers, setAnswers, accentColor);
  };

  // ─── Loading State ────────────────────────────────────────────────────────
  if (examLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#4F46E5] animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Preparing your exam...</p>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Universal HUD ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">{config.title}</h3>
            {currentPhase === 'listening' && listeningSections.length > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                Section {currentListeningSection + 1} of {listeningSections.length}
              </p>
            )}
            {currentPhase === 'reading' && readingPassages.length > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                Passage {currentReadingPassage + 1} of {readingPassages.length}
                {activePassage && ` — ${activePassage.title}`}
              </p>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
              <span className="font-mono font-bold text-red-600">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            <span className="font-semibold text-gray-700">
              {currentPhase === 'listening' && `Q ${sectionQuestions[0]?.number || '?'}–${sectionQuestions[sectionQuestions.length - 1]?.number || '?'}`}
              {currentPhase === 'reading' && `Q ${passageQuestions[0]?.number || '?'}–${passageQuestions[passageQuestions.length - 1]?.number || '?'}`}
              {currentPhase === 'writing' && `Task ${writingTask} of 2`}
              {currentPhase === 'speaking' && `Question ${speakingQuestionIndex + 1} of ${config.totalQuestions}`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Content Area ──────────────────────────────────────────────────── */}
      <div className="px-6 py-8 pb-32">

        {/* ══ Phase 1: Listening ═══════════════════════════════════════════ */}
        {currentPhase === 'listening' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {activeSection ? (
              <>
                {/* Audio Player */}
                <Card className="border-2 border-[#4F46E5]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-[#4F46E5]" />
                      <h3 className="font-bold text-gray-900">Section {activeSection.section_number} Audio</h3>
                    </div>
                    <audio
                      ref={audioRef}
                      src={activeSection.audio_url}
                      onTimeUpdate={handleAudioTimeUpdate}
                      onLoadedMetadata={handleAudioLoaded}
                      onEnded={handleAudioEnded}
                      preload="metadata"
                    />
                    <div className="bg-[#EEF2FF] rounded-xl p-5">
                      <div className="flex items-center gap-4 mb-3">
                        <button
                          onClick={handlePlayPause}
                          className="w-12 h-12 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] flex items-center justify-center transition-colors shadow-md"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 text-white" />
                          ) : (
                            <Play className="w-5 h-5 text-white ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="h-2 bg-white rounded-full overflow-hidden cursor-pointer"
                            onClick={(e) => {
                              if (audioRef.current && audioDuration) {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const pct = x / rect.width;
                                audioRef.current.currentTime = pct * audioDuration;
                              }
                            }}>
                            <div
                              className="h-full bg-[#4F46E5] transition-all duration-300"
                              style={{ width: audioDuration > 0 ? `${(audioProgress / audioDuration) * 100}%` : '0%' }}
                            />
                          </div>
                        </div>
                        <span className="text-gray-700 font-mono text-sm whitespace-nowrap">
                          {formatAudioTime(audioProgress)} / {formatAudioTime(audioDuration)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        🎧 Listen carefully — this simulates real IELTS conditions
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Questions grouped by instruction type */}
                <Card className="border-2 border-[#4F46E5]">
                  <div className="space-y-6">
                    {/* Group questions by instruction */}
                    {(() => {
                      const groups: { instruction: string; questions: ListeningQuestion[] }[] = [];
                      let currentInstruction = '';
                      sectionQuestions.forEach(q => {
                        const instr = q.instruction || '';
                        if (instr !== currentInstruction || groups.length === 0) {
                          currentInstruction = instr;
                          groups.push({ instruction: instr, questions: [q] });
                        } else {
                          groups[groups.length - 1].questions.push(q);
                        }
                      });
                      return groups.map((group, gi) => (
                        <div key={gi} className="space-y-4">
                          {group.instruction && (
                            <div className="p-3 bg-[#EEF2FF] rounded-lg border border-[#4F46E5]/20">
                              <p className="text-sm font-medium text-[#4F46E5]">{group.instruction}</p>
                            </div>
                          )}
                          <h3 className="font-bold text-gray-900">
                            Questions {group.questions[0].number}–{group.questions[group.questions.length - 1].number}
                          </h3>
                          {group.questions.map(q => renderQuestion(q, listeningAnswers, setListeningAnswers, '#4F46E5'))}
                        </div>
                      ));
                    })()}
                  </div>
                </Card>

                {/* Section Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-500">
                    {Object.keys(listeningAnswers).filter(k => sectionQuestions.some(q => q.number === parseInt(k))).length} of {sectionQuestions.length} answered
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSkipSubSection}
                      className="px-5 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <SkipForward className="w-4 h-4" />
                      {isLastListeningSection ? 'Skip to Reading' : 'Skip Section'}
                    </button>
                    <button
                      onClick={handleNextSubSection}
                      disabled={!allSectionQsAnswered}
                      className={`px-5 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${allSectionQsAnswered
                        ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <span>{isLastListeningSection ? 'Continue to Reading' : 'Next Section'}</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Card className="border-2 border-[#4F46E5] text-center py-12">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Listening data not available</h3>
                <p className="text-gray-600 mb-6">Could not load listening sections from the server.</p>
                <button onClick={handleNextPhase} className="px-6 py-3 bg-[#4F46E5] text-white font-bold rounded-xl hover:bg-[#4338CA]">
                  Skip to Reading →
                </button>
              </Card>
            )}
          </div>
        )}

        {/* ══ Phase 2: Reading ════════════════════════════════════════════ */}
        {currentPhase === 'reading' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {activePassage ? (
              <>
                {/* Passage */}
                <Card className="border-2 border-[#10B981]">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Passage {activePassage.passage_number}</h2>
                  <h3 className="text-xl font-semibold text-[#10B981] mb-4">{activePassage.title}</h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed max-h-[500px] overflow-y-auto pr-2">
                    {activePassage.text.split(/\n+/).filter(p => p.trim()).map((paragraph, i) => (
                      <p key={i}>{paragraph.trim()}</p>
                    ))}
                  </div>
                </Card>

                {/* Questions grouped by instruction / type */}
                <Card className="border-2 border-[#10B981]">
                  <div className="space-y-6">
                    {(() => {
                      const groups: { instruction: string; questions: ReadingQuestion[] }[] = [];
                      let currentInstruction = '';
                      passageQuestions.forEach(q => {
                        const instr = q.instruction || '';
                        if (instr !== currentInstruction || groups.length === 0) {
                          currentInstruction = instr;
                          groups.push({ instruction: instr, questions: [q] });
                        } else {
                          groups[groups.length - 1].questions.push(q);
                        }
                      });
                      return groups.map((group, gi) => (
                        <div key={gi} className="space-y-4">
                          {group.instruction && (
                            <div className="p-3 bg-[#ECFDF5] rounded-lg border border-[#10B981]/20">
                              <p className="text-sm font-medium text-[#10B981]">{group.instruction}</p>
                            </div>
                          )}
                          <h3 className="font-bold text-gray-900">
                            Questions {group.questions[0].number}–{group.questions[group.questions.length - 1].number}
                          </h3>
                          {group.questions.map(q => renderQuestion(q, readingAnswers, setReadingAnswers, '#10B981'))}
                        </div>
                      ));
                    })()}
                  </div>
                </Card>

                {/* Passage Navigation */}
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-500">
                    {Object.keys(readingAnswers).filter(k => passageQuestions.some(q => q.number === parseInt(k))).length} of {passageQuestions.length} answered
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSkipSubSection}
                      className="px-5 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <SkipForward className="w-4 h-4" />
                      {isLastReadingPassage ? 'Skip to Writing' : 'Skip Passage'}
                    </button>
                    <button
                      onClick={handleNextSubSection}
                      disabled={!allPassageQsAnswered}
                      className={`px-5 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${allPassageQsAnswered
                        ? 'bg-[#10B981] text-white hover:bg-[#059669] shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <span>{isLastReadingPassage ? 'Continue to Writing' : 'Next Passage'}</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Card className="border-2 border-[#10B981] text-center py-12">
                {readingPassages.length === 0 ? (
                  <>
                    <Loader2 className="w-10 h-10 text-[#10B981] animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading reading passages...</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Reading data not available</h3>
                    <button onClick={handleNextPhase} className="px-6 py-3 bg-[#10B981] text-white font-bold rounded-xl hover:bg-[#059669]">
                      Skip to Writing →
                    </button>
                  </>
                )}
              </Card>
            )}
          </div>
        )}

        {/* ══ Phase 3: Writing (unchanged) ═══════════════════════════════ */}
        {currentPhase === 'writing' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex gap-3">
              <button
                onClick={() => setWritingTask(1)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${writingTask === 1
                  ? 'bg-[#F43F5E] text-white shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Task 1: Report
              </button>
              <button
                onClick={() => setWritingTask(2)}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${writingTask === 2
                  ? 'bg-[#F43F5E] text-white shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Task 2: Essay
              </button>
            </div>

            {writingTask === 1 && (
              <Card className="border-2 border-[#F43F5E]">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Writing Task 1</h2>
                    <p className="text-gray-600">You should spend about 20 minutes on this task. Write at least 150 words.</p>
                  </div>
                  <div className="p-4 bg-[#FFF1F2] rounded-xl border border-[#F43F5E]/30">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      The chart below shows the number of international students enrolled at universities in three countries between 2015 and 2020.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Summarize the information by selecting and reporting the main features, and make comparisons where relevant.
                    </p>
                  </div>
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                    <h4 className="font-bold text-gray-900 mb-4 text-center">International Student Enrollment (in thousands)</h4>
                    <div className="w-full" style={{ height: '250px' }}>
                      <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="year" tick={{ fill: '#6B7280', fontSize: 12 }} />
                          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} label={{ value: 'Students (thousands)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280', fontSize: 12 } }} />
                          <Tooltip contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                          <Bar dataKey="students" fill="#F43F5E" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm px-2">
                    <span className="text-gray-600">Word Count:</span>
                    <span className={`font-bold ${wordCount1 >= 150 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>{wordCount1} / 150 minimum</span>
                  </div>
                  <textarea value={task1Text} onChange={(e) => setTask1Text(e.target.value)} className="w-full min-h-[300px] p-4 bg-white text-gray-900 rounded-xl border-2 border-gray-300 outline-none focus:border-[#F43F5E] transition-colors resize-none text-sm leading-relaxed" placeholder="Begin writing your response here..." />
                  <p className="text-xs text-gray-500">⚠️ No AI hints available during exam mode</p>
                </div>
              </Card>
            )}

            {writingTask === 2 && (
              <Card className="border-2 border-[#F43F5E]">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Writing Task 2</h2>
                    <p className="text-gray-600">You should spend about 40 minutes on this task. Write at least 250 words.</p>
                  </div>
                  <div className="p-4 bg-[#FFF1F2] rounded-xl border border-[#F43F5E]/30">
                    <p className="text-gray-700 leading-relaxed mb-4"><span className="font-bold">Topic:</span> Some people believe that technology has made our lives more complex. Others think it has simplified daily tasks and improved our quality of life.</p>
                    <p className="text-gray-700 leading-relaxed mb-4">Discuss both views and give your own opinion.</p>
                    <p className="text-gray-700 leading-relaxed">Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
                  </div>
                  <div className="flex items-center justify-between text-sm px-2">
                    <span className="text-gray-600">Word Count:</span>
                    <span className={`font-bold ${wordCount2 >= 250 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>{wordCount2} / 250 minimum</span>
                  </div>
                  <textarea value={task2Text} onChange={(e) => setTask2Text(e.target.value)} className="w-full min-h-[400px] p-4 bg-white text-gray-900 rounded-xl border-2 border-gray-300 outline-none focus:border-[#F43F5E] transition-colors resize-none text-sm leading-relaxed" placeholder="Begin writing your essay here..." />
                  <p className="text-xs text-gray-500">⚠️ No AI hints available during exam mode</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ══ Phase 4: Speaking (unchanged) ══════════════════════════════ */}
        {currentPhase === 'speaking' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                  </>
                )}
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#10B981] flex items-center justify-center shadow-2xl">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#818CF8] to-[#A78BFA] flex items-center justify-center">
                      {isRecording ? (
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-3 h-10 bg-white rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                          ))}
                        </div>
                      ) : (
                        <Mic className="w-16 h-16 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {isRecording && (
                <div className="mt-6 flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 rounded-full">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-red-600">Recording...</span>
                </div>
              )}
            </div>
            <Card className="border-2 border-[#4F46E5]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 rounded-full bg-[#4F46E5] text-white text-sm font-semibold">Part 1: Introduction</div>
                  <span className="text-gray-600 text-sm">Question {speakingQuestionIndex + 1} of {config.totalQuestions}</span>
                </div>
                <div className="p-6 bg-[#EEF2FF] rounded-xl border border-[#4F46E5]/30">
                  <p className="text-gray-900 text-lg leading-relaxed">{speakingQuestions[speakingQuestionIndex]}</p>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => isRecording ? handleStopRecording() : handleStartRecording()}
                    className={`px-8 py-4 rounded-2xl font-bold transition-all ${isRecording ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'}`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">⚠️ Speak naturally - you have 45 seconds to respond</p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ── Bottom Navigation Bar ──────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 z-20 shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={() => setShowEndModal(true)}
            className="px-6 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors border border-red-200"
          >
            End Exam
          </button>

          {/* Only show phase-level skip for writing and speaking (listening/reading have their own section nav) */}
          {(currentPhase === 'writing' || currentPhase === 'speaking') && (
            <button
              onClick={handleNextPhase}
              className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white font-bold rounded-xl hover:bg-[#4338CA] transition-colors shadow-md"
            >
              <span>Skip to Next Section</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── End Exam Modal ─────────────────────────────────────────────── */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <Card className="max-w-md w-full bg-white">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">End Exam?</h3>
                <button onClick={() => setShowEndModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Are you sure you want to end the exam? Your progress will be submitted and you cannot return to this test.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowEndModal(false)} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">Continue Test</button>
                <button onClick={handleEndExam} className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">End & Submit</button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Skip Section Modal ─────────────────────────────────────────── */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <Card className="max-w-md w-full bg-white">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Skip Section?</h3>
                <button onClick={() => setShowSkipModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <p className="text-gray-700 leading-relaxed">Are you sure you want to skip to the next section? Your progress in the current section will be saved.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowSkipModal(false)} className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">Stay in Section</button>
                <button onClick={() => { setShowSkipModal(false); handleNextPhase(); }} className="flex-1 px-6 py-3 bg-[#4F46E5] text-white font-bold rounded-xl hover:bg-[#4338CA] transition-colors">Skip & Continue</button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Review Choice Modal ────────────────────────────────────────── */}
      {showReviewModal && (
        <ReviewChoiceModal
          onClose={() => setShowReviewModal(false)}
          onSelectAI={handleAIReview}
          onSelectHuman={handleHumanReview}
          creditsRequired={4}
          availableCredits={availableCredits}
          userTier={userTier}
          type="exam"
        />
      )}
    </div>
  );
}