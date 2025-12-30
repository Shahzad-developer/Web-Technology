import { supabase } from '../supabase';

export const notificationService = {
    // Get notifications for a user
    async getNotifications(email) {
        const { data, error } = await supabase
            .from('social_notifications')
            .select('*')
            .eq('user_email', email)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
        return data;
    },

    // Mark notifications as read
    async markAsRead(email) {
        const { error } = await supabase
            .from('social_notifications')
            .update({ is_read: true })
            .eq('user_email', email)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking notifications as read:', error);
        }
    },

    // Create a notification
    async createNotification(notification) {
        const { error } = await supabase
            .from('social_notifications')
            .insert([notification]);

        if (error) {
            console.error('Error creating notification:', error);
        }
    }
};
