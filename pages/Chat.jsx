import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { callService } from '../services/callService';
import MainLayout from '../components/layout/MainLayout';
import UserList from '../components/UserList';
import ChatWindow from '../components/ChatWindow';
import VoiceCall from '../components/calling/VoiceCall';
import VideoCall from '../components/calling/VideoCall';
import IncomingCall from '../components/IncomingCall';
import { Search } from 'lucide-react';
import io from 'socket.io-client';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ]
};

const Chat = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [socket, setSocket] = useState(null);

    // Calling States
    const [incomingCall, setIncomingCall] = useState(null);
    const [activeCall, setActiveCall] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStreams, setRemoteStreams] = useState({});
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [peers, setPeers] = useState({});

    const localStreamRef = useRef(null);
    const peersRef = useRef({});

    // 1. Socket & Data Initialization
    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const newSocket = io(backendUrl, { transports: ['websocket', 'polling'] });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('✅ Socket connected');
            newSocket.emit('identify', user.email);
        });

        newSocket.on('incoming-call', async (data) => {
            setIncomingCall(data);
        });

        newSocket.on('call-rejected', () => {
            alert('Call rejected');
            cleanupCall();
        });

        newSocket.on('user-joined', async ({ socketId, userEmail, userName, userAvatar }) => {
            console.log('User joined room:', socketId);
            await createPeerConnection(newSocket, socketId, userEmail, userName, userAvatar, true);
        });

        newSocket.on('webrtc-signal', async ({ from, fromEmail, signal }) => {
            if (signal.type === 'offer') {
                await handleOffer(newSocket, from, fromEmail, signal);
            } else if (signal.type === 'answer') {
                await peersRef.current[from]?.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.candidate) {
                await peersRef.current[from]?.addIceCandidate(new RTCIceCandidate(signal));
            }
        });

        newSocket.on('user-left', (socketId) => {
            peersRef.current[socketId]?.close();
            delete peersRef.current[socketId];
            setRemoteStreams(prev => {
                const newStreams = { ...prev };
                delete newStreams[socketId];
                return newStreams;
            });
        });

        return () => newSocket.disconnect();
    }, [user.email]);

    useEffect(() => {
        const fetchData = async () => {
            const [chatData, profileData] = await Promise.all([
                chatService.getChats(user.email),
                authService.getCurrentUserProfile(user.id)
            ]);
            let currentChats = chatData;
            setChats(chatData);
            setCurrentUserProfile(profileData);

            // Handle deep linking
            const targetEmail = searchParams.get('email');
            if (targetEmail && targetEmail !== user.email) {
                try {
                    const chat = await chatService.createChat(user.email, targetEmail);
                    if (chat) {
                        const exists = currentChats.find(c => c.id === chat.id);
                        if (!exists) {
                            currentChats = [chat, ...currentChats];
                            setChats(currentChats);
                        }
                        setSelectedChat(chat);
                        setSearchParams({});
                    }
                } catch (e) {
                    console.error("Error initiating chat:", e);
                }
            }
        };
        fetchData();
    }, [user.id, user.email]);

    // 2. WebRTC Logic
    const createPeerConnection = async (currentSocket, targetSocketId, email, name, avatar, isInitiator) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

        pc.onicecandidate = (e) => {
            if (e.candidate) currentSocket.emit('webrtc-signal', { to: targetSocketId, from: user.email, signal: e.candidate });
        };

        pc.ontrack = (e) => {
            setRemoteStreams(prev => ({
                ...prev,
                [targetSocketId]: { stream: e.streams[0], userEmail: email, userName: name, userAvatar: avatar }
            }));
        };

        if (isInitiator) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            currentSocket.emit('webrtc-signal', { to: targetSocketId, from: user.email, signal: offer });
        }

        peersRef.current[targetSocketId] = pc;
        return pc;
    };

    const handleOffer = async (currentSocket, fromSocketId, fromEmail, offer) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

        pc.onicecandidate = (e) => {
            if (e.candidate) currentSocket.emit('webrtc-signal', { to: fromSocketId, from: user.email, signal: e.candidate });
        };

        pc.ontrack = (e) => {
            setRemoteStreams(prev => ({
                ...prev,
                [fromSocketId]: { stream: e.streams[0], userEmail: fromEmail }
            }));
        };

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        currentSocket.emit('webrtc-signal', { to: fromSocketId, from: user.email, signal: answer });

        peersRef.current[fromSocketId] = pc;
    };

    // 3. Call Actions
    const initiateCall = async (type, otherEmail, otherName, otherAvatar) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
            setLocalStream(stream);
            localStreamRef.current = stream;

            const roomId = `call_${Date.now()}`;
            setActiveCall({ roomId, type, otherEmail, otherName, otherAvatar });

            socket.emit('join-room', { roomId, userEmail: user.email });
            socket.emit('call-user', {
                to: otherEmail, from: user.email, type, roomId,
                callerName: currentUserProfile?.full_name, callerAvatar: currentUserProfile?.avatar_url
            });
        } catch (err) {
            console.error(err);
            alert('Could not access camera/microphone');
        }
    };

    const acceptCall = async () => {
        if (!incomingCall) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: incomingCall.type === 'video', audio: true });
            setLocalStream(stream);
            localStreamRef.current = stream;

            setActiveCall({
                roomId: incomingCall.roomId,
                type: incomingCall.type,
                otherEmail: incomingCall.from,
                otherName: incomingCall.callerName,
                otherAvatar: incomingCall.callerAvatar
            });

            socket.emit('join-room', { roomId: incomingCall.roomId, userEmail: user.email });
            setIncomingCall(null);
        } catch (err) {
            console.error(err);
        }
    };

    const endCall = () => {
        if (activeCall?.roomId) socket.emit('leave-room', activeCall.roomId);
        cleanupCall();
    };

    const cleanupCall = () => {
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        Object.values(peersRef.current).forEach(pc => pc.close());
        peersRef.current = {};
        setLocalStream(null);
        setRemoteStreams({});
        setActiveCall(null);
        setIncomingCall(null);
    };

    const toggleMic = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMicMuted(!isMicMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <MainLayout showSidebar={true} rightSidebar={null} disableScroll={true}>
            <div className="flex h-full bg-[#111722] text-white overflow-hidden font-display relative rounded-xl border border-[#232f48] shadow-sm">
                {/* Incoming Call Modal */}
                {incomingCall && <IncomingCall callData={incomingCall} onAccept={acceptCall} onReject={() => {
                    socket.emit('reject-call', { to: incomingCall.from });
                    setIncomingCall(null);
                }} />}

                {/* activeCall Overlay */}
                {activeCall && activeCall.type === 'audio' && (
                    <VoiceCall
                        room={activeCall}
                        currentUserEmail={user.email}
                        otherUserName={activeCall.otherName}
                        otherUserAvatar={activeCall.otherAvatar}
                        onEndCall={endCall}
                        onToggleMic={toggleMic}
                        isMicMuted={isMicMuted}
                    />
                )}

                {activeCall && activeCall.type === 'video' && (
                    <VideoCall
                        room={activeCall}
                        currentUserEmail={user.email}
                        otherUserName={activeCall.otherName}
                        otherUserAvatar={activeCall.otherAvatar}
                        localStream={localStream}
                        remoteStreams={remoteStreams}
                        onEndCall={endCall}
                        onToggleMic={toggleMic}
                        onToggleVideo={toggleVideo}
                        isMicMuted={isMicMuted}
                        isVideoOff={isVideoOff}
                    />
                )}

                {/* Conversation List (Left) */}
                <aside className={`w-full md:w-80 bg-[#111722] flex flex-col border-r border-[#232f48] shrink-0 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-[#232f48]">
                        <h1 className="text-xl font-bold tracking-tight mb-4">Messages</h1>
                        <label className="flex flex-col h-10 w-full group">
                            <div className="flex w-full flex-1 items-stretch rounded-lg h-full ring-1 ring-[#232f48] group-focus-within:ring-primary/50 transition-all bg-[#0d121c]">
                                <div className="text-[#92a4c9] flex border-none items-center justify-center pl-3 rounded-l-lg border-r-0">
                                    <Search className="w-4 h-4" />
                                </div>
                                <input
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 border-none bg-transparent h-full placeholder:text-[#92a4c9] px-3 rounded-l-none border-l-0 text-sm font-normal"
                                    placeholder="Search chats"
                                />
                            </div>
                        </label>
                    </div>
                    <UserList
                        chats={chats}
                        onSelect={setSelectedChat}
                        selectedChatId={selectedChat?.id}
                        currentUserEmail={user.email}
                    />
                </aside>

                {/* Active Chat Window (Right) */}
                <div className={`flex-1 bg-[#0b141a] flex-col h-full overflow-hidden ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
                    {selectedChat ? (
                        <ChatWindow
                            chat={selectedChat}
                            currentUserEmail={user.email}
                            socket={socket}
                            onInitiateCall={initiateCall}
                            onBack={() => setSelectedChat(null)}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="bg-[#232f48] p-4 rounded-full mb-4">
                                <span className="material-symbols-outlined text-4xl text-primary">chat</span>
                            </div>
                            <h2 className="text-xl font-medium text-white">Select a conversation</h2>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Chat;
