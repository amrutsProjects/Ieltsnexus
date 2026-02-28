import { useState } from 'react';
import { Card } from './Card';
import { PrimaryButton } from './PrimaryButton';
import { ArrowLeft, Share2, Heart, Bookmark, Play } from 'lucide-react';

interface CommunityPostDetailProps {
  onBack: () => void;
  onTryTest?: (topicId: string) => void;
}

interface Comment {
  id: string;
  author: string;
  isPremium: boolean;
  timestamp: string;
  content: string;
  likes: number;
}

export function CommunityPostDetail({ onBack, onTryTest }: CommunityPostDetailProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(1247);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  const comments: Comment[] = [
    {
      id: '1',
      author: 'Sarah Chen',
      isPremium: true,
      timestamp: '2 hours ago',
      content: 'This is excellent! The way you structured the argument is very clear. I especially liked your use of "coordinated efforts" in the conclusion.',
      likes: 24,
    },
    {
      id: '2',
      author: 'Mike Johnson',
      isPremium: false,
      timestamp: '4 hours ago',
      content: 'Great essay! One small tip: watch out for subject-verb agreement in the second paragraph. "This help" should be "This helps".',
      likes: 18,
    },
    {
      id: '3',
      author: 'Emma Watson',
      isPremium: true,
      timestamp: '6 hours ago',
      content: 'Band 7.5-8.0 range for sure. Your vocabulary is sophisticated, and the cohesion is strong. Keep practicing!',
      likes: 42,
    },
    {
      id: '4',
      author: 'David Lee',
      isPremium: false,
      timestamp: '8 hours ago',
      content: 'Very helpful to see a real example. Thanks for sharing!',
      likes: 9,
    },
  ];

  const sampleEssay = `Climate change is one of the most pressing issues facing our world today. Many people believes that individual actions can make a difference in addressing this problem.

Firstly, reducing personal carbon footprint through lifestyle changes is essential. People can use public transportation instead of private vehicles. This help to decrease emissions significantly.

Moreover, governments should implement stricter environmental policies. They needs to invest in renewable energy sources and promote sustainable practices across industries.

In conclusion, both individuals and governments have important roles to play in combating climate change through coordinated efforts.`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-4">
        {/* Original Post Container */}
        <Card>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">Alex Johnson</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#F59E0B] text-xs font-semibold">
                  Band 7.5
                </span>
              </div>
              <p className="text-sm text-gray-500">12 hours ago</p>
            </div>
          </div>

          {/* Topic Info */}
          <div className="mb-4 p-3 bg-[#EEF2FF] rounded-xl">
            <div className="text-xs font-semibold text-[#4F46E5] mb-1">Writing Task 2</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold">Topic:</span> Climate change is one of the most pressing issues of our time. Some people believe that individual actions can make a significant difference, while others think that only government policies can address the problem. Discuss both views and give your opinion.
            </p>
          </div>

          {/* User's Answer */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-900 mb-2">My Essay</h4>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed font-mono whitespace-pre-wrap">
              {sampleEssay}
            </div>
          </div>

          {/* The Diff Box - AI Corrections */}
          <div className="border-2 border-[#F43F5E] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#F43F5E] flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <h4 className="font-bold text-gray-900">AI Feedback Highlights</h4>
            </div>
            
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Climate change is one of the most pressing issues facing our world today. Many people{' '}
                <span className="bg-red-100 text-red-700 px-1 rounded line-through">believes</span>
                {' '}
                <span className="bg-green-100 text-green-700 px-1 rounded font-semibold">believe</span>
                {' '}that individual actions can make a difference in addressing this problem.
              </p>

              <p>
                Firstly, reducing personal carbon footprint through lifestyle changes is essential. People can use public transportation instead of private vehicles. This{' '}
                <span className="bg-red-100 text-red-700 px-1 rounded line-through">help</span>
                {' '}
                <span className="bg-green-100 text-green-700 px-1 rounded font-semibold">helps</span>
                {' '}to decrease emissions significantly.
              </p>

              <p>
                Moreover, governments should implement stricter environmental policies. They{' '}
                <span className="bg-red-100 text-red-700 px-1 rounded line-through">needs</span>
                {' '}
                <span className="bg-green-100 text-green-700 px-1 rounded font-semibold">need</span>
                {' '}to invest in renewable energy sources and promote sustainable practices across industries.
              </p>

              {/* Legend */}
              <div className="flex gap-4 pt-3 mt-3 border-t border-gray-200 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-gray-600">Error</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-gray-600">Correction</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Sticky Interaction Row */}
        <div className="sticky top-[73px] z-10 bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center gap-3">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isLiked 
                  ? 'bg-red-50 text-red-500' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Heart 
                className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`}
              />
              <span className="font-semibold text-sm">
                {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
              </span>
            </button>

            {/* Save Button */}
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isSaved 
                  ? 'bg-[#EEF2FF] text-[#4F46E5]' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bookmark 
                className={`w-5 h-5 ${isSaved ? 'fill-[#4F46E5]' : ''}`}
              />
              <span className="font-semibold text-sm">
                {isSaved ? 'Saved' : 'Save'}
              </span>
            </button>

            {/* Try This Test Button */}
            <button
              onClick={() => onTryTest?.('environment')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 border-[#4F46E5] text-[#4F46E5] font-semibold text-sm hover:bg-[#EEF2FF] transition-colors"
            >
              <Play className="w-4 h-4" />
              Try This Test
            </button>
          </div>
        </div>

        {/* Comment Section */}
        <Card>
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Comments ({comments.length})
          </h3>

          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-xl transition-colors ${
                  comment.isPremium 
                    ? 'bg-gradient-to-br from-[#FEF3C7]/30 to-[#FEF3C7]/10 border border-[#F59E0B]/20' 
                    : 'bg-gray-50'
                }`}
              >
                {/* Comment Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {comment.author.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-gray-900">{comment.author}</h4>
                      {comment.isPremium && (
                        <span className="px-2 py-0.5 rounded-full bg-[#F59E0B] text-white text-xs font-semibold">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{comment.timestamp}</p>
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                  {comment.content}
                </p>

                {/* Comment Actions */}
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs font-semibold">{comment.likes}</span>
                  </button>
                  <button className="text-xs font-semibold text-gray-500 hover:text-[#4F46E5] transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment Input */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <textarea
              placeholder="Share your thoughts..."
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 transition-all resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button className="px-6 py-2 bg-[#4F46E5] text-white rounded-full font-semibold text-sm hover:bg-[#4338CA] transition-colors">
                Post Comment
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
