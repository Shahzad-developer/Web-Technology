import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { connectionService } from '../services/connectionService';
import { profileService } from '../services/profileService';
import MainLayout from '../components/layout/MainLayout';

const Connections = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [connections, setConnections] = useState([]);
    const [pending, setPending] = useState([]);
    const [sent, setSent] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (user?.email) loadData();
    }, [user?.email]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [conns, pend, sentReqs, profile] = await Promise.all([
                connectionService.getConnections(user.email),
                connectionService.getPendingRequests(user.email),
                connectionService.getSentRequests(user.email),
                profileService.getProfile(user.email)
            ]);
            setConnections(conns);
            setPending(pend);
            setSent(sentReqs);

            const suggested = await profileService.getSuggestedProfiles(user.email, profile?.university, 6);
            setSuggestions(suggested);
        } catch (err) {
            console.error('Error loading connections:', err);
        }
        setLoading(false);
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length >= 2) {
            const results = await profileService.searchProfiles(query);
            setSearchResults(results.filter(p => p.email !== user.email));
        } else {
            setSearchResults([]);
        }
    };

    const handleAccept = async (email) => {
        await connectionService.acceptRequest(email, user.email);
        const request = pending.find(p => p.requester_email === email);
        if (request) {
            setPending(pending.filter(p => p.requester_email !== email));
            loadData();
        }
    };

    const handleReject = async (email) => {
        await connectionService.rejectRequest(email, user.email);
        setPending(pending.filter(p => p.requester_email !== email));
    };

    const handleConnect = async (email) => {
        await connectionService.sendRequest(user.email, email);
        setSuggestions(suggestions.filter(s => s.email !== email));
        setSearchResults(searchResults.filter(s => s.email !== email));
    };

    const ConnectionsRightSidebar = () => (
        <div className="flex flex-col gap-4">
            <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] overflow-hidden shadow-sm">
                <h2 className="text-slate-900 dark:text-white tracking-tight text-lg font-bold leading-tight px-6 pt-5 pb-2">Manage Network</h2>
                <div className="flex flex-col py-2">
                    <a className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-[#232f48]/50 transition-colors group cursor-pointer">
                        <div className="text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">group</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium flex-1">Connections</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{connections.length}</p>
                    </a>
                    <a className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-[#232f48]/50 transition-colors group cursor-pointer">
                        <div className="text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">groups</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium flex-1">Groups</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">12</p>
                    </a>
                    <a className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-[#232f48]/50 transition-colors group cursor-pointer">
                        <div className="text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">event</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium flex-1">Events</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">4</p>
                    </a>
                    <a className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 dark:hover:bg-[#232f48]/50 transition-colors group cursor-pointer">
                        <div className="text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">article</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-medium flex-1">Pages</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">8</p>
                    </a>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 dark:border-[#232f48]">
                    <button className="w-full text-primary hover:text-primary/80 text-sm font-semibold text-left">Show less</button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <span className="material-symbols-outlined text-6xl">school</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Grow your skills</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Check out premium courses for Engineering students.</p>
                <button className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-colors">Explore Courses</button>
            </div>
        </div>
    );

    return (
        <MainLayout rightSidebar={<ConnectionsRightSidebar />}>
            <div className="flex flex-col gap-6">
                {/* Search Header */}
                <div className="bg-white dark:bg-[#111722] p-4 rounded-xl border border-slate-200 dark:border-[#232f48] shadow-sm">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search people..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-[#192233] border-none rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary outline-none"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
                    </div>
                </div>

                {/* Search Results */}
                {searchQuery.length >= 2 && searchResults.length > 0 && (
                    <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] p-4 shadow-sm">
                        <h3 className="text-slate-900 dark:text-white font-bold mb-4">Search Results</h3>
                        <div className="space-y-3">
                            {searchResults.map(person => (
                                <div key={person.email} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-[#232f48]/50 rounded-lg transition-colors">
                                    <div
                                        onClick={() => navigate(`/profile/${encodeURIComponent(person.email)}`)}
                                        className="w-12 h-12 rounded-full bg-cover bg-center cursor-pointer"
                                        style={{ backgroundImage: `url(${person.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.email}`})` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-900 dark:text-white font-medium truncate">{person.full_name || person.email.split('@')[0]}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{person.headline || person.university || 'Student'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleConnect(person.email)}
                                        className="px-4 py-1.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white font-medium text-sm transition-all"
                                    >
                                        Connect
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Invitations Section */}
                {pending.length > 0 && (
                    <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] shadow-sm">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#232f48]">
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg">Invitations <span className="text-slate-400 font-normal text-base ml-1">({pending.length})</span></h3>
                            <button className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium">Manage</button>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-[#232f48]">
                            {pending.map(req => (
                                <InvitationRow
                                    key={req.id}
                                    request={req}
                                    onAccept={() => handleAccept(req.requester_email)}
                                    onReject={() => handleReject(req.requester_email)}
                                    navigate={navigate}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* People You May Know Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-900 dark:text-white font-bold text-lg">People you may know</h3>
                        <button className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm font-medium">See all</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {suggestions.map((person, index) => (
                            <SuggestionCard
                                key={person.email}
                                person={person}
                                index={index}
                                onConnect={() => handleConnect(person.email)}
                                navigate={navigate}
                            />
                        ))}
                        {suggestions.length === 0 && (
                            <div className="col-span-2 text-center py-8 text-slate-500 dark:text-slate-400">
                                No new suggestions at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

// --- Sub-components ---

const InvitationRow = ({ request, onAccept, onReject, navigate }) => {
    const [profile, setProfile] = useState(null);
    useEffect(() => {
        profileService.getProfile(request.requester_email).then(setProfile);
    }, [request.requester_email]);

    return (
        <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-slate-50 dark:hover:bg-[#232f48]/30 transition-colors">
            <div
                className="size-16 rounded-full bg-cover bg-center shrink-0 cursor-pointer"
                onClick={() => navigate(`/profile/${encodeURIComponent(request.requester_email)}`)}
                style={{ backgroundImage: `url(${profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.requester_email}`})` }}
            />
            <div className="flex-1 min-w-0">
                <h4 className="text-slate-900 dark:text-white font-semibold truncate cursor-pointer hover:underline" onClick={() => navigate(`/profile/${encodeURIComponent(request.requester_email)}`)}>
                    {profile?.full_name || request.requester_email.split('@')[0]}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{profile?.headline || profile?.university || 'Student'}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 dark:text-slate-500">
                    <span className="material-symbols-outlined text-[14px]">group</span>
                    <span>1 mutual connection</span>
                </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <button onClick={onReject} className="flex-1 sm:flex-none py-1.5 px-4 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium text-sm transition-colors">Ignore</button>
                <button onClick={onAccept} className="flex-1 sm:flex-none py-1.5 px-6 rounded-full bg-transparent border border-primary text-primary hover:bg-primary/10 font-medium text-sm transition-colors">Accept</button>
            </div>
        </div>
    );
};

const SuggestionCard = ({ person, index, onConnect, navigate }) => {
    const gradients = [
        'from-blue-600 to-indigo-600',
        'from-emerald-600 to-teal-600',
        'from-purple-600 to-pink-600',
        'from-orange-500 to-amber-500',
        'from-pink-500 to-rose-500',
        'from-cyan-500 to-blue-500'
    ];
    const gradientClass = gradients[index % gradients.length];

    return (
        <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 group">
            <div className="h-20 bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-80`} />
                <button className="absolute top-2 right-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 backdrop-blur-sm transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>
            <div className="px-4 pb-4 relative">
                <div
                    className="size-20 rounded-full border-4 border-white dark:border-[#111722] -mt-10 bg-cover bg-center mb-3 cursor-pointer"
                    onClick={() => navigate(`/profile/${encodeURIComponent(person.email)}`)}
                    style={{ backgroundImage: `url(${person.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${person.email}`})` }}
                />
                <div className="mb-4">
                    <h4 className="text-slate-900 dark:text-white font-bold text-base hover:underline cursor-pointer" onClick={() => navigate(`/profile/${encodeURIComponent(person.email)}`)}>
                        {person.full_name || person.email.split('@')[0]}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-2 h-8 line-clamp-2">{person.headline || person.university || 'Student'}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">school</span>
                        <span>Student</span>
                    </div>
                </div>
                <button
                    onClick={onConnect}
                    className="w-full py-1.5 rounded-full border border-primary text-primary hover:bg-primary hover:text-white font-medium text-sm transition-all flex items-center justify-center gap-2 group/btn"
                >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Connect
                </button>
            </div>
        </div>
    );
};

export default Connections;
