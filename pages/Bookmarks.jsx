import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import MainLayout from '../components/layout/MainLayout';
import FeedRightSidebar from '../components/FeedRightSidebar';

const Bookmarks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email) {
            fetchBookmarks();
        }
    }, [user?.email]);

    const fetchBookmarks = async () => {
        setLoading(true);
        try {
            const posts = await postService.getBookmarks(user.email);
            setBookmarks(posts);
        } catch (error) {
            console.error("Error fetching bookmarks", error);
        }
        setLoading(false);
    };

    return (
        <MainLayout rightSidebar={<FeedRightSidebar />}>
            <div className="flex flex-col h-full relative">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bookmarks</h2>
                </div>

                <div className="flex flex-col gap-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                        </div>
                    ) : bookmarks.length > 0 ? (
                        bookmarks.map(post => (
                            <div key={post.id} className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {(post.author_email && post.author_email[0] ? post.author_email[0].toUpperCase() : 'U')}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{post.author_email}</p>
                                        <p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 mb-4">{post.content}</p>
                                {post.media_urls && post.media_urls.length > 0 && (
                                    <div className="mb-4 rounded-lg overflow-hidden">
                                        <img src={post.media_urls[0]} alt="Post media" className="w-full h-auto object-cover max-h-96" />
                                    </div>
                                )}
                                <div className="flex gap-4">
                                    <button onClick={() => navigate(`/feed`)} className="text-primary text-sm font-medium hover:underline">View in Feed</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48]">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">bookmark_border</span>
                            <p className="text-slate-500 dark:text-slate-400">No saved posts yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Bookmarks;
