import { useState } from 'react';
import { Card } from './Card';
import { ChevronDown, ChevronUp, Clock, ArrowLeft } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';
import { Lock } from 'lucide-react';
import { ReviewChoiceModal } from './ReviewChoiceModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiCall } from '../lib/api';

type ViewMode = 'editor' | 'loading' | 'feedback';

interface WritingModuleProps {
  userTier?: 'free' | 'premium';
  availableCredits?: number;
  topicId?: string | null;
  topicName?: string | null;
  onBack?: () => void;
  onCreditUpdate?: () => void;
}

// Types for AI feedback response
interface Correction {
  original: string;
  correction: string;
  type: string;
  explanation: string;
}

interface CohesionIssue {
  location: string;
  issue: string;
  suggestion: string;
}

interface VocabHighlight {
  word: string;
  type: string;
}

interface Suggestion {
  text: string;
  priority: string;
}

interface AIFeedback {
  overall_score: number;
  task_achievement: number;
  coherence_cohesion: number;
  lexical_resource: number;
  grammatical_range: number;
  corrections: Correction[];
  cohesion_issues: CohesionIssue[];
  vocabulary_highlights: VocabHighlight[];
  suggestions: Suggestion[];
}

// ─── Topic-specific content ─────────────────────────────────────────
interface TopicContent {
  task1Prompt: string;
  task2Prompt: string;
  chartTitle: string;
  chartYLabel: string;
  chartData: { label: string; value: number }[];
}

