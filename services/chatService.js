import { supabase } from '../supabase';

export const chatService = {
    async getChats(email) {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .or(`user_1_email.eq.${email},user_2_email.eq.${email}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Deduplicate in case old data has both A,B and B,A or redundant IDs
        const unique = [];
        const seen = new Set();
        (data || []).forEach(chat => {
            const recipient = chat.user_1_email === email ? chat.user_2_email : chat.user_1_email;
            if (!seen.has(recipient)) {
                seen.add(recipient);
                unique.push(chat);
            }
        });

        return unique;
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
        // Standardize order to prevent duplicates (user_1 is always alphabetically smaller)
        const [u1, u2] = [user1Email, user2Email].sort();

        // Check if chat already exists
        const { data: existing, error: searchError } = await supabase
            .from('chats')
            .select('*')
            .eq('user_1_email', u1)
            .eq('user_2_email', u2)
            .maybeSingle();

        if (existing) return existing;

        const { data, error } = await supabase
            .from('chats')
            .insert([{ user_1_email: u1, user_2_email: u2 }])
            .select()
            .single();

        if (error) {
            // If insertion fails due to race condition (duplicate key)
            if (error.code === '23505') {
                const { data: retry } = await supabase
                    .from('chats')
                    .select('*')
                    .eq('user_1_email', u1)
                    .eq('user_2_email', u2)
                    .maybeSingle();
                return retry;
            }
            throw error;
        }
        return data;
    },

    // Updated to include receiver_email for delivery tracking
    async saveMessage(chatId, senderEmail, receiverEmail, text) {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                chat_id: chatId,
                sender_email: senderEmail,
                receiver_email: receiverEmail,
                message_text: text,
                message_type: 'text',
                status: 'sent'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error saving message:', error);
            throw error;
        }

        // Notify recipient of new message
        try {
            await notificationService.createNotification({
                user_email: receiverEmail,
                actor_email: senderEmail,
                type: 'message',
                content: `sent you a message: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
                related_id: chatId
            });
        } catch (e) {
            console.error("Notify message error", e);
        }

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