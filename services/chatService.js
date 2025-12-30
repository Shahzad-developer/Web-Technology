import { supabase } from '../supabase';

export const chatService = {
    async getChats(email) {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .or(`user_1_email.eq.${email},user_2_email.eq.${email}`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getMessages(chatId) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async createChat(user1Email, user2Email) {
        // Check if chat already exists
        const { data: existing } = await supabase
            .from('chats')
            .select('*')
            .or(`and(user_1_email.eq.${user1Email},user_2_email.eq.${user2Email}),and(user_1_email.eq.${user2Email},user_2_email.eq.${user1Email})`)
            .single();

        if (existing) return existing;

        const { data, error } = await supabase
            .from('chats')
            .insert([{ user_1_email: user1Email, user_2_email: user2Email }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Updated to include receiver_email for delivery tracking
    async saveMessage(chatId, senderEmail, receiverEmail, messageText) {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                chat_id: chatId,
                sender_email: senderEmail,
                receiver_email: receiverEmail,
                message_text: messageText,
                message_type: 'text',
                status: 'sent'
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Updated to include receiver_email
    async saveMediaMessage(chatId, senderEmail, receiverEmail, messageType, mediaUrl, duration = 0, fileName = null, fileType = null, fileSize = null) {
        console.log('📤 Saving media message:', { chatId, messageType, mediaUrl, fileName });

        const { data, error } = await supabase
            .from('messages')
            .insert([{
                chat_id: chatId,
                sender_email: senderEmail,
                receiver_email: receiverEmail,
                message_text: messageType === 'voice' ? '🎤 Voice message' : `📎 ${fileName || 'File'}`,
                message_type: messageType,
                media_url: mediaUrl,
                duration_seconds: duration,
                file_name: fileName,
                file_type: fileType,
                file_size: fileSize,
                status: 'sent'
            }])
            .select()
            .single();

        if (error) {
            console.error('❌ Error saving media message:', error);
            throw error;
        }

        console.log('✅ Media message saved:', data);
        return data;
    },

    async updateMessageStatus(messageId, status) {
        const { error } = await supabase
            .from('messages')
            .update({ status })
            .eq('id', messageId);

        if (error) console.error('Error updating message status:', error);
    },

    async markMessagesAsRead(chatId, readerEmail) {
        // Get unread messages
        const { data: unreadMessages } = await supabase
            .from('messages')
            .select('id')
            .eq('chat_id', chatId)
            .neq('sender_email', readerEmail)
            .neq('status', 'read');

        if (!unreadMessages || unreadMessages.length === 0) return [];

        const { error } = await supabase
            .from('messages')
            .update({ status: 'read' })
            .eq('chat_id', chatId)
            .neq('sender_email', readerEmail)
            .neq('status', 'read');

        if (error) console.error('Error marking messages as read:', error);

        return unreadMessages.map(m => m.id);
    }
};