import { Card } from './Card';
import { Heart, MessageCircle, CheckCircle } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';

interface CommunityPost {
  id: string;
  author: string;
  isPremium: boolean;
  isVerified: boolean;
  time: string;
  title: string;
  score: number;
  essayPreview: string;
  likes: number;
  comments: number;
}

interface CommunityScreenProps {
  onViewPost?: (postId: string) => void;
}

export function CommunityScreen({ onViewPost }: CommunityScreenProps) {
  const filters = [
    { id: 'trending', label: 'Trending', active: true, style: '' },
    { id: 'band8', label: 'Band 8+ Only', active: false, style: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' },
    { id: 'verified', label: 'Human Verified', active: false, style: 'bg-[#4F46E5] text-white' },
  ];

  const posts: CommunityPost[] = [
    {
      id: '1',
      author: 'Sarah Chen',
      isPremium: true,
      isVerified: true,
      time: '2h ago',
      title: 'Writing Task 2: Environmental Policy',
      score: 7.5,
      essayPreview: 'Climate change is one of the most pressing issues facing our world today. Many people believes that individual actions...',
      likes: 42,
      comments: 12,
    },
    {
      id: '2',
      author: 'Michael Torres',
      isPremium: true,
      isVerified: false,
      time: '5h ago',
      title: 'Writing Task 2: Technology in Education',
      score: 8.0,
      essayPreview: 'In recent years, technology has transformed the way students learn. Some argue that traditional teaching methods...',
      likes: 67,
      comments: 23,
    },
    {
      id: '3',
      author: 'Priya Sharma',
      isPremium: false,
      isVerified: false,
      time: '1d ago',
      title: 'Writing Task 2: Work-Life Balance',
      score: 7.0,
      essayPreview: 'Modern society places increasing demands on workers. While some people believe that longer working hours...',
      likes: 28,
      comments: 8,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h2 className="text-3xl font-bold text-gray-900">Community Results</h2>
        <p className="text-gray-600 mt-1">Learn from high-scoring essays</p>
      </div>

      {/* Filters */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter.active 
                  ? 'bg-[#4F46E5] text-white' 
                  : filter.style || 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {filter.label}
              {filter.id === 'verified' && (
                <CheckCircle className="inline-block w-4 h-4 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="px-6 space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <div className="space-y-4">
              {/* Author Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold">
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{post.author}</span>
                      {post.isPremium && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold">
                          Premium
                        </span>
                      )}
                      {post.isVerified && (
                        <CheckCircle className="w-4 h-4 text-[#10B981]" fill="#10B981" />
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{post.time}</span>
                  </div>
                </div>

                {/* Score Badge */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl ${
                  post.score >= 8.0 
                    ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white' 
                    : post.score >= 7.0
                    ? 'bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white'
                    : 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
                }`}>
                  {post.score}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-bold text-lg text-gray-900">{post.title}</h3>

              {/* Essay Preview with Highlights */}
              <div className="font-mono text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                {post.essayPreview.split('believes').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="border-b-2 border-red-500">believes</span>
                    )}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-semibold">{post.likes}</span>
                  </button>
                  <button 
                    onClick={() => onViewPost?.(post.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-[#4F46E5] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">{post.comments}</span>
                  </button>
                </div>
                
                <PrimaryButton variant="secondary" className="h-10 px-4">
                  Try This Test
                </PrimaryButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}