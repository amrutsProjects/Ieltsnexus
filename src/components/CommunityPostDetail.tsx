import React, { useState, useEffect } from 'react';
import { apiCall } from '../lib/api';
import { ChevronLeft, Heart, MessageSquare, Send, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface CommunityPostDetailProps {
  postId: string;
  onBack: () => void;
}

export default function CommunityPostDetail({ postId, onBack }: CommunityPostDetailProps) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiCall(`/community/posts/${postId}`);
      if (data.post) {
        setPost(data.post);
      } else {
        throw new Error("Post data not found");
      }
    } catch (err: any) {
      console.error('Failed to fetch post details:', err);
      setError('Failed to load post details. The post might have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    // Optimistic UI update
    const wasLiked = post.is_liked;
    setPost({
      ...post,
      is_liked: !wasLiked,
      likes_count: post.likes_count + (wasLiked ? -1 : 1)
    });

    try {
      await apiCall(`/community/posts/${postId}/like`, { method: 'POST' });
    } catch (err) {
      // Revert on failure
      setPost({
        ...post,
        is_liked: wasLiked,
        likes_count: post.likes_count + (wasLiked ? 1 : -1)
      });
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);
      await apiCall(`/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: commentText, parent_id: null })
      });
      setCommentText('');
      await fetchPostDetails(); // Refresh to show new comment
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500">Loading post details...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <p className="text-gray-700">{error}</p>
        <button onClick={onBack} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div>
          <h2 className="font-semibold text-gray-900 line-clamp-1">{post.title}</h2>
          <p className="text-xs text-gray-500">by {post.author?.name || 'Anonymous'}</p>
        </div>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto">

        {/* Core Content Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">

          {/* Top Badges */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-50">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Overall Band</span>
                <span className="text-3xl font-bold text-indigo-600">{post.band_score}</span>
              </div>
              {post.is_human_verified && (
                <span className="flex items-center text-xs font-bold uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg ml-2">
                  <CheckCircle className="w-4 h-4 mr-1.5" /> Human Verified
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {post.topic?.name || 'General Topic'}
            </span>
          </div>

          {/* 1. The Question */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">The Question</h3>
            <div className="bg-blue-50/50 border-l-4 border-blue-400 p-4 rounded-r-xl">
              <p className="text-gray-800 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {post.prompt_text || "Prompt text unavailable."}
              </p>
            </div>
          </div>

          {/* 2. Original Answer */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">User's Submission</h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="text-gray-800 leading-relaxed text-[15px] whitespace-pre-wrap">
                {post.essay_text}
              </div>
            </div>
          </div>

          {/* 3. AI Response & Feedback */}
          {post.ai_corrections && post.ai_corrections.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-indigo-500 flex items-center uppercase tracking-wider mb-3">
                <Sparkles className="w-4 h-4 mr-1.5" /> AI Feedback & Corrections
              </h3>
              <div className="space-y-3">
                {post.ai_corrections.map((correction: any, idx: number) => (
                  <div key={idx} className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50">
                    <div className="flex flex-col space-y-1.5 mb-2">
                      {/* Show original mistake crossed out in red */}
                      {correction.original_text && (
                        <span className="text-rose-500 line-through text-sm decoration-rose-300">
                          {correction.original_text}
                        </span>
                      )}
                      {/* Show the suggested fix in green */}
                      {correction.corrected_text && (
                        <span className="text-emerald-600 font-medium text-sm">
                          {correction.corrected_text}
                        </span>
                      )}
                    </div>
                    {/* Show the AI's explanation */}
                    {correction.explanation && (
                      <p className="text-gray-600 text-sm mt-2 pt-2 border-t border-indigo-100/50">
                        {correction.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center space-x-6 px-2">
          <button onClick={handleLike} className="flex items-center space-x-2 group">
            <Heart className={`w-6 h-6 transition-colors ${post.is_liked ? 'fill-rose-500 text-rose-500' : 'text-gray-400 group-hover:text-rose-500'}`} />
            <span className="text-gray-600 font-medium">{post.likes_count}</span>
          </button>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-gray-400" />
            <span className="text-gray-600 font-medium">{post.comments?.length || 0}</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Comments</h3>

          <div className="space-y-4 mb-6">
            {(!post.comments || post.comments.length === 0) ? (
              <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-xl">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              post.comments.map((comment: any) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-medium text-xs">
                      {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{comment.author?.name || 'Anonymous'}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Input */}
          <div className="flex items-end space-x-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a constructive comment..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-12 transition-all duration-200"
              rows={1}
            />
            <button
              onClick={handleAddComment}
              disabled={isSubmitting || !commentText.trim()}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}