function getTopicContent(topicName: string | null): TopicContent {
  const name = (topicName || '').toLowerCase();

  if (name.includes('environment') || name.includes('climate')) {
    return {
      task1Prompt: 'The chart below shows carbon dioxide emissions (in million tonnes) from four different countries between 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'Some people believe that environmental problems are too big for individuals to solve, and that only governments and large companies can make a real difference. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
      chartTitle: 'CO₂ Emissions by Country (million tonnes)',
      chartYLabel: 'Million tonnes',
      chartData: [
        { label: '2010', value: 320 },
        { label: '2012', value: 345 },
        { label: '2014', value: 370 },
        { label: '2016', value: 360 },
        { label: '2018', value: 340 },
        { label: '2020', value: 290 },
      ],
    };
  }

  if (name.includes('technology') || name.includes('tech')) {
    return {
      task1Prompt: 'The chart below shows the percentage of households with internet access in five countries between 2005 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'Some people think that the increasing use of technology in everyday life is making people less creative. Others believe technology provides new opportunities for creativity. Discuss both views and give your own opinion. Give reasons for your answer and include any relevant examples.',
      chartTitle: 'Household Internet Access (%)',
      chartYLabel: 'Percentage',
      chartData: [
        { label: '2005', value: 35 },
        { label: '2008', value: 52 },
        { label: '2011', value: 65 },
        { label: '2014', value: 78 },
        { label: '2017', value: 88 },
        { label: '2020', value: 95 },
      ],
    };
  }

  if (name.includes('education')) {
    return {
      task1Prompt: 'The chart below shows the number of students enrolled in higher education (in thousands) in three different regions between 2000 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'Some people believe that university education should be free for all students. Others think that students should pay for their own education. Discuss both views and give your own opinion. Give reasons for your answer and include any relevant examples.',
      chartTitle: 'Higher Education Enrollment (thousands)',
      chartYLabel: 'Students (thousands)',
      chartData: [
        { label: '2000', value: 120 },
        { label: '2004', value: 155 },
        { label: '2008', value: 190 },
        { label: '2012', value: 230 },
        { label: '2016', value: 275 },
        { label: '2020', value: 310 },
      ],
    };
  }

  if (name.includes('health') || name.includes('medicine')) {
    return {
      task1Prompt: 'The chart below shows the average life expectancy (in years) in six countries between 1990 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'In many countries, the cost of healthcare is rising. Some people believe that governments should provide free healthcare for all citizens, while others think individuals should be responsible for their own health costs. Discuss both views and give your own opinion.',
      chartTitle: 'Average Life Expectancy (years)',
      chartYLabel: 'Years',
      chartData: [
        { label: '1990', value: 65 },
        { label: '1995', value: 68 },
        { label: '2000', value: 71 },
        { label: '2005', value: 73 },
        { label: '2010', value: 75 },
        { label: '2020', value: 78 },
      ],
    };
  }

  if (name.includes('globaliz') || name.includes('culture') || name.includes('global')) {
    return {
      task1Prompt: 'The chart below shows the number of international tourists (in millions) visiting five popular destinations between 2010 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'Globalization has led to the spread of a few dominant cultures at the expense of local traditions. To what extent do you agree or disagree? Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
      chartTitle: 'International Tourist Arrivals (millions)',
      chartYLabel: 'Millions',
      chartData: [
        { label: '2010', value: 48 },
        { label: '2012', value: 55 },
        { label: '2014', value: 63 },
        { label: '2016', value: 72 },
        { label: '2018', value: 80 },
        { label: '2020', value: 30 },
      ],
    };
  }

  if (name.includes('work') || name.includes('employment') || name.includes('job') || name.includes('career')) {
    return {
      task1Prompt: 'The chart below shows the unemployment rate (%) in four countries between 2010 and 2022. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'Some people think that working from home is more productive than working in an office. Others believe that an office environment is essential for effectiveness. Discuss both views and give your own opinion. Give reasons for your answer and include any relevant examples.',
      chartTitle: 'Unemployment Rate (%)',
      chartYLabel: 'Percentage',
      chartData: [
        { label: '2010', value: 9.5 },
        { label: '2012', value: 8.2 },
        { label: '2014', value: 7.0 },
        { label: '2016', value: 5.8 },
        { label: '2018', value: 4.5 },
        { label: '2022', value: 5.2 },
      ],
    };
  }

  if (name.includes('urban') || name.includes('city') || name.includes('cities') || name.includes('housing')) {
    return {
      task1Prompt: 'The chart below shows the percentage of the population living in urban areas in four regions between 1970 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'Many people are moving from rural areas to cities in search of better opportunities. What problems does this cause? What solutions can you suggest? Give reasons for your answer and include any relevant examples.',
      chartTitle: 'Urban Population (%)',
      chartYLabel: 'Percentage',
      chartData: [
        { label: '1970', value: 36 },
        { label: '1980', value: 40 },
        { label: '1990', value: 45 },
        { label: '2000', value: 50 },
        { label: '2010', value: 55 },
        { label: '2020', value: 60 },
      ],
    };
  }

  if (name.includes('transport') || name.includes('travel')) {
    return {
      task1Prompt: 'The chart below shows the number of passengers (in millions) using different modes of transport in a major city between 2005 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'Some people think the best way to reduce traffic congestion is to increase the price of fuel. Others believe there are better solutions. Discuss both views and give your own opinion. Give reasons for your answer and include any relevant examples.',
      chartTitle: 'Passengers by Transport Mode (millions)',
      chartYLabel: 'Millions',
      chartData: [
        { label: '2005', value: 180 },
        { label: '2008', value: 200 },
        { label: '2011', value: 230 },
        { label: '2014', value: 260 },
        { label: '2017', value: 290 },
        { label: '2020', value: 210 },
      ],
    };
  }

  if (name.includes('crime') || name.includes('law') || name.includes('justice')) {
    return {
      task1Prompt: 'The chart below shows the crime rate (per 100,000 people) in four cities between 2005 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are more effective ways to prevent criminal behaviour. Discuss both views and give your own opinion. Give reasons for your answer and include any relevant examples.',
      chartTitle: 'Crime Rate (per 100,000 people)',
      chartYLabel: 'Per 100k',
      chartData: [
        { label: '2005', value: 450 },
        { label: '2008', value: 420 },
        { label: '2011', value: 380 },
        { label: '2014', value: 350 },
        { label: '2017', value: 310 },
        { label: '2020', value: 290 },
      ],
    };
  }

  if (name.includes('food') || name.includes('nutrition') || name.includes('diet') || name.includes('agriculture')) {
    return {
      task1Prompt: 'The chart below shows the amount of food waste (in kilograms per person) in six countries in 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'In many countries, the amount of food wasted is increasing. What are the causes of this trend? What measures could be taken to solve this problem? Give reasons for your answer and include any relevant examples.',
      chartTitle: 'Food Waste Per Capita (kg/year)',
      chartYLabel: 'Kilograms',
      chartData: [
        { label: 'USA', value: 120 },
        { label: 'UK', value: 95 },
        { label: 'Japan', value: 64 },
        { label: 'India', value: 50 },
        { label: 'Brazil', value: 85 },
        { label: 'Nigeria', value: 40 },
      ],
    };
  }

  if (name.includes('media') || name.includes('social') || name.includes('news') || name.includes('advertis')) {
    return {
      task1Prompt: 'The chart below shows the average daily time (in minutes) spent on social media platforms by different age groups in 2023. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'Some people think social media has a positive impact on society, while others believe it causes more harm than good. Discuss both views and give your own opinion. Give reasons for your answer and include any relevant examples.',
      chartTitle: 'Daily Social Media Usage (minutes)',
      chartYLabel: 'Minutes',
      chartData: [
        { label: '13-17', value: 180 },
        { label: '18-24', value: 150 },
        { label: '25-34', value: 120 },
        { label: '35-44', value: 90 },
        { label: '45-54', value: 60 },
        { label: '55+', value: 35 },
      ],
    };
  }

  if (name.includes('sport') || name.includes('fitness') || name.includes('exercise')) {
    return {
      task1Prompt: 'The chart below shows the participation rate (%) in different sports activities among adults in a European country in 2022. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      task2Prompt: 'Some people believe that governments should invest more in promoting sports and exercise to improve public health. Others think this is a personal responsibility. Discuss both views and give your own opinion. Give reasons for your answer and include any relevant examples.',
      chartTitle: 'Sports Participation Rate (%)',
      chartYLabel: 'Percentage',
      chartData: [
        { label: 'Running', value: 32 },
        { label: 'Swimming', value: 28 },
        { label: 'Football', value: 24 },
        { label: 'Cycling', value: 22 },
        { label: 'Tennis', value: 14 },
        { label: 'Yoga', value: 18 },
      ],
    };
  }

  // Default / fallback for any unrecognized topic
  return {
    task1Prompt: 'The chart below shows the number of international students enrolled at universities in three countries between 2015 and 2020. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
    task2Prompt: `${topicName || 'Modern society'} is a topic that generates significant debate. Some people hold one view, while others take the opposite position. Discuss both views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience.`,
    chartTitle: 'International Student Enrollment (thousands)',
    chartYLabel: 'Students',
    chartData: [
      { label: '2015', value: 120 },
      { label: '2016', value: 145 },
      { label: '2017', value: 165 },
      { label: '2018', value: 190 },
      { label: '2019', value: 210 },
      { label: '2020', value: 185 },
    ],
  };
}

