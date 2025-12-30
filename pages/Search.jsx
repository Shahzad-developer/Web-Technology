import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { postService } from '../services/postService';
import MainLayout from '../components/layout/MainLayout';

const Search = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'people', 'posts', 'projects'
    const [profileResults, setProfileResults] = useState([]);
    const [postResults, setPostResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [trendingTags, setTrendingTags] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                if (query.trim()) {
                    // Search mode
                    const [profiles, posts] = await Promise.all([
                        (activeFilter === 'all' || activeFilter === 'people') ? profileService.searchProfiles(query) : [],
                        (activeFilter === 'all' || activeFilter === 'posts') ? postService.searchPosts(query) : []
                    ]);

                    setProfileResults(profiles || []);
                    setPostResults(posts || []);
                } else {
                    // Discovery mode
                    const [suggestions, trending] = await Promise.all([
                        profileService.getSuggestedProfiles(user?.email),
                        postService.getTrendingPosts()
                    ]);
                    setProfileResults(suggestions || []);
                    setPostResults(trending || []);
                }

                // Fetch sidebar data
                const [tags, events] = await Promise.all([
                    postService.getTrendingHashtags(),
                    postService.getEvents()
                ]);
                setTrendingTags(tags);
                setUpcomingEvents(events);

            } catch (error) {
                console.error('Error fetching search results:', error);
            }
            setLoading(false);
        };

        const timeoutId = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, user?.email, activeFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ q: query });
    };

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'people', label: 'People', icon: 'group' },
        { id: 'posts', label: 'Posts', icon: 'article' },
        { id: 'projects', label: 'Projects', icon: 'rocket_launch' }
    ];

    // Right Sidebar Content
    const searchRightSidebar = (
        <>
            {/* Trending Tags */}
            <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider mb-4">Trending Hashtags</h3>
                <div className="flex flex-col gap-3">
                    {trendingTags.length > 0 ? (
                        trendingTags.map((tagObj, index) => (
                            <a key={index} onClick={() => setQuery(tagObj.tag)} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#232f48] text-slate-500 dark:text-slate-400 font-bold text-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">#</span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">{tagObj.tag.replace('#', '')}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-500">{tagObj.count} posts</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                            </a>
                        ))
                    ) : (
                        <p className="text-xs text-slate-500">No hashtags trending right now.</p>
                    )}
                </div>
            </div>

            {/* Upcoming Events */}
            <div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-[#92a4c9] uppercase tracking-wider mb-4">Upcoming Events</h3>
                <div className="flex flex-col gap-4">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map(event => {
                            const eventDate = new Date(event.created_at);
                            const month = eventDate.toLocaleString('default', { month: 'short' });
                            const day = eventDate.getDate();
                            return (
                                <div key={event.id} className="p-3 rounded-xl bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors cursor-pointer group shadow-sm">
                                    <div className="flex gap-3 mb-2">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-primary uppercase">{month}</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">{day}</span>
                                        </div>
                                        <div className='overflow-hidden'>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary truncate">{event.content.replace(/#\w+/g, '')}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">Hosted by {event.author_email.split('@')[0]}</p>
                                        </div>
                                    </div>
                                    <button className="w-full mt-2 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors">View Details</button>
                                </div>
                            )
                        })
                    ) : (
                        <p className="text-xs text-slate-500">No upcoming events.</p>
                    )}
                </div>
            </div>

            {/* Ad / Promo area */}
            <div className="mt-auto p-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-center relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Premium</p>
                <h4 className="text-white font-bold text-sm mb-2">See who viewed your profile</h4>
                <button className="w-full bg-white text-slate-900 text-xs font-bold py-2 rounded-lg hover:bg-slate-100 transition-colors">Try Premium Free</button>
            </div>
        </>
    );

    return (
        <MainLayout rightSidebar={searchRightSidebar} disableScroll={true}>
            {/* Sticky Header Area */}
            <div className="w-full bg-white/90 dark:bg-[#101622]/90 backdrop-blur-md z-10 sticky top-0 border-b border-slate-200 dark:border-[#232f48]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-4">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 dark:text-[#92a4c9]">search</span>
                        </div>
                        <input
                            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl leading-5 bg-slate-100 dark:bg-[#232f48] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-[#92a4c9] focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm transition-shadow"
                            placeholder="Search for students, posts, skills..."
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery('')} className="absolute inset-y-0 right-10 flex items-center text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        )}
                    </form>

                    {/* Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeFilter === filter.id
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                                    : 'bg-slate-100 dark:bg-[#232f48] text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-[#324160]'
                                    }`}
                            >
                                {filter.icon && <span className="material-symbols-outlined text-[18px]">{filter.icon}</span>}
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Main Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-20 pt-6">
                <div className="max-w-5xl mx-auto flex flex-col gap-10">

                    {/* Hero Section - Only on Discovery (empty query) and 'all' filter */}
                    {!query && activeFilter === 'all' && (
                        <div className="relative w-full rounded-2xl overflow-hidden min-h-[360px] flex items-end p-8 group cursor-pointer shadow-2xl">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBC7BonjPhSobwufe7kZFU0gWk5vLNaMcGzbBd2Lvl_0k1guYia68lvANlTe7_tcBhguKgfn6UIXthfrVxG9-N7QAl3DevEORCbclNDceAowPf7w81SSV6-WINbHz1eTim2XkmECEEjYM-RIeTAULS8W9Cm_8ApGPo4kuVGqa89I_ZlWonpFccxPi8wDuQdurIwHsE1ofSrRDBZLsdHI5CW1UH9fw31wqITW0Eb5t7cpBTt2Xb2TNtfPWgELGAQNT_nj7ZjMzfXBEM")' }}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                            <div className="relative z-10 flex flex-col gap-4 max-w-2xl">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-bold uppercase tracking-wider w-fit backdrop-blur-md">Featured Innovation</span>
                                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
                                    EcoTrack: AI Waste Management
                                </h2>
                                <p className="text-slate-200 text-lg line-clamp-2 drop-shadow-md">
                                    A student-led initiative from Stanford University using computer vision to categorize campus recyclables in real-time.
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                    <button className="bg-white text-slate-900 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors shadow-lg">
                                        View Project
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                        </div>
                    ) : (
                        <>
                            {/* Section: People */}
                            {(activeFilter === 'all' || activeFilter === 'people') && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {query ? 'People Results' : 'People You May Know'}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {profileResults.length > 0 ? (
                                            profileResults.map((profile) => (
                                                <div key={profile.id || profile.email} className="bg-white dark:bg-[#1a1d24] rounded-xl p-4 flex flex-col items-center text-center border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-colors group shadow-sm">
                                                    <div className="relative mb-3">
                                                        <div
                                                            className="w-20 h-20 rounded-full bg-cover bg-center"
                                                            style={{ backgroundImage: `url(${profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`})` }}
                                                        />
                                                        {profile.show_active_status && (
                                                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-[#1a1d24]"></div>
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white">{profile.full_name || profile.email.split('@')[0]}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{profile.university || 'University Student'}</p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 line-clamp-1">{profile.headline || 'Student'}</p>

                                                    <Link
                                                        to={`/profile/${profile.email}`}
                                                        className="w-full mt-auto py-2 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary hover:text-white transition-all block"
                                                    >
                                                        View Profile
                                                    </Link>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-6 text-center text-slate-500 text-sm">
                                                No profiles found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Section: Posts/Projects */}
                            {(activeFilter === 'all' || activeFilter === 'posts' || activeFilter === 'projects') && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {query ? 'Posts & Projects' : 'Trending Posts'}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {postResults.length > 0 ? (
                                            postResults.map(post => (
                                                <div key={post.id} className="bg-white dark:bg-[#1a1d24] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col group shadow-sm hover:shadow-lg transition-shadow">
                                                    {post.media_urls && post.media_urls[0] ? (
                                                        <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url("${post.media_urls[0]}")` }}></div>
                                                    ) : (
                                                        <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-[#232f48] dark:to-[#111722] flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-state-400">text_fields</span>
                                                        </div>
                                                    )}
                                                    <div className="p-4 flex-1 flex flex-col">
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#92a4c9] mb-2">
                                                            <span className="font-bold">{post.author_email.split('@')[0]}</span>
                                                            <span>•</span>
                                                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
                                                            {post.content}
                                                        </p>
                                                        <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
                                                            <div className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-[14px]">thumb_up</span> {post.likes_count || 0}
                                                            </div>
                                                            <Link to={`/feed`} className="text-primary font-bold hover:underline">View Post</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-6 text-center text-slate-500 text-sm">
                                                No posts found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Search;
