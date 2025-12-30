import { supabase } from '../supabase';

export const profileService = {
    // Get profile by email
    async getProfile(email) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') { // Not found is ok
            console.error('Error fetching profile:', error);
        }
        return data;
    },

    // Get or create profile
    async getOrCreateProfile(email, fullName = null) {
        let profile = await this.getProfile(email);

        if (!profile) {
            const { data, error } = await supabase
                .from('profiles')
                .insert([{
                    email,
                    full_name: fullName || email.split('@')[0],
                    headline: 'New to ObrixChat',
                    is_public: true
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating profile:', error);
                return null;
            }
            profile = data;
        }

        return profile;
    },

    // Update profile
    async updateProfile(email, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('email', email)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
        return data;
    },

    // Generic upload photo wrapper (compatible with Profile.jsx)
    async uploadPhoto(email, file, type = 'avatar') {
        if (type === 'cover') {
            return await this.uploadCoverPhoto(email, file);
        }
        return await this.uploadProfilePhoto(email, file);
    },

    // Upload profile photo
    async uploadProfilePhoto(email, file) {
        const fileName = `avatar_${Date.now()}.${file.name.split('.').pop()}`;
        const path = `profiles/${email}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('chat-media')
            .upload(path, file, { contentType: file.type });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            // Fallback to base64
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }

        const { data: { publicUrl } } = supabase.storage
            .from('chat-media')
            .getPublicUrl(path);

        return publicUrl;
    },

    // Upload cover photo
    async uploadCoverPhoto(email, file) {
        const fileName = `cover_${Date.now()}.${file.name.split('.').pop()}`;
        const path = `profiles/${email}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('chat-media')
            .upload(path, file, { contentType: file.type });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            // Fallback to base64
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        }

        const { data: { publicUrl } } = supabase.storage
            .from('chat-media')
            .getPublicUrl(path);

        return publicUrl;
    },

    // Search profiles
    async searchProfiles(query, limit = 20) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,university.ilike.%${query}%`)
            .limit(limit);

        if (error) {
            console.error('Error searching profiles:', error);
            return [];
        }
        return data || [];
    },

    // Get profiles by university
    async getProfilesByUniversity(university, limit = 20) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('university', university)
            .limit(limit);

        if (error) {
            console.error('Error fetching university profiles:', error);
            return [];
        }
        return data || [];
    },

    // Get suggested profiles (same university, different from current user)
    async getSuggestedProfiles(email, university, limit = 10) {
        let query = supabase
            .from('profiles')
            .select('*')
            .neq('email', email)
            .limit(limit);

        if (university) {
            query = query.eq('university', university);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching suggestions:', error);
            return [];
        }
        return data || [];
    }
};
