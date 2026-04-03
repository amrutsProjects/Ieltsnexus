import React, { useState, useEffect } from 'react';
import { apiCall } from '../lib/api';
import { Heart, MessageSquare, Flame, Award, CheckCircle } from 'lucide-react';
import CommunityPostDetail from './CommunityPostDetail';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'trending' | 'band8plus' | 'human_verified'>('trending');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeed();
  }, [filter]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      // Maps to backend query parameters
      const data = await apiCall(`/community/posts?filter=${filter}`);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to fetch community feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (e: React.MouseEvent, postId: string, currentIndex: number) => {
    e.stopPropagation(); // Prevent opening the post details

    // Optimistic UI Update
    const newPosts = [...posts];
    const post = newPosts[currentIndex];
    const wasLiked = post.is_liked;

    post.is_liked = !wasLiked;
    post.likes_count += wasLiked ? -1 : 1;
    setPosts(newPosts);

    try {
      await apiCall(`/community/posts/${postId}/like`, { method: 'POST' });
    } catch (error) {
      // Revert on failure
      post.is_liked = wasLiked;
      post.likes_count += wasLiked ? 1 : -1;
      setPosts([...newPosts]);
    }
  };

  // If a post is selected, render the detail view instead of the feed
  if (selectedPostId) {
    return <CommunityPostDetail postId={selectedPostId} onBack={() => setSelectedPostId(null)} />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24">
      {/* Header & Filters */}
      <div className="bg-white pt-12 pb-4 px-4 shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Community</h1>
        <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-1">
          <button
            onClick={() => setFilter('trending')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'trending' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Flame className="w-4 h-4 mr-2" /> Trending
          </button>
          <button
            onClick={() => setFilter('band8plus')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'band8plus' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Award className="w-4 h-4 mr-2" /> Band 8.0+
          </button>
          <button
            onClick={() => setFilter('human_verified')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'human_verified' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Verified
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="p-4 space-y-4 overflow-y-auto">
        {loading ? (
          // Skeleton Loading States
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded-full w-12"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No posts found for this filter.
          </div>
        ) : (
          posts.map((post, index) => (
            <div
              key={post.id}
              onClick={() => setSelectedPostId(post.id)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{post.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">by {post.author?.name || 'Anonymous'}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                    {post.band_score}
                  </span>
                  {post.is_human_verified && (
                    <span className="text-[10px] uppercase font-bold text-emerald-600 mt-1 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                {post.essay_preview || "Essay preview unavailable..."}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={(e) => toggleLike(e, post.id, index)}
                    className="flex items-center space-x-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span className="text-sm font-medium">{post.likes_count}</span>
                  </button>
                  <div className="flex items-center space-x-1.5 text-gray-400">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments_count}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2.5 py-1 rounded-full">
                  {post.topic?.name || 'General'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}