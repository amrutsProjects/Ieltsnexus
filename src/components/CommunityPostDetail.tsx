import { useState, useEffect } from 'react';
import { Card } from './Card';
import { ArrowLeft, Share2, Heart, Bookmark, Play, Loader2 } from 'lucide-react';
import { apiCall } from '../lib/api';

interface CommunityPostDetailProps {
  postId: string; // NEW REQUIRED PROP
  onBack: () => void;
  onTryTest?: (topicId: string) => void;
}

export function CommunityPostDetail({ postId, onBack, onTryTest }: CommunityPostDetailProps) {
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Optimistic UI state
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        setIsLoading(true);
        const response = await apiCall(`/community/posts/${postId}`);
        setPost(response.post);
        setLikeCount(response.post.likes_count || 0);
        setIsLiked(response.post.is_liked || false);
        setIsSaved(response.post.is_saved || false);
      } catch (error) {
        console.error("Failed to load post detail", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (postId) fetchPostDetail();
  }, [postId]);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    try {
      await apiCall(`/community/posts/${postId}/like`, { method: 'POST' });
    } catch (error) {
      console.error("Like failed");
      setIsLiked(isLiked); // Revert
      setLikeCount(isLiked ? likeCount : likeCount - 1); // Revert
    }
  };

  const handleSave = async () => {
    setIsSaved(!isSaved);
    try {
      await apiCall(`/community/posts/${postId}/save`, { method: 'POST' });
    } catch (error) {
      setIsSaved(isSaved);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      setIsPosting(true);
      const response = await apiCall(`/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment, parent_id: null })
      });

      // Update local state to show comment immediately
      const newCommentObj = {
        id: Math.random().toString(),
        author: { name: 'You', is_premium: false },
        content: newComment,
        created_at: new Date().toISOString(),
        likes_count: 0
      };

      setPost((prev: any) => ({
        ...prev,
        comments: [newCommentObj, ...(prev?.comments || [])]
      }));
      setNewComment('');
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsPosting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  // Fallback rendering if post fails to load
  if (!post) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-gray-500 mb-4">Post not found or failed to load.</p>
        <button onClick={onBack} className="px-6 py-2 bg-[#4F46E5] text-white rounded-full">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="font-bold text-gray-900 truncate flex-1 ml-4">{post.title}</h2>
          <button className="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share2 className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="px-6 pt-6 space-y-4">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center">
              <span className="text-lg font-bold text-white">
                {post.author?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{post.author?.name || 'User'}</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#F59E0B] text-xs font-semibold">
                  Band {post.band_score?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-500">{new Date(post.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-4 p-3 bg-[#EEF2FF] rounded-xl">
            <div className="text-xs font-semibold text-[#4F46E5] mb-1">Topic: {post.topic?.name}</div>
            <p className="text-sm text-gray-700 leading-relaxed font-semibold">
              {post.prompt_text || "Topic details not provided."}
            </p>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Essay Submitted</h4>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed font-mono whitespace-pre-wrap">
              {post.essay_text}
            </div>
          </div>
        </Card>

        {/* Sticky Interaction Row */}
        <div className="sticky top-[73px] z-10 bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
              <span className="font-semibold text-sm">
                {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
              </span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isSaved ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-[#4F46E5]' : ''}`} />
              <span className="font-semibold text-sm">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => onTryTest?.(post.topic?.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full border-2 border-[#4F46E5] text-[#4F46E5] font-semibold text-sm hover:bg-[#EEF2FF] transition-colors"
            >
              <Play className="w-4 h-4" />
              Try This Test
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <Card>
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Comments ({post.comments?.length || 0})
          </h3>

          <div className="space-y-4">
            {post.comments?.map((comment: any) => (
              <div key={comment.id} className="p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{comment.author?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-gray-900">{comment.author?.name || 'User'}</h4>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-2">{comment.content}</p>
              </div>
            ))}

            {(!post.comments || post.comments.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first!</p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#4F46E5] transition-all resize-none"
              rows={3}
              disabled={isPosting}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handlePostComment}
                disabled={isPosting || !newComment.trim()}
                className="px-6 py-2 bg-[#4F46E5] text-white rounded-full font-semibold text-sm hover:bg-[#4338CA] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isPosting && <Loader2 className="w-4 h-4 animate-spin" />}
                Post Comment
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}