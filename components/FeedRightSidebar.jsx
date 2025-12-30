import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeedRightSidebar = ({ academicUpdates, connections, trendingPosts }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Academic Updates */}
            <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-900 dark:text-white font-bold text-base">Academic Updates</h3>
                    <a className="text-primary text-xs font-medium hover:underline cursor-pointer">View All</a>
                </div>
                <div className="flex flex-col gap-4">
                    {academicUpdates && academicUpdates.length > 0 ? (
                        academicUpdates.map(event => {
                            const eventDate = new Date(event.created_at);
                            const month = eventDate.toLocaleString('default', { month: 'short' });
                            const day = eventDate.getDate();
                            return (
                                <div key={event.id} className="flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1e2736] p-1 rounded transition-colors">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-100 dark:bg-[#232f48] border border-slate-200 dark:border-[#324467] shrink-0">
                                        <span className="text-xs text-slate-500 dark:text-[#92a4c9] uppercase font-bold">{month}</span>
                                        <span className="text-slate-900 dark:text-white font-bold text-lg leading-none">{day}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-slate-900 dark:text-white text-sm font-semibold truncate">{event.content.replace(/#\w+/g, '').trim()}</h4>
                                        <p className="text-slate-500 dark:text-[#92a4c9] text-xs mt-0.5 line-clamp-1">{event.author_email.split('@')[0]}</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-slate-500 text-sm text-center py-2">No academic updates.</p>
                    )}
                </div>
            </div>

            {/* Quick Chat */}
            <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-900 dark:text-white font-bold text-base">Quick Chat</h3>
                    <button className="text-slate-400 dark:text-[#92a4c9] hover:text-slate-900 dark:hover:text-white">
                        <span className="material-symbols-outlined text-[20px]">edit_square</span>
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    {connections && connections.slice(0, 3).map(conn => (
                        <div key={conn.id} onClick={() => navigate(`/chat?email=${conn.connected_email}`)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1e2736] cursor-pointer group transition-colors">
                            <div className="relative">
                                <div
                                    className="w-10 h-10 rounded-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${conn.connected_email})` }}
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#111722] rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-slate-900 dark:text-white text-sm font-medium truncate">{conn.connected_email.split('@')[0]}</h4>
                                <p className="text-slate-500 dark:text-[#92a4c9] text-xs truncate">Online</p>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 dark:text-[#92a4c9] hover:text-primary hover:bg-slate-100 dark:hover:bg-[#232f48] rounded transition-all">
                                <span className="material-symbols-outlined text-[18px]">videocam</span>
                            </button>
                        </div>
                    ))}
                    {(!connections || connections.length === 0) && (
                        <p className="text-slate-500 dark:text-[#92a4c9] text-xs text-center py-2">Add connections to chat!</p>
                    )}
                </div>
            </div>

            {/* Trending Topics - Now Dynamic */}
            <div className="bg-white dark:bg-[#111722] rounded-xl border border-slate-200 dark:border-[#232f48] p-4 shadow-sm">
                <h3 className="text-slate-900 dark:text-white font-bold text-base mb-4">Trending on Campus</h3>
                <div className="flex flex-col gap-3">
                    {trendingPosts && trendingPosts.length > 0 ? (
                        trendingPosts.map(post => (
                            <div key={post.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1e2736] p-2 rounded transition-colors" onClick={() => navigate(`/profile/${post.author_email}`)}>
                                <p className="text-slate-500 dark:text-[#455d8c] text-xs font-medium">Trending</p>
                                <h4 className="text-slate-900 dark:text-white text-sm font-bold mt-0.5 line-clamp-2">{post.content}</h4>
                                <p className="text-slate-500 dark:text-[#92a4c9] text-xs">{post.likes_count || 0} likes</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-sm">No trending topics yet.</p>
                    )}
                    <button onClick={() => navigate('/search')} className="text-primary text-sm font-medium text-left hover:underline mt-1">Show more</button>
                </div>
            </div>

            {/* Footer Links */}
            <div className="px-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-[#455d8c]">
                <a className="hover:text-primary cursor-pointer">About</a>
                <a className="hover:text-primary cursor-pointer">Accessibility</a>
                <a className="hover:text-primary cursor-pointer">Help Center</a>
                <a className="hover:text-primary cursor-pointer">Privacy & Terms</a>
                <span>ObrixChat © 2024</span>
            </div>
        </div>
    );
};

export default FeedRightSidebar;
