-- Student Social Network - Complete Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- PHASE 1: EXTENDED PROFILES
-- ============================================

-- Drop existing users table constraints if needed and recreate profiles
-- Note: We're extending the existing users table concept with a profiles table

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    headline TEXT, -- "CS Student at MIT" etc.
    university TEXT,
    degree TEXT,
    graduation_year INTEGER,
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    location TEXT,
    website TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_university ON public.profiles(university);

-- ============================================
-- PHASE 2: CONNECTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_email TEXT NOT NULL,
    addressee_email TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requester_email, addressee_email)
);

CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections(requester_email);
CREATE INDEX IF NOT EXISTS idx_connections_addressee ON public.connections(addressee_email);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- ============================================
-- PHASE 3: POSTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_email TEXT NOT NULL,
    content TEXT,
    media_urls TEXT[] DEFAULT '{}',
    post_type TEXT CHECK (post_type IN ('text', 'image', 'video', 'document')) DEFAULT 'text',
    visibility TEXT CHECK (visibility IN ('public', 'connections', 'private')) DEFAULT 'connections',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_email);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);

-- ============================================
-- PHASE 4: LIKES
-- ============================================

CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_email, post_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_post ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_email);

-- ============================================
-- PHASE 5: COMMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_email TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_id);

-- ============================================
-- PHASE 6: BOOKMARKS
-- ============================================

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_email, post_id)
);

-- ============================================
-- PHASE 7: SOCIAL NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.social_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    type TEXT CHECK (type IN ('connection_request', 'connection_accepted', 'like', 'comment', 'reply', 'mention', 'share')) NOT NULL,
    actor_email TEXT NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_notifications_user ON public.social_notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_social_notifications_read ON public.social_notifications(is_read);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_notifications ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (can tighten later)
CREATE POLICY "Allow all on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on connections" ON public.connections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on likes" ON public.likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on bookmarks" ON public.bookmarks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on social_notifications" ON public.social_notifications FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- UPDATE EXISTING MESSAGES TABLE
-- ============================================

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS receiver_email TEXT;
