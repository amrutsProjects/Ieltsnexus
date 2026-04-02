import { Card } from './Card';
import { Sparkles, Shield, X } from 'lucide-react';

interface ReviewChoiceModalProps {
  onClose: () => void;
  onSelectAI: () => void;
  onSelectHuman: () => void;
  creditsRequired: number;
  availableCredits: number;
  userTier: 'free' | 'premium';
  type: 'exam' | 'writing' | 'speaking';
}

export function ReviewChoiceModal({
  onClose,
  onSelectAI,
  onSelectHuman,
  creditsRequired,
  availableCredits,
  userTier,
  type
}: ReviewChoiceModalProps) {
  const hasEnoughCredits = availableCredits >= creditsRequired;
  
  const typeLabels = {
    exam: 'Full Exam',
    writing: 'Writing Task',
    speaking: 'Speaking Test'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6">
      <Card className="max-w-md w-full bg-white">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">Choose Review Type</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <p className="text-gray-600">
            Select how you'd like your {typeLabels[type]} reviewed
          </p>

          {/* Credits Display */}
          <div className={`p-4 rounded-xl border-2 ${
            userTier === 'premium' 
              ? 'bg-gradient-to-r from-[#4F46E5]/10 to-[#7C3AED]/10 border-[#4F46E5]' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Your Credits:</span>
              <div className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${
                  userTier === 'premium' ? 'text-[#4F46E5]' : 'text-gray-400'
                }`} />
                <span className={`text-2xl font-bold ${
                  userTier === 'premium' ? 'text-[#4F46E5]' : 'text-gray-600'
                }`}>
                  {availableCredits}
                </span>
              </div>
            </div>
            {userTier === 'free' && (
              <p className="text-xs text-gray-500 mt-2">
                Upgrade to Premium to get verification credits
              </p>
            )}
          </div>

          {/* AI Review Option */}
          <button
            onClick={onSelectAI}
            className="w-full group"
          >
            <div className="p-6 rounded-2xl border-2 border-[#4F46E5] bg-gradient-to-br from-[#EEF2FF] to-[#ECFDF5] hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#10B981] flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">
                    AI Review
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Instant feedback with detailed analysis and suggestions
                  </p>
                  <div className="inline-block px-3 py-1 rounded-full bg-[#10B981] text-white text-sm font-semibold">
                    FREE • Instant
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Human Verified Review Option */}
          <button
            onClick={hasEnoughCredits ? onSelectHuman : undefined}
            disabled={!hasEnoughCredits}
            className={`w-full group ${!hasEnoughCredits ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className={`p-6 rounded-2xl border-2 bg-gradient-to-br transition-all ${
              hasEnoughCredits
                ? 'border-[#F43F5E] from-[#FFF1F2] to-[#FEF3C7] hover:shadow-lg'
                : 'border-gray-300 from-gray-50 to-gray-100'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  hasEnoughCredits
                    ? 'bg-gradient-to-br from-[#F43F5E] to-[#F59E0B]'
                    : 'bg-gray-400'
                }`}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">
                    Human Verified Review
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Certified IELTS examiner provides official band score
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      hasEnoughCredits
                        ? 'bg-[#F43F5E] text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {creditsRequired} {creditsRequired === 1 ? 'Credit' : 'Credits'} • 24-48 hrs
                    </div>
                    {!hasEnoughCredits && (
                      <span className="text-xs text-red-600 font-semibold">
                        Not enough credits
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!hasEnoughCredits && userTier === 'free' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Need credits?</span> Upgrade to Premium to get 5 verification credits per month
                  </p>
                  <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-center">
                    <span className="text-xs text-gray-600">Premium includes:</span>
                    <span className="block font-bold text-[#4F46E5]">5 Credits/month</span>
                  </div>
                </div>
              )}
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}
