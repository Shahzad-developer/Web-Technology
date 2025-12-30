import { useState, useEffect } from 'react';

const VideoCall = ({
    room,
    currentUserEmail,
    otherUserName,
    otherUserAvatar,
    localStream,
    remoteStreams,
    onEndCall,
    onToggleMic,
    onToggleVideo,
    onToggleScreenShare,
    isMicMuted,
    isVideoOff,
    isScreenSharing
}) => {
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);

        // Auto-hide controls after 3 seconds of inactivity
        let idleTimer;
        const resetIdleTimer = () => {
            setShowControls(true);
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => setShowControls(false), 3000);
        };

        window.addEventListener('mousemove', resetIdleTimer);
        window.addEventListener('click', resetIdleTimer);
        resetIdleTimer();

        return () => {
            clearInterval(timer);
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('click', resetIdleTimer);
            clearTimeout(idleTimer);
        };
    }, []);

    const formatDuration = (secs) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    // Find remote stream
    const remoteStreamKey = Object.keys(remoteStreams)[0];
    const remoteStreamData = remoteStreamKey ? remoteStreams[remoteStreamKey] : null;

    return (
        <div className="absolute inset-0 z-50 bg-[#101622] text-white overflow-hidden flex flex-row">
            {/* Main Video Area */}
            <main className="relative flex-1 flex flex-col bg-black/40">
                {/* Floating Header */}
                <header className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
                    <div className="flex items-center gap-4">
                        <div
                            className="h-12 w-12 rounded-full bg-cover bg-center border border-white/10"
                            style={{ backgroundImage: `url(${otherUserAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserName}`})` }}
                        />
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-white text-lg font-bold leading-tight">{otherUserName || 'Unknown'}</h1>
                                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                            </div>
                            <p className="text-[#92a4c9] text-sm font-normal">Connected</p>
                        </div>
                    </div>
                    {/* Timer */}
                    <div className="absolute left-1/2 top-6 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md px-4 py-1.5 border border-white/5">
                        <span className="material-symbols-outlined text-red-500 text-[16px] animate-pulse">fiber_manual_record</span>
                        <span className="font-mono text-white text-sm font-medium tracking-wide">{formatDuration(duration)}</span>
                    </div>
                    {/* Security Badge */}
                    <div className="flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 backdrop-blur-md border border-white/5">
                        <span className="material-symbols-outlined text-[#135bec] text-[18px]">encrypted</span>
                        <span className="text-xs font-medium text-white/80">Encrypted</span>
                    </div>
                </header>

                {/* Video Feed */}
                <div className="relative flex h-full w-full items-center justify-center p-4">
                    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#161e2c] shadow-2xl ring-1 ring-white/5">
                        {/* Remote Video */}
                        {remoteStreamData?.stream ? (
                            <video
                                className="h-full w-full object-cover"
                                autoPlay
                                playsInline
                                ref={video => {
                                    if (video && remoteStreamData.stream) video.srcObject = remoteStreamData.stream;
                                }}
                            />
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center bg-[#161e2c]">
                                <img
                                    src={otherUserAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserName}`}
                                    className="w-32 h-32 rounded-full mb-4 opacity-50"
                                />
                                <p className="text-slate-400">Waiting for video...</p>
                            </div>
                        )}

                        {/* Self View PiP */}
                        <div className="absolute bottom-6 right-6 z-30 h-40 w-64 overflow-hidden rounded-xl border-2 border-[#232f48] shadow-2xl transition-transform hover:scale-105 group cursor-move bg-black">
                            {localStream ? (
                                <video
                                    className="h-full w-full object-cover transform -scale-x-100"
                                    autoPlay
                                    playsInline
                                    muted
                                    ref={video => {
                                        if (video && localStream) video.srcObject = localStream;
                                    }}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-black/80">
                                    <span className="material-symbols-outlined text-white/50">videocam_off</span>
                                </div>
                            )}
                            {isMicMuted && (
                                <div className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-white text-[14px]">mic_off</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                    <div className="flex items-center gap-3 rounded-2xl bg-[#161e2c]/90 p-2 shadow-xl ring-1 ring-white/10 backdrop-blur-xl">
                        {/* Mic */}
                        <button
                            onClick={onToggleMic}
                            className={`group flex h-12 w-12 items-center justify-center rounded-xl transition-all ${isMicMuted ? 'bg-red-500 text-white' : 'bg-[#232f48] text-white hover:bg-white hover:text-black'}`}
                        >
                            <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">{isMicMuted ? 'mic_off' : 'mic'}</span>
                        </button>
                        {/* Camera */}
                        <button
                            onClick={onToggleVideo}
                            className={`group flex h-12 w-12 items-center justify-center rounded-xl transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-[#232f48] text-white hover:bg-white hover:text-black'}`}
                        >
                            <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">{isVideoOff ? 'videocam_off' : 'videocam'}</span>
                        </button>
                        {/* Screen Share */}
                        <button
                            onClick={onToggleScreenShare}
                            className={`group flex h-12 w-12 items-center justify-center rounded-xl transition-all ${isScreenSharing ? 'bg-primary text-white' : 'bg-[#232f48] text-white hover:bg-primary hover:text-white'}`}
                        >
                            <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">present_to_all</span>
                        </button>

                        <div className="h-8 w-px bg-white/10 mx-1"></div>

                        {/* Chat Toggle (Visual only for now since chat sidepane is permanent in this plan, adjust if needed) */}
                        <button className="group flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                            <span className="material-symbols-outlined text-[24px]">chat</span>
                        </button>

                        <div className="h-8 w-px bg-white/10 mx-1"></div>

                        {/* End Call */}
                        <button
                            onClick={onEndCall}
                            className="group flex h-12 items-center gap-2 rounded-xl bg-red-600 px-5 text-white hover:bg-red-500 transition-all shadow-lg shadow-red-900/20"
                        >
                            <span className="material-symbols-outlined text-[20px] fill-current">call_end</span>
                            <span className="text-sm font-bold">End Call</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* In-Call Chat (Sidebar) - Optional/Mock for now as per HTML structure */}
            {/* The main chat functionality remains in the underlying page, but the design shows a sidebar. 
                For this implementation, we will keep the VideoCall as a fullscreen overlay and rely on the main ChatWindow if we minimize specific parts, 
                OR we can implement a basic chat overlay here. Since the prompt shows a "SIDEBAR: Chat & Files", let's include a placeholder. */}
        </div>
    );
};

export default VideoCall;
