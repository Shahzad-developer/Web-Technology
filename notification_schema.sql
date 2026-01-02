-- ObrixChat - Notifications Extension
-- Run this in Supabase SQL Editor

-- 1. Ensure type constraint includes 'message'
ALTER TABLE public.social_notifications 
DROP CONSTRAINT IF EXISTS social_notifications_type_check;

ALTER TABLE public.social_notifications 
ADD CONSTRAINT social_notifications_type_check 
CHECK (type IN ('connection_request', 'connection_accepted', 'like', 'comment', 'reply', 'mention', 'share', 'message'));

-- 2. Add content column if it doesn't exist
ALTER TABLE public.social_notifications 
ADD COLUMN IF NOT EXISTS content TEXT;

-- 3. Ensure RLS allows inserts for notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.social_notifications;
CREATE POLICY "System can create notifications" ON public.social_notifications
    FOR INSERT WITH CHECK (true);

-- 4. RPC for unread count (useful for badges)
CREATE OR REPLACE FUNCTION get_unread_notifications_count(p_user_email TEXT)
RETURNS BIGINT AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.social_notifications WHERE user_email = p_user_email AND is_read = false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
