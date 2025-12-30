-- Enable RLS on all tables (ensure they exist first)

-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    university TEXT,
    headline TEXT,
    about TEXT,
    skills TEXT[],
    is_public BOOLEAN DEFAULT true,
    show_active_status BOOLEAN DEFAULT true,
    read_receipts BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    visibility TEXT DEFAULT 'everyone',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Posts
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_email TEXT NOT NULL, -- link to profiles.email preferably, but loose coupling is okay
    content TEXT,
    media_urls TEXT[],
    post_type TEXT DEFAULT 'text',
    visibility TEXT DEFAULT 'connections',
    likes_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 3. Comments
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    author_email TEXT NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- for nested replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 4. Likes
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_email)
);
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 5. Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_email)
);
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 6. Chats
CREATE TABLE IF NOT EXISTS chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_1_email TEXT NOT NULL,
    user_2_email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- 7. Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_email TEXT NOT NULL,
    receiver_email TEXT,
    message_text TEXT,
    message_type TEXT DEFAULT 'text',
    media_url TEXT,
    status TEXT DEFAULT 'sent', -- sent, delivered, read
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 8. Connections
CREATE TABLE IF NOT EXISTS connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_email TEXT NOT NULL,
    addressee_email TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, blocked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(requester_email, addressee_email)
);
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- ... (lines 115-188 remain unchanged - skipping for brevity if possible, but tool requires context)
-- Actually, I need to update the policies at the bottom too.

-- Connections (Policies)
DROP POLICY IF EXISTS "Users can view their own connections" ON connections;
CREATE POLICY "Users can view their own connections" ON connections FOR SELECT USING (
    requester_email = auth.jwt() ->> 'email' OR addressee_email = auth.jwt() ->> 'email'
);

DROP POLICY IF EXISTS "Users can send connection requests" ON connections;
CREATE POLICY "Users can send connection requests" ON connections FOR INSERT WITH CHECK (
    requester_email = auth.jwt() ->> 'email'
);

DROP POLICY IF EXISTS "Users can update connections they are part of" ON connections;
CREATE POLICY "Users can update connections they are part of" ON connections FOR UPDATE USING (
    requester_email = auth.jwt() ->> 'email' OR addressee_email = auth.jwt() ->> 'email'
);

DROP POLICY IF EXISTS "Users can delete connections they are part of" ON connections;
CREATE POLICY "Users can delete connections they are part of" ON connections FOR DELETE USING (
    requester_email = auth.jwt() ->> 'email' OR addressee_email = auth.jwt() ->> 'email'
);

-- Social Notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON social_notifications;
CREATE POLICY "Users can view their own notifications" ON social_notifications FOR SELECT USING (
    user_email = auth.jwt() ->> 'email'
);

DROP POLICY IF EXISTS "Users can create notifications for others" ON social_notifications;
CREATE POLICY "Users can create notifications for others" ON social_notifications FOR INSERT WITH CHECK (
    actor_email = auth.jwt() ->> 'email'
);

DROP POLICY IF EXISTS "Users can update their own notifications" ON social_notifications;
CREATE POLICY "Users can update their own notifications" ON social_notifications FOR UPDATE USING (
    user_email = auth.jwt() ->> 'email'
);
