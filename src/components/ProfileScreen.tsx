import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';
import { CheckCircle, Sparkles, CreditCard, Target, Bookmark } from 'lucide-react';
import { useState } from 'react';

type PlanType = 'free' | 'premium';
type TabType = 'stats' | 'saved';

interface Weakness {
  id: string;
  title: string;
  category: string;
  locked?: boolean;
}

interface SavedPost {
  id: string;
  type: 'Writing' | 'Speaking';
  title: string;
  band: string;
  author: string;
}

interface ProfileScreenProps {
  userTier?: 'free' | 'premium';
  availableCredits?: number;
  onNavigateToWeaknessFix?: (weaknessId: string) => void;
}

const weaknesses: Weakness[] = [
  { id: '1', title: 'Subject-Verb Agreement', category: 'Grammar' },
  { id: '2', title: 'Pronunciation: "Th" Sound', category: 'Speaking' },
  { id: '3', title: 'Transition Words Overuse', category: 'Writing' },
  { id: '4', title: 'Time Management (Reading)', category: 'Reading' },
];

const savedPosts: SavedPost[] = [
  { id: '1', type: 'Writing', title: 'Globalization', band: '8.0', author: 'Sarah M.' },
  { id: '2', type: 'Speaking', title: 'Learning New Skills', band: '7.5', author: 'Mike J.' },
  { id: '3', type: 'Writing', title: 'Climate Change', band: '7.5', author: 'Alex J.' },
  { id: '4', type: 'Writing', title: 'Technology Impact', band: '8.5', author: 'Emma W.' },
  { id: '5', type: 'Speaking', title: 'Childhood Memories', band: '7.0', author: 'David L.' },
  { id: '6', type: 'Writing', title: 'Education Systems', band: '8.0', author: 'Lisa K.' },
];

