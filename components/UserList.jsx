import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const UserList = ({ chats, onSelect, selectedChatId, currentUserEmail }) => {
    const [profiles, setProfiles] = useState({});

    useEffect(() => {
        const fetchProfiles = async () => {
            const emails = chats.map(chat =>
                chat.user_1_email === currentUserEmail ? chat.user_2_email : chat.user_1_email
            );

            if (emails.length === 0) return;

            const { data } = await supabase
                .from('users')
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

    return (
        <div className="flex-1 overflow-y-auto pt-2">
            {chats.map((chat) => {
                const otherEmail = chat.user_1_email === currentUserEmail ? chat.user_2_email : chat.user_1_email;
                const profile = profiles[otherEmail];
                const isSelected = selectedChatId === chat.id;

                // Random mock time/unread for demo visual match since backend might not have it yet
                const timeStr = "Now";
                const lastMessage = "Sure, sending the PDF now!";
                const hasUnread = false;

                return (
                    <div
                        key={chat.id}
                        onClick={() => onSelect(chat)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors group border-l-[3px] ${isSelected
                                ? 'bg-surface-dark/50 border-primary bg-[#232f48]/50'
                                : 'border-transparent hover:bg-[#232f48]/30'
                            }`}
                    >
                        <div className="relative shrink-0">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                                style={{ backgroundImage: `url(${profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherEmail}`})` }}
                            />
                            {/* Online dot mock */}
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
                                    <div className="size-5 rounded-full bg-surface-dark flex items-center justify-center text-[10px] text-white font-bold ml-2">3</div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UserList;