// ─── Component ──────────────────────────────────────────────────────
export function WritingModule({ userTier = 'free', availableCredits = 0, topicId = null, topicName = null, onBack, onCreditUpdate }: WritingModuleProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [timeLeft] = useState(3600);
  const [task1WordCount, setTask1WordCount] = useState(0);
  const [task2WordCount, setTask2WordCount] = useState(0);
  const [writingTask, setWritingTask] = useState<1 | 2>(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [task1Text, setTask1Text] = useState('');
  const [task2Text, setTask2Text] = useState('');
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  // API integration state
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get topic-specific content
  const topicContent = getTopicContent(topicName);

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

  const handleAIReview = async () => {
    setShowReviewModal(false);
    setViewMode('loading');
    setError(null);
    setIsPublished(false); // Reset publish state for new attempts

    try {
      // Step 1: Submit the writing
      const submitResponse = await apiCall('/writing/submit', {
        method: 'POST',
        body: JSON.stringify({
          topic_id: topicId || 'technology',
          task1_prompt: topicContent.task1Prompt,
          task1_text: task1Text,
          task1_word_count: task1WordCount,
          task2_prompt: topicContent.task2Prompt,
          task2_text: task2Text,
          task2_word_count: task2WordCount,
          time_spent_seconds: 3600 - timeLeft,
        }),
      });

      const newSubmissionId = submitResponse.submission_id;
      // ADD THIS LINE:
      setCurrentSubmissionId(newSubmissionId);

      // Step 2: Request AI review
      const reviewResponse = await apiCall(`/writing/${newSubmissionId}/review/ai`, {
        method: 'POST',
      });

      setAiFeedback(reviewResponse.feedback);
      setViewMode('feedback');
      // Refresh credits in the parent
      onCreditUpdate?.();
    } catch (err: any) {
      console.error('AI Review failed:', err);
      setError(err.message || 'Failed to get AI feedback. Please try again.');
      setViewMode('editor');
    }
  };

  const handleHumanReview = () => {
    setShowReviewModal(false);
    alert('Submitted for Human Verification! You will receive results in 24-48 hours.');
  };

  const handlePublishToCommunity = async () => {
    if (!currentSubmissionId) {
      alert('Cannot publish: Submission ID is missing.');
      return;
    }

    try {
      setIsPublishing(true);
      await apiCall('/community/posts', {
        method: 'POST',
        body: JSON.stringify({
          writing_submission_id: currentSubmissionId,
          title: `Writing Task 2: ${topicName || 'General Practice'}`
        })
      });
      setIsPublished(true);
      alert('Published successfully! Check the Community tab to see your post.');
    } catch (error: any) {
      console.error('Publish failed', error);
      alert(`Could not publish to community: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // ─── Loading Screen ─────────────────────────────────────────────
  if (viewMode === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#10B981] animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Essay</h2>
            <p className="text-gray-600">Our AI examiner is reviewing your writing...</p>
          </div>
          <div className="space-y-2 max-w-xs mx-auto">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>Essay submitted successfully</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 border-2 border-[#4F46E5] rounded-full animate-pulse"></div>
              <span>Checking grammar & vocabulary...</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              <span>Generating band score</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">This usually takes 5-15 seconds</p>
        </div>
      </div>
    );
  }

  // ─── Feedback View ──────────────────────────────────────────────
  if (viewMode === 'feedback' && aiFeedback) {
    const feedback = aiFeedback;
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24">
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">AI Feedback</h2>
            <button onClick={() => setViewMode('editor')} className="text-[#4F46E5] font-semibold">
              Back to Editor
            </button>
          </div>

          {/* Score Overview */}
          <Card className="border-2 border-[#4F46E5] mb-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">AI Estimated Score</div>
                  <div className="text-4xl font-bold text-[#4F46E5]">{feedback.overall_score}</div>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#10B981] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{feedback.overall_score}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <div className="bg-[#EEF2FF] rounded-xl p-3">
                  <div className="text-xs text-[#4F46E5] font-semibold">Task Achievement</div>
                  <div className="text-2xl font-bold text-[#4F46E5]">{feedback.task_achievement}</div>
                </div>
                <div className="bg-[#ECFDF5] rounded-xl p-3">
                  <div className="text-xs text-[#10B981] font-semibold">Coherence & Cohesion</div>
                  <div className="text-2xl font-bold text-[#10B981]">{feedback.coherence_cohesion}</div>
                </div>
                <div className="bg-[#FEF3C7] rounded-xl p-3">
                  <div className="text-xs text-[#F59E0B] font-semibold">Lexical Resource</div>
                  <div className="text-2xl font-bold text-[#F59E0B]">{feedback.lexical_resource}</div>
                </div>
                <div className="bg-[#FFF1F2] rounded-xl p-3">
                  <div className="text-xs text-[#F43F5E] font-semibold">Grammar Range</div>
                  <div className="text-2xl font-bold text-[#F43F5E]">{feedback.grammatical_range}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Grammar Corrections */}
          {feedback.corrections && feedback.corrections.length > 0 && (
            <Card className="mb-4">
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <span className="text-red-500">❌</span> Grammar Corrections ({feedback.corrections.length})
                </h3>
                {feedback.corrections.map((correction, i) => (
                  <div key={i} className="p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-semibold capitalize">{correction.type}</span>
                    </div>
                    <div className="text-sm text-gray-800 mb-1">
                      <span className="line-through text-red-600 mr-2">{correction.original}</span>
                      <span className="text-green-700 font-semibold">→ {correction.correction}</span>
                    </div>
                    <p className="text-xs text-gray-600">{correction.explanation}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Cohesion Issues */}
          {feedback.cohesion_issues && feedback.cohesion_issues.length > 0 && (
            <Card className="mb-4">
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <span className="text-yellow-500">⚠️</span> Cohesion Issues ({feedback.cohesion_issues.length})
                </h3>
                {feedback.cohesion_issues.map((issue, i) => (
                  <div key={i} className="p-3 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
                    <div className="text-xs font-semibold text-yellow-700 mb-1">{issue.location}</div>
                    <p className="text-sm text-gray-800 mb-1">{issue.issue}</p>
                    <p className="text-xs text-gray-600">💡 {issue.suggestion}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Vocabulary Highlights */}
          {feedback.vocabulary_highlights && feedback.vocabulary_highlights.length > 0 && (
            <Card className="mb-4">
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <span className="text-green-500">✨</span> Advanced Vocabulary ({feedback.vocabulary_highlights.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {feedback.vocabulary_highlights.map((vocab, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {vocab.word}
                      <span className="ml-1 text-xs text-green-600 capitalize">({vocab.type})</span>
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Suggestions */}
          {feedback.suggestions && feedback.suggestions.length > 0 && (
            <Card className="mb-4">
              <div className="space-y-3">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <span>💡</span> Improvement Suggestions
                </h3>
                {feedback.suggestions.map((suggestion, i) => (
                  <div key={i} className="p-3 bg-[#EEF2FF] rounded-xl flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {suggestion.priority}
                    </span>
                    <p className="text-sm text-gray-700 flex-1">{suggestion.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Human verification upsell */}
          <Card className="border-2 border-[#F43F5E]">
            <div className="space-y-4">
              <div className="pt-4">
                <p className="text-gray-700 mb-4">
                  <span className="font-semibold text-[#F43F5E]">Not sure?</span> Get a Human Expert to verify your score for maximum accuracy.
                </p>
                <PrimaryButton variant="gradient" icon={Lock} className="w-full">
                  Verify for $9.99
                </PrimaryButton>
              </div>
            </div>
          </Card>
          {/* ADD THIS NEW PUBLISH CARD HERE */}
          <Card className="bg-[#EEF2FF] border-2 border-[#4F46E5]">
            <div className="space-y-4 text-center py-2">
              <h3 className="font-bold text-lg text-gray-900">Proud of your essay?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Share your writing and AI feedback with the IELTS Nexus community to help others learn.
              </p>
              <button
                onClick={handlePublishToCommunity}
                disabled={isPublishing || isPublished}
                className={`w-full py-3 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${isPublished
                    ? 'bg-green-100 text-green-700 border-2 border-green-200'
                    : 'bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-md shadow-[#4F46E5]/20'
                  }`}
              >
                {isPublishing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : isPublished ? (
                  <>✓ Published to Community Feed</>
                ) : (
                  <>Share to Community Feed</>
                )}
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Editor View ────────────────────────────────────────────────
  const canSubmit = task1WordCount >= 150 && task2WordCount >= 250;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {topicName ? `${topicName}` : 'Writing Practice'}
              </h2>
              <p className="text-sm text-gray-600">Complete both tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700 font-semibold">⚠️ {error}</p>
          <button onClick={() => setError(null)} className="text-xs text-red-500 underline mt-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Task Navigation Tabs */}
      <div className="px-6 pt-6">
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setWritingTask(1)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${writingTask === 1 ? 'bg-[#F43F5E] text-white shadow-md' : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
              }`}
          >
            <div className="text-center">
              <div>Task 1: Report</div>
              <div className="text-xs mt-1 opacity-80">{task1WordCount}/150 words</div>
            </div>
          </button>
          <button
            onClick={() => setWritingTask(2)}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${writingTask === 2 ? 'bg-[#F43F5E] text-white shadow-md' : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
              }`}
          >
            <div className="text-center">
              <div>Task 2: Essay</div>
              <div className="text-xs mt-1 opacity-80">{task2WordCount}/250 words</div>
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
                <p className="text-gray-700 leading-relaxed text-sm">
                  {topicContent.task1Prompt}
                </p>
              </div>

              {/* Chart */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
                <h4 className="font-bold text-gray-900 mb-4 text-center text-sm">
                  {topicContent.chartTitle}
                </h4>
                <div className="w-full" style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                    <BarChart data={topicContent.chartData.map(d => ({ name: d.label, value: d.value }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                      <Bar dataKey="value" fill="#F43F5E" radius={[8, 8, 0, 0]} />
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
                <p className="text-gray-700 leading-relaxed text-sm">
                  {topicContent.task2Prompt}
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
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all text-sm ${canSubmit ? 'bg-[#F43F5E] hover:bg-[#E11D48]' : 'bg-gray-400 cursor-not-allowed'
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