export function ProfileScreen({ userTier, availableCredits, onNavigateToWeaknessFix }: ProfileScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(userTier || 'premium');
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
            <span className="text-3xl font-bold text-white">A</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Alex Johnson</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-gray-600">Target:</span>
              <span className="px-3 py-1 rounded-full bg-[#10B981] text-white text-sm font-bold">
                Band 8.0
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Tab Switcher */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'stats'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500'
            }`}
          >
            My Stats
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'saved'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500'
            }`}
          >
            Saved Posts
          </button>
        </div>

        {/* Saved Posts View */}
        {activeTab === 'saved' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Saved Collection</h3>
              <span className="text-sm text-gray-500">{savedPosts.length} items</span>
            </div>

            {/* Masonry Grid */}
            <div className="grid grid-cols-2 gap-4">
              {savedPosts.map((post) => (
                <div
                  key={post.id}
                  className="group relative cursor-pointer"
                >
                  <Card className="h-full hover:scale-105 transition-transform duration-200">
                    {/* Bookmark Icon Indicator */}
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#4F46E5] flex items-center justify-center shadow-md">
                      <Bookmark className="w-3.5 h-3.5 text-white fill-white" />
                    </div>

                    <div className="space-y-3">
                      {/* Type Badge */}
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        post.type === 'Writing' 
                          ? 'bg-[#EEF2FF] text-[#4F46E5]' 
                          : 'bg-[#ECFDF5] text-[#10B981]'
                      }`}>
                        {post.type} Task
                      </span>

                      {/* Title */}
                      <h4 className="font-bold text-gray-900 text-sm leading-tight">
                        {post.title}
                      </h4>

                      {/* Band Score */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Band:</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#F59E0B] text-xs font-bold">
                          {post.band}
                        </span>
                      </div>

                      {/* Author */}
                      <p className="text-xs text-gray-500">by {post.author}</p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Stats View */}
        {activeTab === 'stats' && (
          <>
            {/* Tier Toggle */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">View as:</h3>
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setSelectedPlan('free')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      selectedPlan === 'free'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-500'
                    }`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => setSelectedPlan('premium')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      selectedPlan === 'premium'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-500'
                    }`}
                  >
                    Premium
                  </button>
                </div>
              </div>
            </Card>

            {/* Weakness Engine */}
            <div>
              <div className="flex items-center gap-2 mb-4 px-1">
                <Target className="w-5 h-5 text-[#F43F5E]" />
                <h3 className="font-bold text-lg text-gray-900">Your Weakness Snapshot</h3>
              </div>

              {/* Horizontal Scrolling Carousel */}
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                {weaknesses.map((weakness, index) => {
                  const isLocked = selectedPlan === 'free' && index >= 3;
                  const testsRemaining = selectedPlan === 'free' ? 3 : 20;
                  
                  return (
                    <div
                      key={weakness.id}
                      className={`flex-shrink-0 relative ${isLocked ? 'opacity-60' : ''}`}
                      style={{ width: '140px' }}
                    >
                      <div 
                        className={`rounded-2xl p-4 border-2 h-40 flex flex-col justify-between ${
                          isLocked 
                            ? 'border-gray-300 bg-gray-50' 
                            : 'border-[#F43F5E] bg-white'
                        }`}
                        style={!isLocked ? { 
                          boxShadow: '0px 4px 12px rgba(244, 63, 94, 0.15)' 
                        } : {}}
                      >
                        {isLocked && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-2xl">
                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                              <span className="text-white text-lg">🔒</span>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <div className="text-xs text-[#F43F5E] font-semibold mb-2">
                            {weakness.category}
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 leading-tight">
                            {weakness.title}
                          </h4>
                        </div>

                        {!isLocked && (
                          <button className="w-full bg-[#F43F5E] hover:bg-[#E11D48] text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                            onClick={() => onNavigateToWeaknessFix?.(weakness.id)}
                          >
                            Fix This Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tests Remaining Counter */}
              <div className="mt-4 px-1">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  selectedPlan === 'free' 
                    ? 'bg-gray-100 text-gray-700' 
                    : 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white'
                }`}>
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {selectedPlan === 'free' ? '3/3' : '20/20'} Custom Tests Remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Toggle */}
            <Card>
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900">Your Plan</h3>
                
                {/* Segmented Control */}
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  <button
                    onClick={() => setSelectedPlan('free')}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      selectedPlan === 'free'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-500'
                    }`}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => setSelectedPlan('premium')}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      selectedPlan === 'premium'
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-500'
                    }`}
                  >
                    Premium AI
                  </button>
                </div>

                {/* Free Plan Details */}
                {selectedPlan === 'free' && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span>1 Generated Test/Day</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span>Basic AI Feedback</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span>Community Access</span>
                    </div>

                    <div className="pt-4">
                      <PrimaryButton className="w-full">
                        Upgrade to Premium
                      </PrimaryButton>
                    </div>
                  </div>
                )}

                {/* Premium Plan Details */}
                {selectedPlan === 'premium' && (
                  <div 
                    className="rounded-2xl p-5 space-y-3"
                    style={{
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      boxShadow: '0px 8px 24px rgba(79, 70, 229, 0.3)'
                    }}
                  >
                    <div className="flex items-center justify-between text-white mb-2">
                      <span className="text-lg font-bold">Premium AI Plan</span>
                      <Sparkles className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" fill="white" />
                      <span className="font-medium">Unlimited Adaptive Tests</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" fill="white" />
                      <span className="font-medium">Full Knowledge Graph</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" fill="white" />
                      <span className="font-medium">Advanced AI Feedback</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" fill="white" />
                      <span className="font-medium">Priority Support</span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-white/20 text-white">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">$29</span>
                        <span className="text-white/80">/month</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Human Verification Credits */}
            <Card className="border-2 border-[#F43F5E]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-gray-900">Human Verification</h3>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F43F5E] to-[#EC4899] flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                </div>

                <p className="text-gray-600">
                  Get your essays and speaking tests reviewed by certified IELTS examiners for maximum accuracy.
                </p>

                {/* Credits Balance */}
                <div className="bg-gradient-to-r from-[#FFF1F2] to-[#FCE7F3] rounded-2xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Available Credits</div>
                  <div className="text-4xl font-bold text-[#F43F5E]">{availableCredits || 2}</div>
                </div>

                {/* Pricing */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-700">Writing Task Review</span>
                    <span className="font-bold text-gray-900">1 credit</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-700">Speaking Test Review</span>
                    <span className="font-bold text-gray-900">1 credit</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-100 pt-3">
                    <span className="text-gray-700">Credit Price</span>
                    <span className="font-bold text-[#F43F5E]">$9.99 each</span>
                  </div>
                </div>

                <PrimaryButton 
                  variant="gradient" 
                  icon={CreditCard}
                  className="w-full"
                >
                  Top Up Credits
                </PrimaryButton>

                <p className="text-xs text-gray-500 text-center">
                  Human verification typically takes 24-48 hours
                </p>
              </div>
            </Card>

            {/* Stats Card */}
            <Card>
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900">Your Stats</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#EEF2FF] rounded-2xl p-4">
                    <div className="text-sm text-[#4F46E5] mb-1">Tests Completed</div>
                    <div className="text-3xl font-bold text-[#4F46E5]">47</div>
                  </div>
                  
                  <div className="bg-[#ECFDF5] rounded-2xl p-4">
                    <div className="text-sm text-[#10B981] mb-1">Current Band</div>
                    <div className="text-3xl font-bold text-[#10B981]">6.5</div>
                  </div>
                  
                  <div className="bg-[#FEF3C7] rounded-2xl p-4">
                    <div className="text-sm text-[#F59E0B] mb-1">Study Streak</div>
                    <div className="text-3xl font-bold text-[#F59E0B]">12</div>
                  </div>
                  
                  <div className="bg-[#FFF1F2] rounded-2xl p-4">
                    <div className="text-sm text-[#F43F5E] mb-1">Hours Practiced</div>
                    <div className="text-3xl font-bold text-[#F43F5E]">38</div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}