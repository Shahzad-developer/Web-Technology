import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const UserList = ({ chats, onSelect, selectedChatId, currentUserEmail, searchQuery }) => {
    const [profiles, setProfiles] = useState({});
    const [globalResults, setGlobalResults] = useState([]);
    const [loadingGlobal, setLoadingGlobal] = useState(false);

    useEffect(() => {
        const fetchProfiles = async () => {
            const emails = chats.map(chat =>
                chat.user_1_email === currentUserEmail ? chat.user_2_email : chat.user_1_email
            );

            if (emails.length === 0) return;

            const { data } = await supabase
                .from('profiles')
                .select('email, full_name, avatar_url')
                .in('email', emails);

            if (data) {
                const profileMap = {};
                data.forEach(p => { profileMap[p.email] = p; });
                setProfiles(profileMap);
            }
        };
        fetchProfiles();
    }, [chats, currentUserEmail]);

    useEffect(() => {
        const searchGlobal = async () => {
            if (!searchQuery || searchQuery.length < 3) {
                setGlobalResults([]);
                return;
            }

            setLoadingGlobal(true);
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('email, full_name, avatar_url')
                    .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
                    .neq('email', currentUserEmail)
                    .limit(5);

                setGlobalResults(data || []);
            } catch (err) {
                console.error('Global search error:', err);
            }
            setLoadingGlobal(false);
        };

        const timer = setTimeout(searchGlobal, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, currentUserEmail]);

    const filteredChats = chats.filter(chat => {
        if (!searchQuery) return true;
        const otherEmail = chat.user_1_email === currentUserEmail ? chat.user_2_email : chat.user_1_email;
        const profile = profiles[otherEmail];
        const nameMatch = profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const emailMatch = otherEmail.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || emailMatch;
    });

    // Deduplicate by person's email
    const uniquePeopleChats = [];
    const seenEmails = new Set();
    filteredChats.forEach(chat => {
        const otherEmail = chat.user_1_email === currentUserEmail ? chat.user_2_email : chat.user_1_email;
        if (!seenEmails.has(otherEmail)) {
            seenEmails.add(otherEmail);
            uniquePeopleChats.push(chat);
        }
    });

    const handleSelectGlobal = (email) => {
        // Find if we already have a chat with this user
        const existingChat = chats.find(c => c.user_1_email === email || c.user_2_email === email);
        if (existingChat) {
            onSelect(existingChat);
        } else {
            // Initiate a new chat object to trigger creation in Parent (Chat.jsx)
            onSelect({ user_1_email: currentUserEmail, user_2_email: email, isNew: true });
        }
    };

    return (
        <div className="flex-1 overflow-y-auto pt-2 scrollbar-thin">
            {uniquePeopleChats.length > 0 ? (
                uniquePeopleChats.map((chat) => {
                    const otherEmail = chat.user_1_email === currentUserEmail ? chat.user_2_email : chat.user_1_email;
                    const profile = profiles[otherEmail];
                    const isSelected = selectedChatId === chat.id;

                    const timeStr = "Now";
                    const lastMessage = "Sure, sending the PDF now!";
                    const hasUnread = false;

                    return (
                        <div
                            key={chat.id}
                            onClick={() => onSelect(chat)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group border-l-[3px] ${isSelected
                                ? 'bg-[#232f48]/50 border-primary'
                                : 'border-transparent hover:bg-[#232f48]/30'
                                }`}
                        >
                            <div className="relative shrink-0">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                                    style={{ backgroundImage: `url(${profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherEmail}`})` }}
                                />
                                <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-[#111722]"></div>
                            </div>
                            <div className="flex flex-col justify-center flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <p className="text-white text-[15px] font-semibold leading-normal truncate">
                                        {profile?.full_name || otherEmail.split('@')[0]}
                                    </p>
                                    <p className={`text-xs font-medium shrink-0 ${isSelected ? 'text-primary' : 'text-[#92a4c9]'}`}>
                                        {timeStr}
                                    </p>
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                    <p className="text-white text-sm font-normal leading-normal truncate opacity-90">
                                        {lastMessage}
                                    </p>
                                    {hasUnread && (
                                        <div className="size-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold ml-2">3</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : searchQuery && !loadingGlobal && globalResults.length === 0 ? (
                <div className="px-4 py-8 text-center text-[#92a4c9] text-sm italic">
                    No conversations found
                </div>
            ) : null}

            {searchQuery && (globalResults.length > 0 || loadingGlobal) && (
                <div className="mt-4 border-t border-[#232f48] pt-2">
                    <div className="px-4 py-2">
                        <h3 className="text-[#92a4c9] text-[10px] font-bold uppercase tracking-widest">Global Results</h3>
                    </div>
                    {loadingGlobal ? (
                        <div className="px-4 py-2 flex justify-center">
                            <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        globalResults.map(p => {
                            const alreadyInChats = chats.some(c => c.user_1_email === p.email || c.user_2_email === p.email);
                            if (alreadyInChats) return null;

                            return (
                                <div
                                    key={p.email}
                                    onClick={() => handleSelectGlobal(p.email)}
                                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#232f48]/30 transition-colors group"
                                >
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 shrink-0 ring-1 ring-[#232f48] group-hover:ring-primary/50"
                                        style={{ backgroundImage: `url(${p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.email}`})` }}
                                    />
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <p className="text-white text-sm font-semibold truncate">{p.full_name || p.email.split('@')[0]}</p>
                                        <p className="text-[#92a4c9] text-[11px] truncate">{p.email}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-primary text-[20px]">add_comment</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default UserList;
