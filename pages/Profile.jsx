import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { connectionService } from '../services/connectionService';
import { postService } from '../services/postService';
import MainLayout from '../components/layout/MainLayout';
import FeedRightSidebar from '../components/FeedRightSidebar';

const Profile = () => {
    const { email: paramEmail } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const profileEmail = paramEmail ? decodeURIComponent(paramEmail) : user?.email;
    const isOwnProfile = profileEmail === user?.email;

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('not_connected');
    const [suggestedConnections, setSuggestedConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});

    useEffect(() => {
        if (profileEmail) loadProfile();
    }, [profileEmail]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = isOwnProfile
                ? await profileService.getOrCreateProfile(profileEmail)
                : await profileService.getProfile(profileEmail);
            setProfile(data);
            setEditData(data || {});

            if (!isOwnProfile) {
                const status = await connectionService.getConnectionStatus(user.email, profileEmail);
                setConnectionStatus(status.status);
            }

            const userPosts = await postService.getUserPosts(profileEmail);
            setPosts(userPosts);

            const suggestions = await profileService.getSuggestedProfiles(user.email);
            setSuggestedConnections(suggestions);
        } catch (err) {
            console.error('Error loading profile:', err);
        }
        setLoading(false);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = await profileService.uploadPhoto(user.email, file, 'avatar');
        if (url) {
            setProfile({ ...profile, avatar_url: url });
            await profileService.updateProfile(user.email, { avatar_url: url });
        }
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = await profileService.uploadPhoto(user.email, file, 'cover');
        if (url) {
            setProfile({ ...profile, cover_url: url });
            await profileService.updateProfile(user.email, { cover_url: url });
        }
    };

    const handleConnect = async () => {
        if (connectionStatus === 'not_connected') {
            await connectionService.sendRequest(user.email, profileEmail);
            setConnectionStatus('request_sent');
        } else if (connectionStatus === 'request_received') {
            await connectionService.acceptRequest(profileEmail, user.email);
            setConnectionStatus('connected');
        }
    };

    const handleSaveProfile = async () => {
        await profileService.updateProfile(user.email, editData);
        setProfile({ ...profile, ...editData });
        setShowEditModal(false);
    };

    const getConnectionButton = () => {
        switch (connectionStatus) {
            case 'connected':
                return { text: 'Connected', icon: 'check_circle', className: 'bg-green-600 hover:bg-green-700 text-white' };
            case 'request_sent':
                return { text: 'Pending', icon: 'schedule', className: 'bg-yellow-600 hover:bg-yellow-700 text-white' };
            case 'request_received':
                return { text: 'Accept Request', icon: 'person_add', className: 'bg-primary hover:bg-blue-600 text-white' };
            default:
                return { text: 'Connect', icon: 'person_add', className: 'bg-primary hover:bg-blue-600 text-white' };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    const connectionBtn = getConnectionButton();

    return (
        <MainLayout showSidebar={true}>
            <div className="w-full max-w-[1280px] mx-auto">
                {/* Profile Header Block */}
                <div className="flex flex-col bg-white dark:bg-[#1e2736] rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-[#232f48] mb-6">
                    {/* Cover Image */}
                    <div
                        className="relative h-48 md:h-64 w-full bg-cover bg-center group"
                        style={{
                            backgroundImage: profile?.cover_url
                                ? `url(${profile.cover_url})`
                                : 'linear-gradient(0deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBPNw2vOwFT5vF2sx4iFsuQ4SKsWIMSXfuR2fk0TKe2wx4bP-WMfVmSolGG-NZExsu4teg5A9dvl-bYHMhR_daBBZqeGXaqvE77Xbi3CFh1dEf4xrPylj_UaqO2jQRDwxLCU0NsVgiMQsNXH6L8eOltYLBrsd-MZG2AyeHURi1ObsHDlHZe1asF95crmTRjF6_zc1teYBOdA28cgHBzKUvvXCR_vARr8qzjJxgAe5R5GctmsRu-WZj6BbOxACEI6gBhHNx8bMm2iz4")'
                        }}
                    >
                        {isOwnProfile && (
                            <>
                                <button
                                    onClick={() => coverInputRef.current?.click()}
                                    className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                            </>
                        )}
                    </div>

                    {/* Profile Info & Actions */}
                    <div className="px-6 pb-6 pt-0 relative">
                        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                            {/* Avatar & Text */}
                            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start -mt-12 md:-mt-16 w-full">
                                <div className="relative group">
                                    <div
                                        className="size-32 rounded-full border-4 border-white dark:border-[#1e2736] bg-cover bg-center shadow-lg bg-white dark:bg-slate-800"
                                        style={{ backgroundImage: `url(${profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileEmail}`})` }}
                                    />
                                    {isOwnProfile && (
                                        <>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-1 right-1 bg-primary text-white rounded-full p-2 border-4 border-white dark:border-[#1e2736] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="material-symbols-outlined text-lg">edit</span>
                                            </button>
                                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                        </>
                                    )}
                                    <div className="absolute bottom-1 right-1 size-6 bg-green-500 border-4 border-white dark:border-[#1e2736] rounded-full group-hover:opacity-0 transition-opacity" title="Available"></div>
                                </div>
                                <div className="flex flex-col pt-2 md:pt-16 gap-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{profile?.full_name || profileEmail.split('@')[0]}</h1>
                                        <span className="material-symbols-outlined text-primary text-[20px]" title="Verified Student">verified</span>
                                    </div>
                                    <p className="text-slate-500 dark:text-[#92a4c9] text-base font-medium">{profile?.headline || 'Student'}</p>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 dark:text-[#92a4c9]/80">
                                        {profile?.location && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                {profile.location}
                                            </span>
                                        )}
                                        {profile?.university && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">school</span>
                                                {profile.university}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 md:mb-2">
                                {isOwnProfile ? (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="flex-1 md:flex-none h-10 px-6 bg-slate-100 dark:bg-[#232f48] hover:bg-slate-200 dark:hover:bg-[#2d3b55] text-slate-900 dark:text-white border border-slate-200 dark:border-[#3b4c6b] rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleConnect}
                                            className={`flex-1 md:flex-none h-10 px-6 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 ${connectionBtn.className}`}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">{connectionBtn.icon}</span>
                                            {connectionBtn.text}
                                        </button>
                                        <button
                                            onClick={() => navigate(`/chat?email=${profileEmail}`)}
                                            className="flex-1 md:flex-none h-10 px-6 bg-slate-100 dark:bg-[#232f48] hover:bg-slate-200 dark:hover:bg-[#2d3b55] text-slate-900 dark:text-white border border-slate-200 dark:border-[#3b4c6b] rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">mail</span>
                                            Message
                                        </button>
                                    </>
                                )}
                                <button className="size-10 flex items-center justify-center bg-slate-100 dark:bg-[#232f48] hover:bg-slate-200 dark:hover:bg-[#2d3b55] text-slate-900 dark:text-white border border-slate-200 dark:border-[#3b4c6b] rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Navigation Tabs */}
                    <div className="px-6 border-t border-slate-200 dark:border-[#232f48]">
                        <div className="flex gap-8 overflow-x-auto no-scrollbar">
                            {['profile', 'posts', 'portfolio', 'timeline'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 text-sm font-bold tracking-wide whitespace-nowrap border-b-2 transition-colors ${activeTab === tab
                                        ? 'border-primary text-slate-900 dark:text-white'
                                        : 'border-transparent text-slate-500 dark:text-[#92a4c9] hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                            <button className="border-b-2 border-transparent text-slate-500 dark:text-[#92a4c9] hover:text-slate-900 dark:hover:text-white py-4 text-sm font-bold tracking-wide whitespace-nowrap transition-colors flex items-center">
                                Network <span className="ml-1 text-xs bg-slate-100 dark:bg-[#232f48] px-1.5 py-0.5 rounded text-slate-600 dark:text-white">482</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sidebar (Left) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* At a Glance / Education Card */}
                        <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg">Education</h3>
                                {isOwnProfile && <button className="text-primary hover:text-blue-400 p-1"><span className="material-symbols-outlined text-[20px]">edit</span></button>}
                            </div>
                            <div className="flex gap-4 mb-5">
                                <div className="size-12 rounded bg-white p-1 flex items-center justify-center shrink-0 border border-slate-100 dark:border-[#232f48]">
                                    <span className="material-symbols-outlined text-3xl text-slate-400">school</span>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-white font-bold text-sm">{profile?.university || 'University Name'}</h4>
                                    <p className="text-slate-500 dark:text-[#92a4c9] text-xs">Bachelor of Science, {profile?.major || 'Major Not Set'}</p>
                                    <p className="text-slate-400 dark:text-[#92a4c9]/60 text-xs mt-1">{profile?.start_year || '2021'} - {profile?.end_year || '2025'}</p>
                                </div>
                            </div>
                            <div className="h-px bg-slate-200 dark:bg-[#232f48] w-full my-4"></div>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm">
                                    <span className="material-symbols-outlined text-slate-400 dark:text-[#92a4c9] text-[20px]">language</span>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 dark:text-[#92a4c9] text-xs">Website</span>
                                        <a href="#" className="text-primary hover:underline font-medium">janedoe.dev</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <span className="material-symbols-outlined text-slate-400 dark:text-[#92a4c9] text-[20px]">folder_shared</span>
                                    <div className="flex flex-col">
                                        <span className="text-slate-500 dark:text-[#92a4c9] text-xs">Resume</span>
                                        <a href="#" className="text-slate-900 dark:text-white hover:text-primary transition-colors font-medium flex items-center gap-1">
                                            Download PDF
                                            <span className="material-symbols-outlined text-[16px]">download</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Suggested Connections (Mini) */}
                        <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] p-5 shadow-sm">
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">People you may know</h3>
                            <div className="space-y-4">
                                {suggestedConnections.slice(0, 3).map(suggestion => (
                                    <div key={suggestion.id || suggestion.email} className="flex items-center gap-3">
                                        <div
                                            className="size-10 rounded-full bg-cover bg-center cursor-pointer"
                                            onClick={() => navigate(`/profile/${suggestion.email}`)}
                                            style={{ backgroundImage: `url(${suggestion.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${suggestion.email}`})` }}
                                        ></div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className="text-slate-900 dark:text-white text-sm font-bold truncate cursor-pointer hover:underline"
                                                onClick={() => navigate(`/profile/${suggestion.email}`)}
                                            >
                                                {suggestion.full_name || suggestion.email.split('@')[0]}
                                            </p>
                                            <p className="text-slate-500 dark:text-[#92a4c9] text-xs truncate">{suggestion.university || 'Student'}</p>
                                        </div>
                                        <button
                                            onClick={() => connectionService.sendRequest(user.email, suggestion.email)}
                                            className="size-8 rounded-full bg-slate-100 dark:bg-[#232f48] hover:bg-primary text-slate-600 dark:text-white hover:text-white flex items-center justify-center transition-colors"
                                            title="Connect"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                                        </button>
                                    </div>
                                ))}
                                {suggestedConnections.length === 0 && (
                                    <p className="text-slate-500 text-sm">No suggestions available.</p>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/search')}
                                className="w-full mt-4 py-2 text-sm text-slate-500 dark:text-[#92a4c9] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#232f48] rounded transition-colors font-medium"
                            >
                                Show all
                            </button>
                        </div>
                    </div>

                    {/* Main Content (Right) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Tab Content */}
                        {activeTab === 'profile' && (
                            <>
                                {/* About Section */}
                                <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] p-6 shadow-sm">
                                    <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-3">About</h3>
                                    <p className="text-slate-500 dark:text-[#92a4c9] leading-relaxed text-sm md:text-base">
                                        {profile?.bio || 'Passionate student eager to learn and connect with others in the field.'}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold">Open to work</span>
                                        <span className="bg-slate-100 dark:bg-[#232f48] text-slate-600 dark:text-white px-3 py-1 rounded-full text-xs font-medium">Remote Only</span>
                                    </div>
                                </div>

                                {/* Skills & Tags */}
                                <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] p-6 shadow-sm">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-slate-900 dark:text-white font-bold text-xl">Skills & Interests</h3>
                                        {isOwnProfile && (
                                            <div className="flex gap-2">
                                                <button onClick={() => setShowEditModal(true)} className="text-slate-400 dark:text-[#92a4c9] hover:text-slate-900 dark:hover:text-white p-1"><span className="material-symbols-outlined text-[20px]">add</span></button>
                                                <button onClick={() => setShowEditModal(true)} className="text-slate-400 dark:text-[#92a4c9] hover:text-slate-900 dark:hover:text-white p-1"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {profile?.skills?.length > 0 ? (
                                            profile.skills.map((skill, i) => (
                                                <span key={i} className="bg-slate-100 dark:bg-[#232f48] text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-[#2d3b55] px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-default">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-500 italic">No skills added yet</span>
                                        )}
                                    </div>
                                </div>

                                {profile?.projects && profile.projects.length > 0 && (
                                    <>
                                        {/* Featured Projects */}
                                        <div>
                                            {/* ... existing project code ... */}
                                        </div>
                                    </>
                                )}

                                {profile?.certifications && profile.certifications.length > 0 && (
                                    /* Certifications */
                                    <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] p-6 shadow-sm">
                                        <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-4">Certifications</h3>
                                        {/* ... render certifications ... */}
                                    </div>
                                )}
                            </>
                        )}
                        {activeTab === 'posts' && (
                            posts.length > 0 ? (
                                posts.map(post => (
                                    <article key={post.id} className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] p-4 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div
                                                className="w-10 h-10 rounded-full bg-cover bg-center border border-slate-200 dark:border-[#232f48]"
                                                style={{ backgroundImage: `url(${profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileEmail}`})` }}
                                            />
                                            <div>
                                                <p className="text-slate-900 dark:text-white font-medium">{profile?.full_name || profileEmail.split('@')[0]}</p>
                                                <p className="text-slate-500 dark:text-[#92a4c9] text-xs">{new Date(post.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-slate-800 dark:text-white whitespace-pre-wrap">{post.content}</p>
                                        {post.media_urls?.length > 0 && (
                                            <div className="mt-3 grid gap-2">
                                                {post.media_urls.map((url, i) => (
                                                    <img key={i} src={url} alt="" className="rounded-lg max-h-96 object-cover w-full" />
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                ))
                            ) : (
                                <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] p-12 text-center">
                                    <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-[#232f48] mb-4">article</span>
                                    <p className="text-slate-500 dark:text-[#92a4c9]">No posts yet</p>
                                </div>
                            )
                        )}
                        {/* Other tabs can be empty placeholders for now */}
                        {(activeTab === 'portfolio' || activeTab === 'timeline') && (
                            <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] p-12 text-center">
                                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-[#232f48] mb-4">construction</span>
                                <p className="text-slate-500 dark:text-[#92a4c9]">This section is under construction.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal (Preserved existing logic, styled for new UI) */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#232f48]">
                            <h2 className="text-slate-900 dark:text-white font-bold text-lg">Edit Profile</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-500 dark:text-[#92a4c9] hover:text-slate-900 dark:hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9] block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editData.full_name || ''}
                                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-[#232f48] border border-slate-200 dark:border-[#3b4c6b] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9] block mb-1">Headline</label>
                                <input
                                    type="text"
                                    value={editData.headline || ''}
                                    onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                                    placeholder="e.g., CS Student at Stanford"
                                    className="w-full bg-slate-50 dark:bg-[#232f48] border border-slate-200 dark:border-[#3b4c6b] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9] block mb-1">Current Position</label>
                                    <input
                                        type="text"
                                        value={editData.current_position || ''}
                                        onChange={(e) => setEditData({ ...editData, current_position: e.target.value })}
                                        placeholder="e.g. Software Engineer"
                                        className="w-full bg-slate-50 dark:bg-[#232f48] border border-slate-200 dark:border-[#3b4c6b] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9] block mb-1">Company</label>
                                    <input
                                        type="text"
                                        value={editData.current_company || ''}
                                        onChange={(e) => setEditData({ ...editData, current_company: e.target.value })}
                                        placeholder="e.g. Google"
                                        className="w-full bg-slate-50 dark:bg-[#232f48] border border-slate-200 dark:border-[#3b4c6b] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9] block mb-1">University</label>
                                    <input
                                        type="text"
                                        value={editData.university || ''}
                                        onChange={(e) => setEditData({ ...editData, university: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#232f48] border border-slate-200 dark:border-[#3b4c6b] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9] block mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={editData.location || ''}
                                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-[#232f48] border border-slate-200 dark:border-[#3b4c6b] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9] block mb-1">Bio</label>
                                <textarea
                                    value={editData.bio || ''}
                                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-[#232f48] border border-slate-200 dark:border-[#3b4c6b] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9] block mb-1">Skills (comma-separated)</label>
                                <input
                                    type="text"
                                    value={editData.skills?.join(', ') || ''}
                                    onChange={(e) => setEditData({ ...editData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    placeholder="React, Python, Design..."
                                    className="w-full bg-slate-50 dark:bg-[#232f48] border border-slate-200 dark:border-[#3b4c6b] rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-[#232f48] flex justify-end gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-slate-500 dark:text-[#92a4c9] hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    className="px-6 py-2 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-lg shadow-primary/25"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Profile;
