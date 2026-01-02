import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { connectionService } from '../services/connectionService';
import { postService } from '../services/postService';
import { supabase } from '../supabase';
import PostCard from '../components/PostCard';
import MainLayout from '../components/layout/MainLayout';
import FeedRightSidebar from '../components/FeedRightSidebar';
import io from 'socket.io-client';

const Feed = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [academicUpdates, setAcademicUpdates] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef(null);
    const [socket, setSocket] = useState(null);
    const [campusNews, setCampusNews] = useState([
        {
            id: 'news-1',
            title: 'Annual Tech Symposium 2026',
            category: 'Events',
            date: 'Jan 15, 2026',
            content: 'Join us for the biggest tech gathering of the year featuring industry experts from Google and Microsoft.',
            image: 'https://images.unsplash.com/photo-1540575861501-7c0011e7a48f?auto=format&fit=crop&q=80&w=800',
            author: 'Uni Tech Club'
        },
        {
            id: 'news-2',
            title: 'New Library Hours Announced',
            category: 'Academic',
            date: 'Jan 02, 2026',
            content: 'To support students during finals week, the central library will now remain open 24/7 starting Monday.',
            image: 'https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=800',
            author: 'Student Affairs'
        },
        {
            id: 'news-3',
            title: 'Campus Sustainability Initiative',
            category: 'Campus',
            date: 'Dec 28, 2025',
            content: 'The university is launching a new green policy focusing on zero-waste cafeterias and renewable energy.',
            image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
            author: 'Green Council'
        }
    ]);

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const newSocket = io(backendUrl, { transports: ['websocket', 'polling'] });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            if (user?.email) newSocket.emit('identify', user.email);
        });

        return () => newSocket.disconnect();
    }, [user?.email]);

    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (user?.email) {
            loadFeed(activeTab);
        }
    }, [user?.email, activeTab]);

    useEffect(() => {
        if (!user?.email) return;

        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                const newPost = payload.new;
                if (activeTab === 'all') {
                    setPosts(currentPosts => [newPost, ...currentPosts]);
                } else if (activeTab === 'following') {
                    // Check if the author is a connection or the current user
                    const isConnected = connections.some(c => c.connected_email === newPost.author_email);
                    if (isConnected || newPost.author_email === user.email) {
                        setPosts(currentPosts => [newPost, ...currentPosts]);
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.email, activeTab, connections]);

    const loadFeed = async (filter = 'all') => {
        setLoading(true);
        try {
            const [profileData, connectionData, trendingData, eventsData] = await Promise.all([
                profileService.getOrCreateProfile(user.email),
                connectionService.getConnections(user.email),
                postService.getTrendingPosts(3),
                postService.getEvents()
            ]);
            setProfile(profileData);
            setConnections(connectionData);
            setTrendingPosts(trendingData);
            setAcademicUpdates(eventsData);

            const connectedEmails = connectionData.map(c => c.connected_email);
            // Include self in following for a better UX, but connection emails are the priority
            if (filter === 'following' && connectedEmails.length === 0) {
                setPosts([]);
                return;
            }

            connectedEmails.push(user.email);

            const apiFilter = filter === 'following' ? 'connections' : 'all';

            const feedPosts = await postService.getFeedPosts(connectedEmails, apiFilter, 20);
            setPosts(feedPosts);
        } catch (err) {
            console.error('Error loading feed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setMediaFile(file);
        setMediaType(file.type);
        const previewUrl = URL.createObjectURL(file);
        setMediaPreview(previewUrl);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !mediaFile) return;
        setIsPosting(true);
        try {
            let mediaUrls = [];
            if (mediaFile) {
                const url = await postService.uploadMedia(user.email, mediaFile);
                if (url) mediaUrls.push(url);
            }

            const newPost = await postService.createPost(user.email, newPostContent.trim(), mediaUrls, 'text', 'connections', socket);
            setPosts([{ ...newPost, author_profile: profile }, ...posts]);

            setNewPostContent('');
            setMediaFile(null);
            setMediaPreview(null);
            setMediaType('');
        } catch (err) {
            console.error('Error creating post:', err);
        }
        setIsPosting(false);
    };

    const handleDeletePost = (postId) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    return (
        <MainLayout
            rightSidebar={
                <FeedRightSidebar
                    academicUpdates={academicUpdates}
                    connections={connections}
                    trendingPosts={trendingPosts}
                />
            }
        >
            {/* Tabs/Filter */}
            {/* Header & Tabs */}
            <div className="sticky top-0 z-30 bg-[#f6f6f8] dark:bg-[#0b141a] pt-1 pb-4 -mx-2 px-2 md:-mx-0 md:px-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">News Feed</h1>
                        <p className="text-sm text-slate-500 dark:text-[#92a4c9]">Stay updated with your campus network</p>
                    </div>

                    <div className="bg-white dark:bg-[#111722] p-1 rounded-xl inline-flex self-start md:self-auto shadow-sm border border-slate-200 dark:border-[#232f48]">
                        {[
                            { id: 'all', label: 'All Posts' },
                            { id: 'following', label: 'Following' },
                            { id: 'major', label: 'My Major' },
                            { id: 'news', label: 'Campus News' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-slate-500 dark:text-[#92a4c9] hover:bg-slate-50 dark:hover:bg-[#1e2736] hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Composer */}
            <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] p-4 shadow-sm">
                <div className="flex gap-4">
                    <div
                        className="h-10 w-10 rounded-full bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700"
                        onClick={() => navigate('/profile')}
                        style={{ backgroundImage: `url(${profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`})` }}
                    />
                    <div className="flex-1">
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-[#192233] border border-slate-200 dark:border-[#324467] rounded-lg p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#455d8c] resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base outline-none"
                            placeholder="Start a post, share a resource, or ask a question..."
                            rows="2"
                        />

                        {/* Media Preview */}
                        {mediaPreview && (
                            <div className="relative mt-2 rounded-lg overflow-hidden max-h-60 w-fit group">
                                {mediaType.startsWith('video') ? (
                                    <video src={mediaPreview} controls className="max-h-60 rounded-lg" />
                                ) : (
                                    <img src={mediaPreview} alt="Preview" className="max-h-60 rounded-lg object-contain" />
                                )}
                                <button
                                    onClick={() => {
                                        setMediaFile(null);
                                        setMediaPreview(null);
                                        setMediaType('');
                                    }}
                                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-3">
                            <div className="flex gap-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept="image/*,video/*"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-slate-400 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48] rounded-full hover:text-primary transition-colors tooltip"
                                    title="Image/Video"
                                >
                                    <span className="material-symbols-outlined text-[20px]">perm_media</span>
                                </button>
                                <button className="p-2 text-slate-400 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48] rounded-full hover:text-primary transition-colors tooltip" title="Document">
                                    <span className="material-symbols-outlined text-[20px]">description</span>
                                </button>
                                <button className="p-2 text-slate-400 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48] rounded-full hover:text-primary transition-colors tooltip" title="Poll">
                                    <span className="material-symbols-outlined text-[20px]">poll</span>
                                </button>
                            </div>
                            <button
                                onClick={handleCreatePost}
                                disabled={(!newPostContent.trim() && !mediaFile) || isPosting}
                                className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-1.5 px-5 rounded-lg transition-colors shadow-md shadow-primary/20 flex items-center gap-2"
                            >
                                {isPosting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                    'Post'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed Posts */}
            {loading ? (
                <div className="py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : activeTab === 'news' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campusNews.map(news => (
                        <div key={news.id} className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                            <div className="h-40 bg-cover bg-center transition-transform group-hover:scale-105 duration-500" style={{ backgroundImage: `url(${news.image})` }} />
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">{news.category}</span>
                                    <span className="text-xs text-slate-400">{news.date}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{news.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-[#92a4c9] line-clamp-2 mb-4">{news.content}</p>
                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#232f48]">
                                    <span className="text-xs font-medium text-slate-400 italic">By {news.author}</span>
                                    <button className="text-primary text-xs font-bold hover:underline">Read More</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] p-12 text-center shadow-sm">
                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-[#232f48] mb-4">post_add</span>
                    <h3 className="text-slate-900 dark:text-white font-bold text-lg">No posts yet</h3>
                    <p className="text-slate-500 dark:text-[#92a4c9]">Be the first to share something with your network!</p>
                </div>
            ) : (
                posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUserEmail={user.email}
                        onDelete={handleDeletePost}
                    />
                ))
            )}
        </MainLayout>
    );
};

export default Feed;
