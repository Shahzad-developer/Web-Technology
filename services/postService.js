import { supabase } from '../supabase';
import { notificationService } from './notificationService';

export const postService = {
    // Create a new post
    async createPost(authorEmail, content, mediaUrls = [], postType = 'text', visibility = 'connections') {
        const { data, error } = await supabase
            .from('posts')
            .insert([{
                author_email: authorEmail,
                content,
                media_urls: mediaUrls,
                post_type: postType,
                visibility
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating post:', error);
            throw error;
        }
        return data;
    },

    // Get post by ID
    async getPost(postId) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) {
            console.error('Error fetching post:', error);
            return null;
        }
        return data;
    },

    // Get posts by user
    async getPostsByUser(email, limit = 20, offset = 0) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('author_email', email)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching user posts:', error);
            return [];
        }
        return data || [];
    },

    // Get feed posts (supports 'all' or 'connections' filter)
    async getFeedPosts(connectedEmails = [], filter = 'all', limit = 20, offset = 0) {
        let query = supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (filter === 'connections') {
            if (!connectedEmails || connectedEmails.length === 0) {
                // If following tab but no connections, return empty or just self
                return [];
            }
            // Filter by connected authors + own posts (optional, but good UX)
            // Using .or syntax for "author in list OR visibility=public" is complex, 
            // for "Following" tab we usually want JUST connections (+ self).
            const authors = [...connectedEmails];
            query = query.in('author_email', authors);
        } else {
            // 'all' - global feed, no filter (except maybe visibility if we had private posts)
            // We can assume global feed shows everything for this demo
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching feed:', error);
            return [];
        }
        return data || [];
    },

    // Get public posts (for explore)
    async getPublicPosts(limit = 20, offset = 0) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('visibility', 'public')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching public posts:', error);
            return [];
        }
        return data || [];
    },

    // Search posts by content
    async searchPosts(query, limit = 20) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .ilike('content', `%${query}%`)
            .in('visibility', ['public', 'connections'])
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error searching posts:', error);
            return [];
        }
        return data || [];
    },

    // Get trending posts
    async getTrendingPosts(limit = 5) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('likes_count', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching trending posts:', error);
            return [];
        }
        return data || [];
    },

    // Get user posts (alias for profile page)
    async getUserPosts(email, limit = 20) {
        return this.getPostsByUser(email, limit, 0);
    },

    // Update post
    async updatePost(postId, authorEmail, updates) {
        const { data, error } = await supabase
            .from('posts')
            .update({
                ...updates,
                is_edited: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', postId)
            .eq('author_email', authorEmail) // Ensure ownership
            .select()
            .single();

        if (error) {
            console.error('Error updating post:', error);
            throw error;
        }
        return data;
    },

    // Delete post
    async deletePost(postId, authorEmail) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)
            .eq('author_email', authorEmail); // Ensure ownership

        if (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    },

    // Like a post
    async likePost(postId, userEmail) {
        const { error } = await supabase
            .from('likes')
            .insert([{ post_id: postId, user_email: userEmail }]);

        if (error && error.code !== '23505') { // Ignore duplicate
            console.error('Error liking post:', error);
            throw error;
        }

        // Increment likes count
        await supabase.rpc('increment_likes', { post_id: postId }).catch(() => {
            // If RPC doesn't exist, update manually
            supabase
                .from('posts')
                .update({ likes_count: supabase.sql`likes_count + 1` })
                .eq('id', postId);
        });

        // Notify post author
        try {
            const { data: post } = await supabase.from('posts').select('author_email').eq('id', postId).single();
            if (post && post.author_email !== userEmail) {
                await notificationService.createNotification({
                    user_email: post.author_email,
                    actor_email: userEmail,
                    type: 'like',
                    content: 'liked your post',
                    related_id: postId
                });
            }
        } catch (e) {
            console.error("Notify like error", e);
        }
    },

    // Unlike a post
    async unlikePost(postId, userEmail) {
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_email', userEmail);

        if (error) {
            console.error('Error unliking post:', error);
            throw error;
        }
    },

    // Check if user liked a post
    async hasLiked(postId, userEmail) {
        const { data } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_email', userEmail)
            .single();

        return !!data;
    },

    // Get likes for a post
    async getLikes(postId) {
        const { data, error } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', postId);

        if (error) {
            console.error('Error fetching likes:', error);
            return [];
        }
        return data || [];
    },

    // Add comment
    async addComment(postId, authorEmail, content, parentId = null) {
        const { data, error } = await supabase
            .from('comments')
            .insert([{
                post_id: postId,
                author_email: authorEmail,
                content,
                parent_id: parentId
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding comment:', error);
            throw error;
        }

        // Notify post author
        try {
            const { data: post } = await supabase.from('posts').select('author_email').eq('id', postId).single();
            if (post && post.author_email !== authorEmail) {
                await notificationService.createNotification({
                    user_email: post.author_email,
                    actor_email: authorEmail,
                    type: 'comment',
                    content: 'commented on your post',
                    related_id: postId
                });
            }
        } catch (e) {
            console.error("Notify comment error", e);
        }

        return data;
    },

    // Get "Events" (Posts with #event or #announcement)
    async getEvents() {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .or('content.ilike.%#event%,content.ilike.%#announcement%')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching events:', error);
            return [];
        }
        return data || [];
    },

    // Get Trending Hashtags from recent posts
    async getTrendingHashtags() {
        // Fetch recent 100 posts to extract tags
        const { data, error } = await supabase
            .from('posts')
            .select('content')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) return [];

        const tagCounts = {};
        data.forEach(post => {
            const tags = post.content.match(/#[a-zA-Z0-9_]+/g);
            if (tags) {
                tags.forEach(tag => {
                    // Normalize (lower case)
                    const normalized = tag.toLowerCase();
                    tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
                });
            }
        });

        // Convert to array, sort, and slice
        return Object.entries(tagCounts)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    },

    // Get comments for a post
    async getComments(postId) {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .is('parent_id', null) // Top-level comments only
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
        return data || [];
    },

    // Get replies for a comment
    async getReplies(commentId) {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('parent_id', commentId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching replies:', error);
            return [];
        }
        return data || [];
    },

    // Delete comment
    async deleteComment(commentId, authorEmail) {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('author_email', authorEmail);

        if (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    },

    // Bookmark post
    async bookmarkPost(postId, userEmail) {
        const { error } = await supabase
            .from('bookmarks')
            .insert([{ post_id: postId, user_email: userEmail }]);

        if (error && error.code !== '23505') {
            console.error('Error bookmarking:', error);
            throw error;
        }
    },

    // Remove bookmark
    async removeBookmark(postId, userEmail) {
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('post_id', postId)
            .eq('user_email', userEmail);

        if (error) {
            console.error('Error removing bookmark:', error);
            throw error;
        }
    },

    // Get user's bookmarks
    async getBookmarks(userEmail) {
        const { data, error } = await supabase
            .from('bookmarks')
            .select('post_id')
            .eq('user_email', userEmail);

        if (error) {
            console.error('Error fetching bookmarks:', error);
            return [];
        }

        if (!data || data.length === 0) return [];

        // Fetch the actual posts
        const postIds = data.map(b => b.post_id);
        const { data: posts } = await supabase
            .from('posts')
            .select('*')
            .in('id', postIds);

        return posts || [];
    },

    // Upload post media
    async uploadMedia(email, file) {
        const fileName = `${Date.now()}_${file.name}`;
        const path = `posts/${email}/${fileName}`;

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
    }
};
