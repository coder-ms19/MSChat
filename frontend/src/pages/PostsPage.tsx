import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, MessageCircle, Trash2, Send, X, ArrowLeft } from 'lucide-react';
import api from '../api';

interface Post {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    author: {
        id: string;
        username: string;
        email: string;
    };
    _count?: {
        likes: number;
        comments: number;
    };
    likes?: any[];
    comments?: Comment[];
}

interface Comment {
    id: string;
    text: string;
    postId: string;
    userId: string;
    parentId: string | null;
    createdAt: string;
    user: {
        id: string;
        username: string;
        email: string;
    };
    replies?: Comment[];
    _count?: {
        replies: number;
    };
}

export default function PostsPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [loadedReplies, setLoadedReplies] = useState<Record<string, Comment[]>>({});
    const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const userData = JSON.parse(userStr);
        setUser(userData);
        fetchPosts();
    }, [navigate]);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/post');
            setPosts(res.data);
        } catch (e) {
            console.error('Failed to fetch posts', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) return;
        try {
            await api.post('/post', newPost);
            setNewPost({ title: '', content: '' });
            setShowCreateModal(false);
            fetchPosts();
        } catch (e) {
            console.error('Failed to create post', e);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/post/${postId}`);
            fetchPosts();
        } catch (e) {
            console.error('Failed to delete post', e);
        }
    };

    const handleViewPost = async (post: Post) => {
        setSelectedPost(post);
        try {
            const res = await api.get(`/posts/${post.id}/comments`);
            setComments(res.data);
        } catch (e) {
            console.error('Failed to fetch comments', e);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !selectedPost) return;
        try {
            await api.post(`/posts/${selectedPost.id}/comments`, {
                text: newComment,
                parentId: replyTo
            });
            setNewComment('');
            setReplyTo(null);
            const res = await api.get(`/posts/${selectedPost.id}/comments`);
            setComments(res.data);
        } catch (e) {
            console.error('Failed to add comment', e);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            await api.delete(`/posts/comments/${commentId}`);
            if (selectedPost) {
                const res = await api.get(`/posts/${selectedPost.id}/comments`);
                setComments(res.data);
            }
        } catch (e) {
            console.error('Failed to delete comment', e);
        }
    };

    const handleLoadReplies = async (commentId: string) => {
        setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
        try {
            const res = await api.get(`/posts/comments/${commentId}/replies`);
            setLoadedReplies(prev => ({ ...prev, [commentId]: res.data }));
        } catch (e) {
            console.error('Failed to load replies', e);
        } finally {
            setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
        }
    };

    const renderComment = (comment: Comment, depth: number = 0) => {
        const hasReplies = comment._count && comment._count.replies > 0;
        const repliesLoaded = loadedReplies[comment.id];
        const isLoadingReplies = loadingReplies[comment.id];
        const isReplyingToThis = replyTo === comment.id;

        return (
            <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${depth > 0 ? 'ml-8 md:ml-12' : ''} mb-4`}
            >
                <div className="bg-[#1e293b]/60 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <span className="font-semibold text-blue-400">{comment.user.username}</span>
                            <span className="text-xs text-slate-500 ml-2">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        {comment.userId === user?.id && (
                            <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                    <p className="text-slate-200 text-sm mb-2">{comment.text}</p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setReplyTo(isReplyingToThis ? null : comment.id)}
                            className={`text-xs ${isReplyingToThis ? 'text-purple-400' : 'text-blue-400'} hover:text-blue-300`}
                        >
                            {isReplyingToThis ? 'Cancel Reply' : 'Reply'}
                        </button>
                        {hasReplies && !repliesLoaded && (
                            <button
                                onClick={() => handleLoadReplies(comment.id)}
                                disabled={isLoadingReplies}
                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 disabled:opacity-50"
                            >
                                {isLoadingReplies ? (
                                    <>
                                        <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        Load {comment._count!.replies} {comment._count!.replies === 1 ? 'reply' : 'replies'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Inline Reply Input */}
                {isReplyingToThis && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 ml-4"
                    >
                        <div className="bg-[#0f172a] border border-blue-500/30 rounded-xl p-3">
                            <div className="text-xs text-blue-400 mb-2">
                                Replying to <span className="font-semibold">{comment.user.username}</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Write your reply..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleAddComment();
                                        }
                                        if (e.key === 'Escape') {
                                            setReplyTo(null);
                                            setNewComment('');
                                        }
                                    }}
                                    className="flex-1 bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
                                    autoFocus
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {repliesLoaded && repliesLoaded.length > 0 && (
                    <div className="mt-2">
                        {repliesLoaded.map(reply => renderComment(reply, depth + 1))}
                    </div>
                )}
            </motion.div>
        );
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#0a0a0f] text-white">
            {/* Header */}
            <div className="bg-[#1e293b]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Posts
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">Create Post</span>
                    </button>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-[#1e293b]/40 rounded-2xl h-64 animate-pulse" />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <MessageCircle className="w-10 h-10 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No posts yet</h2>
                        <p className="text-slate-400 mb-6">Be the first to create a post!</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                            Create Your First Post
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all cursor-pointer group"
                                onClick={() => handleViewPost(post)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            by {post.author?.username || 'Unknown'}
                                        </p>
                                    </div>
                                    {post.authorId === user.id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePost(post.id);
                                            }}
                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-slate-300 text-sm mb-4 line-clamp-3">
                                    {post.content}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <Heart size={16} />
                                        <span>{post._count?.likes || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle size={16} />
                                        <span>{post._count?.comments || 0}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Create New Post</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Post Title"
                                value={newPost.title}
                                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-blue-500 transition-all"
                            />
                            <textarea
                                placeholder="What's on your mind?"
                                value={newPost.content}
                                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-blue-500 transition-all resize-none"
                                rows={6}
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 border-2 border-white/10 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreatePost}
                                    disabled={!newPost.title.trim() || !newPost.content.trim()}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Post
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Post Detail Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedPost(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">{selectedPost.title}</h2>
                                    <p className="text-sm text-slate-400">
                                        by {selectedPost.author?.username || 'Unknown'} • {new Date(selectedPost.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <p className="text-slate-200 mb-6 whitespace-pre-wrap">{selectedPost.content}</p>

                                {/* Comments Section */}
                                <div className="border-t border-white/10 pt-6">
                                    <h3 className="text-xl font-bold mb-4">Comments ({comments.length})</h3>

                                    {/* Add Comment */}
                                    {!replyTo && (
                                        <div className="mb-6">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Add a comment..."
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleAddComment();
                                                        }
                                                    }}
                                                    className="flex-1 bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition-all"
                                                />
                                                <button
                                                    onClick={handleAddComment}
                                                    disabled={!newComment.trim()}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Comments List */}
                                    <div className="space-y-4">
                                        {comments.length === 0 ? (
                                            <p className="text-center text-slate-400 py-8">No comments yet. Be the first to comment!</p>
                                        ) : (
                                            comments.map(comment => renderComment(comment))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
