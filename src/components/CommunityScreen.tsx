import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Heart, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import { PrimaryButton } from './PrimaryButton';
import { apiCall } from '../lib/api';

export interface CommunityPost {
  id: string;
  author: string;
  isPremium: boolean;
  isVerified: boolean;
  time: string;
  title: string;
  score: number | null; // Note: Score can be null
  essayPreview: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

interface CommunityScreenProps {
  onViewPost?: (postId: string) => void;
}

// FALLBACK DATA (Golden Rule)
const DEFAULT_POSTS: CommunityPost[] = [
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
  }
];

export function CommunityScreen({ onViewPost }: CommunityScreenProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('trending');

  const filters = [
    { id: 'trending', label: 'Trending', style: '' },
    { id: 'band8', label: 'Band 8+ Only', style: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-transparent' },
    { id: 'verified', label: 'Human Verified', style: 'bg-[#4F46E5] text-white border-transparent' },
  ];

  // Fetch posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        // Map activeFilter to correct query params
        const queryFilter = activeFilter === 'band8' ? 'band8plus' : activeFilter === 'verified' ? 'human_verified' : 'trending';

        const response = await apiCall(`/community/posts?filter=${queryFilter}`);

        const mappedPosts = response.posts.map((p: any) => ({
          id: p.id,
          author: p.author?.name || null,
          isPremium: p.author?.is_premium || false,
          isVerified: p.is_human_verified || false,
          time: new Date(p.created_at).toLocaleDateString(),
          title: p.title || 'Untitled',
          score: p.band_score,
          essayPreview: p.essay_preview || '',
          likes: p.likes_count || 0,
          comments: p.comments_count || 0,
          isLiked: p.is_liked || false
        }));

        setPosts(mappedPosts.length > 0 ? mappedPosts : DEFAULT_POSTS);
      } catch (error) {
        console.error("Failed to load posts, falling back to prototype data", error);
        setPosts(DEFAULT_POSTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [activeFilter]);

  // Optimistic Like
  const handleLike = async (postId: string) => {
    setPosts(current => current.map(p => {
      if (p.id === postId) {
        const isCurrentlyLiked = p.isLiked;
        return {
          ...p,
          likes: isCurrentlyLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !isCurrentlyLiked
        };
      }
      return p;
    }));

    try {
      await apiCall(`/community/posts/${postId}/like`, { method: 'POST' });
    } catch (error) {
      console.error("Like failed, reverting UI");
      // Revert if API fails
      setPosts(current => current.map(p => {
        if (p.id === postId) {
          const isCurrentlyLiked = p.isLiked;
          return {
            ...p,
            likes: isCurrentlyLiked ? p.likes - 1 : p.likes + 1,
            isLiked: !isCurrentlyLiked
          };
        }
        return p;
      }));
    }
  };

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
              onClick={() => setActiveFilter(filter.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${activeFilter === filter.id
                  ? filter.style || 'bg-[#4F46E5] text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
            >
              {filter.label}
              {filter.id === 'verified' && <CheckCircle className="inline-block w-4 h-4 ml-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="px-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
          </div>
        ) : posts.map((post) => (
          <Card key={post.id}>
            <div className="space-y-4">
              {/* Author Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold uppercase">
                    {/* Safe fallback for avatar initials */}
                    {post.author ? post.author.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{post.author || 'Anonymous User'}</span>
                      {post.isPremium && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs font-bold">
                          Premium
                        </span>
                      )}
                      {post.isVerified && <CheckCircle className="w-4 h-4 text-[#10B981]" fill="#10B981" />}
                    </div>
                    <span className="text-sm text-gray-500">{post.time}</span>
                  </div>
                </div>

                {/* Safe fallback for score color and formatting */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl ${(post.score || 0) >= 8.0 ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white'
                    : (post.score || 0) >= 7.0 ? 'bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white'
                      : 'bg-gradient-to-br from-gray-400 to-gray-600 text-white'
                  }`}>
                  {post.score != null ? post.score.toFixed(1) : 'N/A'}
                </div>
              </div>

              <h3 className="font-bold text-lg text-gray-900">{post.title}</h3>

              <div className="font-mono text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg line-clamp-3">
                {post.essayPreview}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
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