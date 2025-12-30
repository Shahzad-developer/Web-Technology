import { useState, useEffect } from 'react';

const VoiceCall = ({
    room,
    currentUserEmail,
    otherUserName,
    otherUserAvatar,
    localStream,
    onEndCall,
    onToggleMic,
    isMicMuted,
    durationSeconds = 0
}) => {
    const [duration, setDuration] = useState(durationSeconds);

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDuration = (secs) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')} : ${remainingSecs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="absolute inset-0 z-50 bg-white dark:bg-[#101622] text-slate-900 dark:text-white flex flex-col items-center justify-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50 dark:opacity-30"></div>
            </div>

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl">school</span>
                    <h2 className="text-xl font-bold">ObrixChat</h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-[#232f48] rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Encrypted Connection</span>
                </div>
            </header>

            {/* Main Content */}
            <div className="relative flex flex-col items-center justify-center z-10 w-full max-w-md">
                {/* Connection Status */}
                <div className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-slate-200/20 dark:border-white/10 shadow-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <p className="text-sm font-medium">Excellent Connection</p>
                </div>

                {/* Avatar & Pulse */}
                <div className="relative mb-8">
                    {/* CSS Animation for pulse effect would typically go here or be in global CSS. 
                         For now we use static rings to simulate it as per the HTML. */}
                    <div className="absolute inset-0 -m-8 rounded-full border border-primary/20 scale-110 opacity-60 animate-pulse"></div>
                    <div className="absolute inset-0 -m-4 rounded-full border border-primary/40 scale-105 opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }}></div>

                    <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white dark:border-[#232f48] shadow-2xl ring-4 ring-primary/20 bg-cover bg-center"
                        style={{ backgroundImage: `url(${otherUserAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserName}`})` }}
                    >
                        {/* Mute Overlay (optional) */}
                        {/* <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="material-symbols-outlined text-white text-4xl">mic_off</span>
                        </div> */}
                    </div>

                    {/* Audio Visualizer (Static representation) */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8">
                        <div className="w-1 bg-primary h-3 rounded-full animate-[wave_1s_ease-in-out_infinite]"></div>
                        <div className="w-1 bg-primary h-5 rounded-full animate-[wave_1.2s_ease-in-out_infinite]"></div>
                        <div className="w-1 bg-primary h-8 rounded-full animate-[wave_0.8s_ease-in-out_infinite]"></div>
                        <div className="w-1 bg-primary h-4 rounded-full animate-[wave_1.1s_ease-in-out_infinite]"></div>
                        <div className="w-1 bg-primary h-6 rounded-full animate-[wave_0.9s_ease-in-out_infinite]"></div>
                    </div>
                </div>

                {/* Name & Timer */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{otherUserName || 'Unknown User'}</h1>
                    <p className="text-slate-500 dark:text-[#92a4c9] text-lg font-medium mb-6">Connected</p>
                    <div className="font-mono text-4xl md:text-5xl font-bold tracking-widest tabular-nums opacity-80">
                        {formatDuration(duration)}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xl px-6 z-20">
                <div className="bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-xl p-4 flex items-center justify-between gap-4">
                    {/* Mic Toggle */}
                    <button
                        onClick={onToggleMic}
                        className={`group flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all ${isMicMuted ? 'bg-red-500/10 text-red-500' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                    >
                        <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">{isMicMuted ? 'mic_off' : 'mic'}</span>
                        <span className="text-[10px] font-medium mt-0.5 opacity-60">Mute</span>
                    </button>

                    {/* End Call */}
                    <button
                        onClick={onEndCall}
                        className="flex-1 h-14 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition-all transform hover:-translate-y-0.5"
                    >
                        <span className="material-symbols-outlined filled">call_end</span>
                        <span className="font-bold text-base tracking-wide">End Call</span>
                    </button>

                    {/* Speaker (Mock) */}
                    <button className="group flex flex-col items-center justify-center w-14 h-14 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all">
                        <span className="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">volume_up</span>
                        <span className="text-[10px] font-medium mt-0.5 opacity-60">Speaker</span>
                    </button>
                </div>
            </div>

            {/* Hidden audio element for local stream feedback loop prevention, though specialized handling might be needed */}
            {/* Note: In a real app, you'd handle audio routing carefully. Here we rely on the MeetingRoom parent or ensure tracks are played. */}
        </div>
    );
};

export default VoiceCall;
