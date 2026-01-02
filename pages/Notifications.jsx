import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { profileService } from '../services/profileService';
import MainLayout from '../components/layout/MainLayout';
import io from 'socket.io-client';
import FeedRightSidebar from '../components/FeedRightSidebar'; // Reuse feed sidebar or generic one

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [profiles, setProfiles] = useState({});
    const [loading, setLoading] = useState(true);

    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const newSocket = io(backendUrl, { transports: ['websocket', 'polling'] });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            if (user?.email) newSocket.emit('identify', user.email);
        });

        newSocket.on('new_notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
        });

        return () => newSocket.disconnect();
    }, [user?.email]);

    useEffect(() => {
        loadNotifications();
    }, [user?.email]);

    const loadNotifications = async () => {
        if (!user?.email) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('social_notifications')
                .select('*')
                .eq('user_email', user.email)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setNotifications(data || []);

            // Load actor profiles
            const actorEmails = [...new Set((data || []).map(n => n.actor_email))];
            const profileMap = {};
            for (const email of actorEmails) {
                const profile = await profileService.getProfile(email);
                if (profile) profileMap[email] = profile;
            }
            setProfiles(profileMap);

            // Mark all as read
            await supabase
                .from('social_notifications')
                .update({ is_read: true })
                .eq('user_email', user.email)
                .eq('is_read', false);
        } catch (err) {
            console.error('Error loading notifications:', err);
        }
        setLoading(false);
    };

    const getIcon = (type) => {
        const iconMap = {
            'connection_request': { icon: 'person_add', color: 'text-blue-500', bg: 'bg-blue-500/10' },
            'connection_accepted': { icon: 'how_to_reg', color: 'text-green-500', bg: 'bg-green-500/10' },
            'like': { icon: 'thumb_up', color: 'text-red-500', bg: 'bg-red-500/10' },
            'comment': { icon: 'chat_bubble', color: 'text-purple-500', bg: 'bg-purple-500/10' },
            'reply': { icon: 'reply', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            'share': { icon: 'share', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
            'mention': { icon: 'alternate_email', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            'message': { icon: 'chat', color: 'text-blue-600', bg: 'bg-blue-600/10' },
        };
        return iconMap[type] || { icon: 'notifications', color: 'text-text-secondary', bg: 'bg-surface-dark' };
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = (now - date) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const handleClick = (notif) => {
        if (notif.post_id || notif.type === 'like' || notif.type === 'comment') {
            navigate('/feed');
        } else if (notif.type === 'connection_request' || notif.type === 'connection_accepted') {
            navigate('/connections');
        } else if (notif.type === 'message') {
            navigate('/chat');
        } else {
            navigate(`/profile/${encodeURIComponent(notif.actor_email)}`);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
                    <button className="text-slate-500 dark:text-[#92a4c9] text-sm font-medium hover:text-primary transition-colors">
                        Mark all as read
                    </button>
                </div>

                <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] overflow-hidden shadow-sm">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-[#232f48] mb-4">notifications_off</span>
                            <p className="text-slate-500 dark:text-[#92a4c9]">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-[#232f48]">
                            {notifications.map(notif => {
                                const iconData = getIcon(notif.type);
                                const actorName = profiles[notif.actor_email]?.full_name || notif.actor_email.split('@')[0];

                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleClick(notif)}
                                        className={`flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-[#192233] ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div
                                                className="w-12 h-12 rounded-full bg-cover bg-center border border-slate-200 dark:border-[#232f48]"
                                                style={{ backgroundImage: `url(${profiles[notif.actor_email]?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.actor_email}`})` }}
                                            />
                                            <div className={`absolute -bottom-1 -right-1 ${iconData.bg} rounded-full p-1 border-2 border-white dark:border-[#111722]`}>
                                                <span className={`material-symbols-outlined text-[16px] ${iconData.color}`}>{iconData.icon}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <p className="text-slate-900 dark:text-white text-sm leading-snug">
                                                <span className="font-bold">{actorName}</span>{' '}
                                                <span className="text-slate-600 dark:text-[#92a4c9]">
                                                    {notif.type === 'connection_request' && 'sent you a connection request'}
                                                    {notif.type === 'connection_accepted' && 'accepted your connection request'}
                                                    {notif.type === 'like' && 'liked your post'}
                                                    {notif.type === 'comment' && 'commented on your post'}
                                                    {notif.type === 'reply' && 'replied to your comment'}
                                                    {notif.type === 'share' && 'shared your post'}
                                                    {notif.type === 'mention' && 'mentioned you'}
                                                    {notif.type === 'message' && 'sent you a message'}
                                                </span>
                                            </p>
                                            {notif.content && (
                                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate italic">
                                                    {notif.content}
                                                </p>
                                            )}
                                            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">{formatTime(notif.created_at)}</p>
                                        </div>
                                        {!notif.is_read && (
                                            <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 mt-2" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Notifications;
