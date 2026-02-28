import { useState } from 'react';
import { Card } from './Card';
import { Check, X, ChevronRight } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

interface GrammarPracticeProps {
  onComplete?: () => void;
}

interface Question {
  id: number;
  sentence: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    sentence: "The team _____ working hard to meet the deadline.",
    options: ["is", "are", "was", "were"],
    correctAnswer: 0,
    explanation: "Use 'is' because 'team' is a collective noun treated as singular when acting as a unit."
  },
  {
    id: 2,
    sentence: "Each of the students _____ responsible for their own work.",
    options: ["is", "are", "was", "were"],
    correctAnswer: 0,
    explanation: "'Each' is always singular, so use 'is' regardless of the plural noun that follows."
  },
  {
    id: 3,
    sentence: "The data _____ been analyzed thoroughly.",
    options: ["has", "have", "is", "are"],
    correctAnswer: 0,
    explanation: "In American English, 'data' is commonly treated as singular when referring to a collective body of information."
  },
  {
    id: 4,
    sentence: "Neither the teacher nor the students _____ ready for the test.",
    options: ["is", "are", "was", "were"],
    correctAnswer: 1,
    explanation: "When using 'neither...nor', the verb agrees with the subject closest to it ('students' is plural)."
  },
  {
    id: 5,
    sentence: "Everyone _____ their best effort into the project.",
    options: ["puts", "put", "putting", "to put"],
    correctAnswer: 0,
    explanation: "'Everyone' is singular, so use 'puts'. The singular pronoun 'their' is acceptable in modern English."
  }
];

export function GrammarPractice({ onComplete }: GrammarPracticeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const question = questions[currentQuestion];

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (index === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const getAnswerColor = (index: number) => {
    if (!isAnswered) return 'border-gray-300 hover:bg-[#EEF2FF]';
    if (index === question.correctAnswer) return 'border-[#10B981] bg-[#ECFDF5]';
    if (index === selectedAnswer && index !== question.correctAnswer) return 'border-red-500 bg-red-50';
    return 'border-gray-300 opacity-50';
  };

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    const isPassing = percentage >= 80;

    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24 px-6 pt-8">
        <Card className="max-w-2xl mx-auto">
          <div className="space-y-6 text-center">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
              isPassing ? 'bg-[#ECFDF5]' : 'bg-[#FEF3C7]'
            }`}>
              <span className="text-4xl">{isPassing ? '🎉' : '📚'}</span>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isPassing ? 'Excellent Work!' : 'Keep Practicing!'}
              </h2>
              <p className="text-gray-600">
                You scored {score} out of {questions.length}
              </p>
            </div>

            <div className="text-6xl font-bold text-[#4F46E5]">
              {percentage.toFixed(0)}%
            </div>

            <div className="pt-4">
              <p className="text-gray-700 mb-4">
                {isPassing 
                  ? 'Your subject-verb agreement is strong! Keep up the great work.'
                  : 'Review the explanations and try again. Practice makes perfect!'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setSelectedAnswer(null);
                  setIsAnswered(false);
                  setScore(0);
                  setShowResults(false);
                }}
                className="flex-1 px-6 py-3 border-2 border-[#4F46E5] text-[#4F46E5] font-bold rounded-xl hover:bg-[#EEF2FF] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onComplete}
                className="flex-1 px-6 py-3 bg-[#4F46E5] text-white font-bold rounded-xl hover:bg-[#4338CA] transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subject-Verb Agreement</h2>
            <p className="text-gray-600 text-sm">Grammar Practice</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-xl font-bold text-[#4F46E5]">
              {currentQuestion + 1}/{questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#4F46E5] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Content */}
      <div className="px-6 pt-8 space-y-6">
        <Card className="border-2 border-[#4F46E5]">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold">
                {currentQuestion + 1}
              </div>
              <span className="text-sm text-gray-600">Question {currentQuestion + 1} of {questions.length}</span>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Choose the correct verb form:
              </h3>
              <p className="text-lg text-gray-800 leading-relaxed">
                {question.sentence}
              </p>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${getAnswerColor(index)} ${
                    !isAnswered ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {String.fromCharCode(65 + index)}. {option}
                    </span>
                    {isAnswered && index === question.correctAnswer && (
                      <Check className="w-6 h-6 text-[#10B981]" />
                    )}
                    {isAnswered && index === selectedAnswer && index !== question.correctAnswer && (
                      <X className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {isAnswered && (
              <div className={`p-4 rounded-xl ${
                selectedAnswer === question.correctAnswer ? 'bg-[#ECFDF5]' : 'bg-[#FEF3C7]'
              }`}>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Explanation</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#4F46E5] text-white font-bold rounded-2xl hover:bg-[#4338CA] transition-colors"
          >
            <span>{currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
