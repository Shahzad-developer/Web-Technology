import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { useState, useEffect } from 'react';

const TopNav = ({ title = 'ObrixChat', showSearch = true, onMenuClick }) => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [profile, setProfile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (user?.email) {
            profileService.getProfile(user.email).then(setProfile);
        }
    }, [user?.email]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-[#111722] border-b border-border-dark">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo & Search */}
                    <div className="flex items-center gap-4 flex-1">
                        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white">
                            <span className="material-symbols-outlined">menu</span>
                        </button>

                        <div
                            onClick={() => navigate('/feed')}
                            className="flex items-center gap-3 text-white cursor-pointer shrink-0"
                        >
                            <div className="size-8 text-primary">
                                <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" />
                                </svg>
                            </div>
                            <h2 className="text-white text-xl font-bold tracking-tight hidden md:block">ObrixChat</h2>
                        </div>

                        {showSearch && (
                            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-text-secondary">search</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border-none rounded-lg bg-input-dark text-white placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                                        placeholder="Search people, classes, or posts..."
                                    />
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <nav className="hidden lg:flex gap-6 mr-4">
                            <button onClick={() => navigate('/feed')} className="text-text-secondary hover:text-white text-sm font-medium transition-colors flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined">home</span>
                                <span className="text-xs">Home</span>
                            </button>
                            <button onClick={() => navigate('/connections')} className="text-text-secondary hover:text-white text-sm font-medium transition-colors flex flex-col items-center gap-1">
                                <span className="material-symbols-outlined">group</span>
                                <span className="text-xs">Network</span>
                            </button>
                            <button onClick={() => navigate('/chat')} className="text-text-secondary hover:text-white text-sm font-medium transition-colors flex flex-col items-center gap-1 relative">
                                <span className="material-symbols-outlined">chat_bubble</span>
                                <span className="text-xs">Messages</span>
                            </button>
                        </nav>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/notifications')}
                                className="p-2 rounded-lg bg-input-dark hover:bg-surface-dark text-white transition-colors relative"
                            >
                                <span className="material-symbols-outlined text-xl">notifications</span>
                            </button>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <div
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="h-10 w-10 rounded-full bg-cover bg-center cursor-pointer border border-border-dark hover:border-primary transition-colors"
                                style={{
                                    backgroundImage: profile?.avatar_url
                                        ? `url(${profile.avatar_url})`
                                        : `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email})`
                                }}
                            />

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-surface-dark border border-border-dark rounded-xl shadow-xl overflow-hidden z-50">
                                    <div className="p-4 border-b border-border-dark">
                                        <p className="text-white font-medium truncate">{profile?.full_name || user?.email?.split('@')[0]}</p>
                                        <p className="text-text-secondary text-sm truncate">{user?.email}</p>
                                    </div>
                                    <div className="py-2">
                                        <button
                                            onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                                            className="w-full px-4 py-2 text-left text-text-secondary hover:text-white hover:bg-input-dark flex items-center gap-3"
                                        >
                                            <span className="material-symbols-outlined text-xl">person</span>
                                            View Profile
                                        </button>
                                        <button
                                            onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                                            className="w-full px-4 py-2 text-left text-text-secondary hover:text-white hover:bg-input-dark flex items-center gap-3"
                                        >
                                            <span className="material-symbols-outlined text-xl">settings</span>
                                            Settings
                                        </button>
                                    </div>
                                    <div className="border-t border-border-dark py-2">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-input-dark flex items-center gap-3"
                                        >
                                            <span className="material-symbols-outlined text-xl">logout</span>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNav;
