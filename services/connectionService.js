import { supabase } from '../supabase';
import { notificationService } from './notificationService';

export const connectionService = {
    // Get connection status between two users
    async getConnectionStatus(email1, email2) {
        // Check both directions
        const { data } = await supabase
            .from('connections')
            .select('*')
            .or(`and(requester_email.eq.${email1},addressee_email.eq.${email2}),and(requester_email.eq.${email2},addressee_email.eq.${email1})`)
            .single();

        if (!data) return { status: 'not_connected', connection: null };

        // Determine the relationship from current user's perspective
        if (data.status === 'blocked') {
            return { status: 'blocked', connection: data };
        }

        if (data.status === 'accepted') {
            return { status: 'connected', connection: data };
        }

        if (data.status === 'pending') {
            if (data.requester_email === email1) {
                return { status: 'request_sent', connection: data };
            } else {
                return { status: 'request_received', connection: data };
            }
        }

        return { status: 'not_connected', connection: data };
    },

    // Send connection request
    async sendRequest(requesterEmail, addresseeEmail) {
        const { data, error } = await supabase
            .from('connections')
            .insert([{
                requester_email: requesterEmail,
                addressee_email: addresseeEmail,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error sending connection request:', error);
            throw error;
        }

        // Notify recipient
        await notificationService.createNotification({
            user_email: addresseeEmail,
            actor_email: requesterEmail,
            type: 'connection_request',
            content: 'sent you a connection request',
            related_id: data.id // connection id
        });

        return data;
    },

    // Accept connection request
    async acceptRequest(requesterEmail, addresseeEmail) {
        const { data, error } = await supabase
            .from('connections')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('requester_email', requesterEmail)
            .eq('addressee_email', addresseeEmail)
            .select()
            .single();

        if (error) {
            console.error('Error accepting request:', error);
            throw error;
        }

        // Notify requester
        await notificationService.createNotification({
            user_email: requesterEmail,
            actor_email: addresseeEmail,
            type: 'connection_accepted',
            content: 'accepted your connection request',
            related_id: data.id
        });

        return data;
    },

    // Reject connection request
    async rejectRequest(requesterEmail, addresseeEmail) {
        const { error } = await supabase
            .from('connections')
            .delete()
            .eq('requester_email', requesterEmail)
            .eq('addressee_email', addresseeEmail);

        if (error) {
            console.error('Error rejecting request:', error);
            throw error;
        }
    },

    // Cancel sent request
    async cancelRequest(requesterEmail, addresseeEmail) {
        const { error } = await supabase
            .from('connections')
            .delete()
            .eq('requester_email', requesterEmail)
            .eq('addressee_email', addresseeEmail);

        if (error) {
            console.error('Error canceling request:', error);
            throw error;
        }
    },

    // Remove connection
    async removeConnection(email1, email2) {
        const { error } = await supabase
            .from('connections')
            .delete()
            .or(`and(requester_email.eq.${email1},addressee_email.eq.${email2}),and(requester_email.eq.${email2},addressee_email.eq.${email1})`);

        if (error) {
            console.error('Error removing connection:', error);
            throw error;
        }
    },

    // Block user
    async blockUser(blockerEmail, blockedEmail) {
        // First remove any existing connection
        await this.removeConnection(blockerEmail, blockedEmail).catch(() => { });

        const { data, error } = await supabase
            .from('connections')
            .insert([{
                requester_email: blockerEmail,
                addressee_email: blockedEmail,
                status: 'blocked'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
        return data;
    },

    // Unblock user
    async unblockUser(blockerEmail, blockedEmail) {
        const { error } = await supabase
            .from('connections')
            .delete()
            .eq('requester_email', blockerEmail)
            .eq('addressee_email', blockedEmail)
            .eq('status', 'blocked');

        if (error) {
            console.error('Error unblocking user:', error);
            throw error;
        }
    },

    // Get all connections for a user
    async getConnections(email) {
        const { data, error } = await supabase
            .from('connections')
            .select('*')
            .eq('status', 'accepted')
            .or(`requester_email.eq.${email},addressee_email.eq.${email}`);

        if (error) {
            console.error('Error fetching connections:', error);
            return [];
        }

        // Extract the other person's email from each connection
        return (data || []).map(conn => ({
            ...conn,
            connected_email: conn.requester_email === email ? conn.addressee_email : conn.requester_email
        }));
    },

    // Get pending requests received
    async getPendingRequests(email) {
        const { data, error } = await supabase
            .from('connections')
            .select('*')
            .eq('addressee_email', email)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pending requests:', error);
            return [];
        }
        return data || [];
    },

    // Get sent requests
    async getSentRequests(email) {
        const { data, error } = await supabase
            .from('connections')
            .select('*')
            .eq('requester_email', email)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching sent requests:', error);
            return [];
        }
        return data || [];
    },

    // Get connection count
    async getConnectionCount(email) {
        const { count, error } = await supabase
            .from('connections')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'accepted')
            .or(`requester_email.eq.${email},addressee_email.eq.${email}`);

        if (error) {
            console.error('Error counting connections:', error);
            return 0;
        }
        return count || 0;
    },

    // Get blocked users
    async getBlockedUsers(email) {
        const { data, error } = await supabase
            .from('connections')
            .select('addressee_email')
            .eq('requester_email', email)
            .eq('status', 'blocked');

        if (error) {
            console.error('Error fetching blocked users:', error);
            return [];
        }

        return data.map(item => item.addressee_email);
    }
};
