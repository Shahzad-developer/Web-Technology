import { useState, useEffect } from 'react';
import AppSidebar from './AppSidebar';
import TopNav from './TopNav'; // Retain for mobile
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children, rightSidebar, showSidebar = true, disableScroll = false }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-[#f6f6f8] dark:bg-[#101622] text-slate-900 dark:text-white font-display overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden glass"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Left Sidebar - Responsive */}
            {showSidebar && (
                <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <AppSidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 w-full">
                {/* Mobile Header (Visible only on small screens) */}
                <div className="md:hidden sticky top-0 z-20">
                    <TopNav showSearch={false} onMenuClick={() => setIsMobileMenuOpen(true)} />
                </div>

                {/* Content Wrapper */}
                {disableScroll ? (
                    // For pages that handle their own scrolling (Chat, Search)
                    <div className="flex-1 h-full w-full overflow-hidden relative flex flex-col">
                        {children}
                    </div>
                ) : (
                    // For standard pages (Feed, Profile, etc.) - Centralized logic
                    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        <div className="max-w-7xl mx-auto min-h-full">
                            {children}
                        </div>
                    </div>
                )}
            </main>

            {/* Right Sidebar - Desktop Only */}
            {rightSidebar && (
                <aside className="w-80 h-full hidden xl:flex flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] shrink-0 p-6 gap-6 overflow-y-auto z-10">
                    {rightSidebar}
                </aside>
            )}
        </div>
    );
};

export default MainLayout;
