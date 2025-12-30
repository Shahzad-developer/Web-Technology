import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { postService } from '../services/postService';

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
};

const PostCard = ({ post, currentUserEmail, onDelete }) => {
    const navigate = useNavigate();
    const [liked, setLiked] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes_count || 0);
    const [authorProfile, setAuthorProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const profile = await profileService.getProfile(post.author_email);
            setAuthorProfile(profile);
            const hasLiked = await postService.hasLiked(post.id, currentUserEmail);
            setLiked(hasLiked);
        };
        fetchProfile();
    }, [post.author_email, post.id, currentUserEmail]);

    const handleLike = async () => {
        try {
            if (liked) {
                await postService.unlikePost(post.id, currentUserEmail);
                setLikesCount(likesCount - 1);
                setLiked(false);
            } else {
                await postService.likePost(post.id, currentUserEmail);
                setLikesCount(likesCount + 1);
                setLiked(true);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        const checkBookmark = async () => {
            // Placeholder: Check local storage or fetch (if available)
            // For MVP, we'll assume false initially or fetch all bookmarks in parent
        };
    }, []);

    const handleBookmark = async () => {
        try {
            if (isBookmarked) {
                await postService.removeBookmark(post.id, currentUserEmail);
                setIsBookmarked(false);
            } else {
                await postService.bookmarkPost(post.id, currentUserEmail);
                setIsBookmarked(true);
            }
        } catch (error) {
            console.error('Error bookmarking:', error);
        }
    };

    const handleDelete = async () => {
        if (confirm("Delete this post?")) {
            try {
                await postService.deletePost(post.id);
                if (onDelete) onDelete(post.id);
            } catch (err) {
                console.error("Error deleting post:", err);
            }
        }
        setShowMenu(false);
    };

    const handleShare = async () => {
        const action = confirm("Share this post?\nOK to Repost to your feed, Cancel to Copy Link");
        if (action) {
            try {
                await postService.createPost(currentUserEmail, `Reposting: ${post.content}`, post.media_urls);
                alert('Reposted to your feed!');
            } catch (e) {
                console.error("Repost failed", e);
            }
        } else {
            const link = `${window.location.origin}/post/${post.id}`;
            try {
                await navigator.clipboard.writeText(link);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy link:', err);
            }
        }
    };

    const toggleComments = async () => {
        if (!showComments) {
            setLoadingComments(true);
            const fetchedComments = await postService.getComments(post.id);
            setComments(fetchedComments);
            setLoadingComments(false);
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const comment = await postService.addComment(post.id, currentUserEmail, newComment.trim());
            setComments([...comments, comment]);
            setNewComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (confirm("Delete comment?")) {
            try {
                await postService.deleteComment(commentId);
                setComments(comments.filter(c => c.id !== commentId));
            } catch (err) {
                console.error('Error deleting comment:', err);
            }
        }
    };

    return (
        <article className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                        <div
                            className="h-10 w-10 rounded-full bg-cover bg-center cursor-pointer border border-slate-200 dark:border-[#232f48]"
                            onClick={() => navigate(`/profile/${encodeURIComponent(post.author_email)}`)}
                            style={{ backgroundImage: `url(${authorProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_email}`})` }}
                        />
                        <div>
                            <div className="flex items-center gap-2">
                                <h3
                                    className="text-slate-900 dark:text-white font-bold text-base hover:underline cursor-pointer"
                                    onClick={() => navigate(`/profile/${encodeURIComponent(post.author_email)}`)}
                                >
                                    {authorProfile?.full_name || post.author_email.split('@')[0]}
                                </h3>
                                <span className="text-slate-400 dark:text-[#455d8c] text-xs">•</span>
                                <span className="text-slate-500 dark:text-[#92a4c9] text-sm">{formatTime(post.created_at)}</span>
                            </div>
                            <p className="text-slate-500 dark:text-[#92a4c9] text-xs">{authorProfile?.university || 'Student'}</p>
                        </div>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-slate-400 dark:text-[#92a4c9] hover:text-slate-900 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#232f48] transition-colors"
                        >
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-8 bg-white dark:bg-[#1e2736] border border-slate-200 dark:border-[#232f48] shadow-lg rounded-lg py-1 w-36 z-10">
                                {post.author_email === currentUserEmail ? (
                                    <button
                                        onClick={handleDelete}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-[#232f48] flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                        Delete
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setShowMenu(false)}
                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#232f48] flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">flag</span>
                                        Report
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-3 text-slate-800 dark:text-white text-base leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </div>

                {post.media_urls?.length > 0 && (
                    <div className={`mt-4 grid ${post.media_urls.length > 1 ? 'grid-cols-2' : ''} gap-1 rounded-lg overflow-hidden`}>
                        {post.media_urls.map((url, i) => (
                            <div key={i} className="relative">
                                {url.match(/\.(mp4|webm|ogg)$/i) ? (
                                    <video src={url} controls className="w-full max-h-96 object-cover" />
                                ) : (
                                    <img src={url} alt="" className="w-full max-h-96 object-cover hover:opacity-95 transition-opacity cursor-pointer" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t border-slate-100 dark:border-[#232f48] px-4 py-2 flex flex-col bg-slate-50/50 dark:bg-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${liked
                                ? 'text-primary bg-primary/10'
                                : 'text-slate-500 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#192233] hover:text-primary dark:hover:text-white'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${liked ? 'fill-current' : ''}`}>thumb_up</span>
                            <span className="text-sm font-medium">{likesCount || 'Like'}</span>
                        </button>
                        <button
                            onClick={toggleComments}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#192233] hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">comment</span>
                            <span className="text-sm font-medium">{comments.length > 0 ? comments.length : ''} Comment</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#192233] hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">share</span>
                            <span className="text-sm font-medium">Share</span>
                        </button>
                        <button
                            onClick={handleBookmark}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#192233] hover:text-slate-900 dark:hover:text-white transition-colors ${isBookmarked ? 'text-primary dark:text-primary' : ''}`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${isBookmarked ? 'fill-current' : ''}`}>{isBookmarked ? 'bookmark_added' : 'bookmark'}</span>
                        </button>
                    </div>
                </div>

                {showComments && (
                    <div className="mt-3 border-t border-slate-200 dark:border-[#232f48] pt-3 animate-in slide-in-from-top-2">
                        {loadingComments ? (
                            <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {comments.map(comment => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        currentUserEmail={currentUserEmail}
                                        onDelete={handleDeleteComment}
                                    />
                                ))}
                                {comments.length === 0 && <p className="text-sm text-slate-400 text-center py-2">No comments yet.</p>}

                                <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="flex-1 bg-slate-100 dark:bg-[#192233] border border-transparent focus:border-primary rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        className="text-primary hover:text-blue-600 disabled:opacity-50 p-2"
                                    >
                                        <span className="material-symbols-outlined">send</span>
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </article>
    );
};

const CommentItem = ({ comment, currentUserEmail, onDelete }) => {
    const navigate = useNavigate();
    const [author, setAuthor] = useState(null);

    useEffect(() => {
        const loadAuthor = async () => {
            const profile = await profileService.getProfile(comment.author_email);
            setAuthor(profile);
        };
        loadAuthor();
    }, [comment.author_email]);

    return (
        <div className="flex gap-2 items-start">
            <div
                className="h-8 w-8 rounded-full bg-cover bg-center cursor-pointer shrink-0"
                onClick={() => navigate(`/profile/${encodeURIComponent(comment.author_email)}`)}
                style={{ backgroundImage: `url(${author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author_email}`})` }}
            />
            <div className="bg-slate-100 dark:bg-[#192233] rounded-lg p-3 flex-1 group">
                <div className="flex justify-between items-baseline">
                    <span
                        className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer hover:underline"
                        onClick={() => navigate(`/profile/${encodeURIComponent(comment.author_email)}`)}
                    >
                        {author?.full_name || comment.author_email.split('@')[0]}
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                        {comment.author_email === currentUserEmail && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete comment"
                            >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{comment.content}</p>
            </div>
        </div>
    );
};

export default PostCard;
