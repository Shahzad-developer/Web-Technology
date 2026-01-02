import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import { supabase } from '../supabase';
import MessageInput from './MessageInput';
import { Phone, Video, Play, Pause, Download } from 'lucide-react';

const ChatWindow = ({ chat, currentUserEmail, socket, onInitiateCall, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [otherProfile, setOtherProfile] = useState(null);
    const messagesEndRef = useRef(null);
    const otherEmail = chat.user_1_email === currentUserEmail ? chat.user_2_email : chat.user_1_email;

    const scrollToBottom = (smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const msgs = await chatService.getMessages(chat.id);
                setMessages(msgs || []);
                setTimeout(() => scrollToBottom(false), 100);
            } catch (err) {
                console.error('Error fetching messages:', err);
            }
        };

        const fetchProfile = async () => {
            try {
                const { data: prof, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('email', otherEmail)
                    .maybeSingle();

                if (prof) {
                    setOtherProfile(prof);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };

        fetchMessages();
        fetchProfile();

        socket?.emit('join_chat', chat.id);

        const handleReceiveMessage = (msg) => {
            if (msg.chat_id === chat.id && msg.sender_email !== currentUserEmail) {
                setMessages(prev => [...prev, msg]);
                setTimeout(() => scrollToBottom(), 50);
            }
        };

        socket?.on('receive_message', handleReceiveMessage);
        return () => {
            socket?.off('receive_message', handleReceiveMessage);
        };
    }, [chat.id, otherEmail, socket, currentUserEmail]);

    const handleSendMessage = async (text) => {
        try {
            const msg = await chatService.saveMessage(chat.id, currentUserEmail, otherEmail, text);
            // Update local state immediately for better responsiveness
            setMessages(prev => [...prev, msg]);
            socket?.emit('send_message', msg);
            setTimeout(() => scrollToBottom(), 50);
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const handleSendVoice = async (blob, duration) => {
        try {
            // Logic to upload blob to Supabase Storage would go here
            // For now, we'll simulate it or use a placeholder if storage isn't set up
            const fileName = `voice_${Date.now()}.webm`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('chat-media')
                .upload(`${chat.id}/${fileName}`, blob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-media')
                .getPublicUrl(`${chat.id}/${fileName}`);

            const msg = await chatService.saveMediaMessage(chat.id, currentUserEmail, otherEmail, 'voice', publicUrl, duration);
            setMessages(prev => [...prev, msg]);
            socket?.emit('send_message', msg);
            setTimeout(() => scrollToBottom(), 50);
        } catch (err) {
            console.error('Error sending voice message:', err);
        }
    };

    const handleSendFile = async (file) => {
        try {
            const fileName = `${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('chat-media')
                .upload(`${chat.id}/${fileName}`, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-media')
                .getPublicUrl(`${chat.id}/${fileName}`);

            const msg = await chatService.saveMediaMessage(
                chat.id, currentUserEmail, otherEmail, 'file', publicUrl, 0,
                file.name, file.type, file.size
            );
            setMessages(prev => [...prev, msg]);
            socket?.emit('send_message', msg);
            setTimeout(() => scrollToBottom(), 50);
        } catch (err) {
            console.error('Error sending file:', err);
        }
    };

    // Render Components
    return (
        <div className="flex-1 flex flex-col h-full bg-[#111722] relative min-w-0 min-h-0">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 flex items-center justify-between whitespace-nowrap border-b border-[#232f48] px-6 py-3 bg-[#111722] z-20 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="md:hidden text-slate-400 hover:text-white -ml-2">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                    )}
                    <div className="relative">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-[#232f48]"
                            style={{ backgroundImage: `url(${otherProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherEmail}`})` }}
                        />
                        <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-[#111722]"></div>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-white text-base font-bold leading-tight">
                            {otherProfile?.full_name || otherEmail.split('@')[0]}
                        </h2>
                        <p className="text-[#92a4c9] text-xs font-normal">Online</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => onInitiateCall('video', otherEmail, otherProfile?.full_name, otherProfile?.avatar_url)}
                        className="flex items-center justify-center rounded-lg size-10 hover:bg-[#232f48] text-[#92a4c9] hover:text-white transition-colors"
                        title="Video Call"
                    >
                        <span className="material-symbols-outlined">videocam</span>
                    </button>
                    <button
                        onClick={() => onInitiateCall('audio', otherEmail, otherProfile?.full_name, otherProfile?.avatar_url)}
                        className="flex items-center justify-center rounded-lg size-10 hover:bg-[#232f48] text-[#92a4c9] hover:text-white transition-colors"
                        title="Voice Call"
                    >
                        <span className="material-symbols-outlined">call</span>
                    </button>
                    <div className="w-px h-6 bg-[#232f48] self-center mx-1"></div>
                    <button className="flex items-center justify-center rounded-lg size-10 hover:bg-[#232f48] text-[#92a4c9] hover:text-white transition-colors" title="Chat Info">
                        <span className="material-symbols-outlined">info</span>
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent" id="message-container">
                <div className="flex justify-center">
                    <span className="bg-[#232f48] text-[#92a4c9] text-xs px-3 py-1 rounded-full font-medium">Today</span>
                </div>

                {messages.map((msg, index) => {
                    const isOwn = msg.sender_email === currentUserEmail;
                    return (
                        <div key={index} className={`flex gap-4 max-w-[70%] group ${isOwn ? 'flex-row-reverse self-end' : ''}`}>
                            {!isOwn && (
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0 mt-auto"
                                    style={{ backgroundImage: `url(${otherProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherEmail}`})` }}
                                />
                            )}

                            <div className={`flex flex-col gap-1 ${isOwn ? 'items-end' : ''}`}>
                                <div className={`${isOwn
                                    ? 'bg-primary rounded-br-none shadow-md shadow-primary/10'
                                    : 'bg-[#232f48] rounded-bl-none'} 
                                    p-3.5 rounded-2xl text-white text-[15px] leading-relaxed relative`}>

                                    {/* Text Content */}
                                    {msg.message_text && (msg.message_type === 'text' || !msg.message_type) && (
                                        <p className="whitespace-pre-wrap break-words">{msg.message_text}</p>
                                    )}

                                    {/* File Content */}
                                    {msg.message_type === 'file' && (
                                        <div className="flex items-center gap-3 w-64">
                                            <div className="size-10 bg-red-500/20 rounded-lg flex items-center justify-center text-red-500">
                                                <span className="material-symbols-outlined">picture_as_pdf</span>
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium truncate">{msg.file_name || 'Attachment'}</p>
                                                <p className="text-xs text-[#92a4c9]">{msg.file_size ? Math.round(msg.file_size / 1024) + ' KB' : 'File'}</p>
                                            </div>
                                            <div className="size-8 rounded-full bg-background-dark flex items-center justify-center text-[#92a4c9] hover:text-white cursor-pointer transition-colors">
                                                <Download className="w-4 h-4" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Voice Content */}
                                    {msg.message_type === 'voice' && (
                                        <div className="flex items-center gap-3 min-w-[200px]">
                                            <button className="size-8 rounded-full bg-white text-primary flex items-center justify-center">
                                                <Play className="w-4 h-4 fill-current ml-0.5" />
                                            </button>
                                            <div className="flex-1">
                                                <div className="h-6 flex items-center gap-0.5 opacity-80">
                                                    {[...Array(15)].map((_, i) => (
                                                        <div key={i} className={`w-1 rounded-full ${Math.random() > 0.5 ? 'h-4' : 'h-2'} bg-white/50`}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={`flex items-center gap-1 ${isOwn ? 'mr-1' : 'ml-1'}`}>
                                    <span className="text-[#92a4c9] text-[11px] font-medium">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isOwn && <span className="material-symbols-outlined text-primary text-[14px]">done_all</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 pt-0 bg-[#111722] z-20">
                <div className="bg-[#232f48] rounded-xl flex items-end p-2 ring-1 ring-transparent focus-within:ring-primary/50 transition-all shadow-lg">
                    <button className="p-2 text-[#92a4c9] hover:text-white rounded-lg hover:bg-[#34425e] transition-colors mb-0.5">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                    <div className="flex-1 min-h-[44px] flex items-center px-2 py-1">
                        <MessageInput
                            onSend={handleSendMessage}
                            onSendVoice={handleSendVoice}
                            onSendFile={handleSendFile}
                            minimal={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
