import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ profile, className = '' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;
    const fullName = profile?.full_name || 'Loading...';
    const university = profile?.university || 'Student';

    return (
        <aside className={`${className} sticky top-24`}>
            <div className="flex flex-col gap-6">
                {/* Profile Card */}
                <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] overflow-hidden p-4 shadow-sm">
                    <div className="flex items-start gap-4 mb-4">
                        <div
                            className="h-14 w-14 rounded-full bg-cover bg-center border-2 border-white dark:border-[#232f48] shadow-sm cursor-pointer"
                            onClick={() => navigate('/profile')}
                            style={{ backgroundImage: `url(${avatarUrl})` }}
                        />
                        <div>
                            <h2
                                className="text-slate-900 dark:text-white font-bold text-lg leading-tight cursor-pointer hover:underline"
                                onClick={() => navigate('/profile')}
                            >
                                {fullName}
                            </h2>
                            <p className="text-slate-500 dark:text-[#92a4c9] text-sm">{university}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <Link to="/feed" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-[#232f48] text-primary font-medium hover:bg-slate-200 dark:hover:bg-[#324467] transition-colors">
                            <span className="material-symbols-outlined text-[20px]">home</span>
                            <span className="text-sm">Home</span>
                        </Link>
                        <Link to="/connections" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#92a4c9] hover:bg-slate-50 dark:hover:bg-[#1e2736] hover:text-slate-900 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">group</span>
                            <span className="text-sm font-medium">My Network</span>
                        </Link>
                        <Link to="/chat" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#92a4c9] hover:bg-slate-50 dark:hover:bg-[#1e2736] hover:text-slate-900 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                            <span className="text-sm font-medium">Messages</span>
                        </Link>
                        <Link to="/classes" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#92a4c9] hover:bg-slate-50 dark:hover:bg-[#1e2736] hover:text-slate-900 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">menu_book</span>
                            <span className="text-sm font-medium">Classes</span>
                        </Link>
                        <Link to="/events" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#92a4c9] hover:bg-slate-50 dark:hover:bg-[#1e2736] hover:text-slate-900 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                            <span className="text-sm font-medium">Events</span>
                        </Link>
                    </div>
                    <button className="w-full mt-4 bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/25">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Create Post
                    </button>
                </div>

                {/* Groups/Shortcuts */}
                <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] p-4 shadow-sm">
                    <h3 className="text-slate-900 dark:text-white font-semibold mb-3 px-1">Your Shortcuts</h3>
                    <div className="flex flex-col gap-2">
                        <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1e2736] group transition-colors" href="#">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">CS</div>
                            <span className="text-slate-600 dark:text-[#92a4c9] text-sm group-hover:text-slate-900 dark:group-hover:text-white font-medium">CS 101 Study Group</span>
                        </a>
                        <a className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1e2736] group transition-colors" href="#">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">HK</div>
                            <span className="text-slate-600 dark:text-[#92a4c9] text-sm group-hover:text-slate-900 dark:group-hover:text-white font-medium">Campus Hackathon</span>
                        </a>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
