import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-display antialiased">
            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-[#232f48] bg-[#101622]/80 backdrop-blur-md">
                <div className="flex items-center justify-between px-6 py-4 lg:px-20 max-w-[1280px] mx-auto w-full">
                    <div className="flex items-center gap-4 text-white">
                        <div className="size-8 text-primary">
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">ObrixChat</h2>
                    </div>
                    <div className="hidden md:flex items-center gap-9">
                        <a className="text-gray-300 text-sm font-medium hover:text-primary transition-colors" href="#features">Features</a>
                        <a className="text-gray-300 text-sm font-medium hover:text-primary transition-colors" href="#stats">Community</a>
                        <a className="text-gray-300 text-sm font-medium hover:text-primary transition-colors" href="#cta">About</a>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/login" className="flex h-10 px-4 cursor-pointer items-center justify-center rounded-lg bg-[#232f48] text-white text-sm font-bold hover:opacity-90 transition-opacity">
                            <span className="truncate">Sign In</span>
                        </Link>
                        <Link to="/signup" className="flex h-10 px-4 cursor-pointer items-center justify-center rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                            <span className="truncate">Get Started</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-col items-center w-full">
                {/* Hero Section */}
                <section className="relative w-full px-6 py-12 lg:px-20 lg:py-24 max-w-[1280px]">
                    {/* Background Gradient Blob */}
                    <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px] opacity-50 pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-6 text-left">
                            <div className="flex flex-col gap-4">
                                <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary ring-1 ring-inset ring-primary/20">
                                    The All-in-One Campus App
                                </span>
                                <h1 className="text-white text-5xl lg:text-6xl font-black leading-[1.1] tracking-[-0.033em]">
                                    Your Campus, <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Connected.</span>
                                </h1>
                                <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                                    The only app you need for university. Professional networking, instant messaging, social sharing, and video classes—all in one place.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 mt-2">
                                <Link to="/signup" className="flex h-12 px-8 items-center justify-center rounded-lg bg-primary text-white text-base font-bold hover:bg-blue-600 transition-all hover:scale-105 shadow-lg shadow-primary/25">
                                    Get Started Free
                                </Link>
                                <button className="flex h-12 px-8 items-center justify-center rounded-lg border border-gray-700 bg-transparent text-white text-base font-bold hover:bg-white/5 transition-colors">
                                    View Demo
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mt-6">
                                <div className="flex -space-x-3">
                                    <div className="h-10 w-10 rounded-full border-2 border-[#101622] bg-gray-300 bg-cover bg-center" style={{ backgroundImage: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=student1')" }} />
                                    <div className="h-10 w-10 rounded-full border-2 border-[#101622] bg-gray-300 bg-cover bg-center" style={{ backgroundImage: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=student2')" }} />
                                    <div className="h-10 w-10 rounded-full border-2 border-[#101622] bg-gray-300 bg-cover bg-center" style={{ backgroundImage: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=student3')" }} />
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-[#101622] bg-gray-800 text-xs font-bold text-white">+2k</div>
                                </div>
                                <p className="text-sm text-gray-400">Students joined today</p>
                            </div>
                        </div>

                        <div className="relative w-full aspect-[4/3] lg:aspect-square flex items-center justify-center">
                            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-gray-700/50 p-2">
                                {/* Mockup Content */}
                                <div className="w-full h-full bg-cover bg-center rounded-xl" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB5ky_RuRLntRpsGUPaS_C24PNjzcouOSkz_qDY1mYfm3OWDOHtdOpWk2h_WAURmPabvYoRFz3S1x5l00whPBa6YbDoCCmK3FWirc16aAf41JdmWtipmgKqeDNuw3EM90_qbXc7SC2on8orBdPKcXiNTFyW_jsaTpxPIAVRC-U2ZYdMM6Spu4xOUtnWFvR58Vc68ibVt5UMIfQ7Q7g890asGgecqta7kfTwQ_UHtNkav19M3l69sOkXEO04LdDsTPWGyPdXIc81kvI')" }} />
                                {/* Floating Element 1 */}
                                <div className="absolute -left-4 top-20 p-3 bg-[#1e293b] rounded-xl shadow-xl border border-gray-700 animate-bounce">
                                    <span className="material-symbols-outlined text-green-500 text-3xl">videocam</span>
                                </div>
                                {/* Floating Element 2 */}
                                <div className="absolute -right-4 bottom-32 p-3 bg-[#1e293b] rounded-xl shadow-xl border border-gray-700 animate-bounce" style={{ animationDelay: '1s' }}>
                                    <span className="material-symbols-outlined text-blue-500 text-3xl">chat_bubble</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section id="stats" className="w-full bg-[#151e2e] border-y border-[#232f48]">
                    <div className="px-6 py-12 lg:px-20 max-w-[1280px] mx-auto w-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                            <div className="flex flex-col gap-1 p-4 rounded-lg hover:bg-[#1c2638] transition-colors">
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Trusted By</p>
                                <p className="text-white text-4xl font-black tracking-tight">150+</p>
                                <p className="text-gray-400 text-base">Universities Worldwide</p>
                            </div>
                            <div className="flex flex-col gap-1 p-4 rounded-lg hover:bg-[#1c2638] transition-colors">
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Community</p>
                                <p className="text-white text-4xl font-black tracking-tight">500k+</p>
                                <p className="text-gray-400 text-base">Active Students</p>
                            </div>
                            <div className="flex flex-col gap-1 p-4 rounded-lg hover:bg-[#1c2638] transition-colors">
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Engagement</p>
                                <p className="text-white text-4xl font-black tracking-tight">2.5M+</p>
                                <p className="text-gray-400 text-base">Daily Messages Sent</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Section */}
                <section id="features" className="w-full px-6 py-20 lg:px-20 max-w-[1280px]">
                    <div className="flex flex-col md:flex-row gap-10 items-start mb-12">
                        <div className="flex-1">
                            <h2 className="text-white text-3xl md:text-4xl font-bold leading-tight mb-4">
                                Four Pillars of Campus Life
                            </h2>
                            <p className="text-gray-400 text-lg max-w-2xl">
                                ObrixChat integrates the best tools into one seamless experience designed specifically for the university ecosystem.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Feature 1 */}
                        <div className="group flex flex-col gap-4 rounded-2xl border border-[#324467] bg-[#192233] p-6 hover:border-primary/50 transition-colors">
                            <div className="h-12 w-12 rounded-lg bg-blue-900/30 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl">work</span>
                            </div>
                            <div>
                                <h3 className="text-white text-xl font-bold mb-2">Professional Networking</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Build your resume, connect with alumni, and find internships tailored to your major.
                                </p>
                            </div>
                        </div>
                        {/* Feature 2 */}
                        <div className="group flex flex-col gap-4 rounded-2xl border border-[#324467] bg-[#192233] p-6 hover:border-pink-500/50 transition-colors">
                            <div className="h-12 w-12 rounded-lg bg-pink-900/30 flex items-center justify-center text-pink-400">
                                <span className="material-symbols-outlined text-3xl">photo_camera</span>
                            </div>
                            <div>
                                <h3 className="text-white text-xl font-bold mb-2">Social Feed</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Share moments with your campus circle and stay updated on university events.
                                </p>
                            </div>
                        </div>
                        {/* Feature 3 */}
                        <div className="group flex flex-col gap-4 rounded-2xl border border-[#324467] bg-[#192233] p-6 hover:border-green-500/50 transition-colors">
                            <div className="h-12 w-12 rounded-lg bg-green-900/30 flex items-center justify-center text-green-400">
                                <span className="material-symbols-outlined text-3xl">chat_bubble</span>
                            </div>
                            <div>
                                <h3 className="text-white text-xl font-bold mb-2">Instant Messaging</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Real-time study groups, club chats, and secure direct messages with classmates.
                                </p>
                            </div>
                        </div>
                        {/* Feature 4 */}
                        <div className="group flex flex-col gap-4 rounded-2xl border border-[#324467] bg-[#192233] p-6 hover:border-purple-500/50 transition-colors">
                            <div className="h-12 w-12 rounded-lg bg-purple-900/30 flex items-center justify-center text-purple-400">
                                <span className="material-symbols-outlined text-3xl">videocam</span>
                            </div>
                            <div>
                                <h3 className="text-white text-xl font-bold mb-2">Video Calls</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Host club meetings, group study sessions, or attend virtual office hours with ease.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section id="cta" className="w-full px-6 py-20 lg:px-20 max-w-[960px] mx-auto text-center">
                    <div className="rounded-3xl bg-gradient-to-b from-[#1e293b] to-[#101622] border border-[#232f48] p-10 lg:p-16 relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-primary/20 blur-[80px] pointer-events-none" />
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <h2 className="text-white text-3xl md:text-5xl font-black tracking-tight">Ready to transform your university life?</h2>
                            <p className="text-gray-300 text-lg max-w-2xl">
                                Join over 500,000 students using ObrixChat to connect, study, and grow. Download now on all platforms.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
                                <Link to="/signup" className="flex h-12 px-8 items-center justify-center rounded-lg bg-primary text-white text-base font-bold hover:bg-blue-600 transition-all w-full sm:w-auto">
                                    Join ObrixChat Now
                                </Link>
                                <button className="flex h-12 px-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm text-white text-base font-bold hover:bg-white/20 transition-all w-full sm:w-auto">
                                    Download App
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-[#232f48] bg-[#0f1521] py-12">
                <div className="px-6 lg:px-20 max-w-[1280px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 text-white">
                        <div className="size-6 text-primary">
                            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg">ObrixChat</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-gray-400">
                        <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                        <a className="hover:text-primary transition-colors" href="#">Support</a>
                    </div>
                    <div className="text-sm text-gray-500">
                        © 2024 ObrixChat Inc.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
