import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AppSidebar = ({ onCloseMobile }) => {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path);

    const handleLinkClick = () => {
        if (onCloseMobile) onCloseMobile();
    };

    return (
        <aside className="flex w-full h-full flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] shrink-0 z-20">
            <div className="p-6 flex items-center gap-3">
                <div className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 shrink-0 shadow-lg shadow-primary/20 flex items-center justify-center text-primary bg-primary/10">
                    <span className="material-symbols-outlined">hub</span>
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ObrixChat</h1>
                    <p className="text-xs text-slate-500 dark:text-[#92a4c9]">Student Network</p>
                </div>
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
                <Link to="/feed" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive('/feed') ? 'bg-primary/10 dark:bg-[#232f48] text-primary dark:text-white' : 'text-slate-600 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48]'}`}>
                    <span className={`material-symbols-outlined ${isActive('/feed') ? 'fill-1' : 'group-hover:text-primary'}`}>home</span>
                    <span className="text-sm font-medium">Home</span>
                </Link>
                <Link to="/chat" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive('/chat') ? 'bg-primary/10 dark:bg-[#232f48] text-primary dark:text-white' : 'text-slate-600 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48]'}`}>
                    <span className={`material-symbols-outlined ${isActive('/chat') ? 'fill-1' : 'group-hover:text-primary'}`}>chat_bubble</span>
                    <span className="text-sm font-medium">Messages</span>
                </Link>
                <Link to="/classes" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive('/classes') ? 'bg-primary/10 dark:bg-[#232f48] text-primary dark:text-white' : 'text-slate-600 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48]'}`}>
                    <span className={`material-symbols-outlined ${isActive('/classes') ? 'fill-1' : 'group-hover:text-primary'}`}>menu_book</span>
                    <span className="text-sm font-medium">Classes</span>
                </Link>
                <Link to="/events" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive('/events') ? 'bg-primary/10 dark:bg-[#232f48] text-primary dark:text-white' : 'text-slate-600 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48]'}`}>
                    <span className={`material-symbols-outlined ${isActive('/events') ? 'fill-1' : 'group-hover:text-primary'}`}>calendar_month</span>
                    <span className="text-sm font-medium">Events</span>
                </Link>
                <Link to="/search" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive('/search') ? 'bg-primary/10 dark:bg-[#232f48] text-primary dark:text-white' : 'text-slate-600 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48]'}`}>
                    <span className={`material-symbols-outlined ${isActive('/search') ? 'fill-1' : 'group-hover:text-primary'}`}>explore</span>
                    <span className="text-sm font-medium">Discovery</span>
                </Link>
                <Link to="/connections" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive('/connections') ? 'bg-primary/10 dark:bg-[#232f48] text-primary dark:text-white' : 'text-slate-600 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48]'}`}>
                    <span className={`material-symbols-outlined ${isActive('/connections') ? 'fill-1' : 'group-hover:text-primary'}`}>group</span>
                    <span className="text-sm font-medium">My Network</span>
                </Link>
                <Link to="/bookmarks" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive('/bookmarks') ? 'bg-primary/10 dark:bg-[#232f48] text-primary dark:text-white' : 'text-slate-600 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48]'}`}>
                    <span className={`material-symbols-outlined ${isActive('/bookmarks') ? 'fill-1' : 'group-hover:text-primary'}`}>bookmark</span>
                    <span className="text-sm font-medium">Bookmarks</span>
                </Link>
                <Link to="/notifications" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive('/notifications') ? 'bg-primary/10 dark:bg-[#232f48] text-primary dark:text-white' : 'text-slate-600 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48]'}`}>
                    <span className={`material-symbols-outlined ${isActive('/notifications') ? 'fill-1' : 'group-hover:text-primary'}`}>notifications</span>
                    <span className="text-sm font-medium">Notifications</span>
                </Link>
                <Link to="/settings" onClick={handleLinkClick} className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive('/settings') ? 'bg-primary/10 dark:bg-[#232f48] text-primary dark:text-white' : 'text-slate-600 dark:text-[#92a4c9] hover:bg-slate-100 dark:hover:bg-[#232f48]'}`}>
                    <span className={`material-symbols-outlined ${isActive('/settings') ? 'fill-1' : 'group-hover:text-primary'}`}>settings</span>
                    <span className="text-sm font-medium">Settings</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <Link to="/profile" onClick={handleLinkClick} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232f48] cursor-pointer transition-colors">
                    <div
                        className="h-10 w-10 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`})` }}
                    />
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {user?.user_metadata?.full_name || 'Student'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#92a4c9] truncate">
                            {user?.user_metadata?.university || 'University Student'}
                        </p>
                    </div>
                </Link>
            </div>
        </aside>
    );
};

export default AppSidebar;
