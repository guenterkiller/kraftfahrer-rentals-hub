-- Security Fix: Remove hardcoded admin UUID and update RLS policies
-- This migration addresses 4 security issues:
-- 1. Remove hardcoded admin UUID from is_admin functions
-- 2. Restrict chat messages to authenticated users only
-- 3. Restrict location clusters to authenticated users only
-- 4. Add message length constraint to prevent spam

-- ============================================================
-- 1. Update is_admin_user() function - remove hardcoded UUID
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  );
$$;

-- ============================================================
-- 2. Update is_admin() function - simplify to call is_admin_user()
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = user_uuid
      AND ur.role = 'admin'
  );
$$;

-- ============================================================
-- 3. Update chat messages RLS policy - require authentication
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read chat messages" ON public.trucker_chat_messages;

CREATE POLICY "Authenticated can read chat messages"
ON public.trucker_chat_messages
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 4. Update location clusters RLS policy - require authentication
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read location clusters" ON public.trucker_locations;

CREATE POLICY "Authenticated can read location clusters"
ON public.trucker_locations
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- ============================================================
-- 5. Add message length constraint to prevent spam
-- ============================================================
ALTER TABLE public.trucker_chat_messages
DROP CONSTRAINT IF EXISTS message_length_check;

ALTER TABLE public.trucker_chat_messages
ADD CONSTRAINT message_length_check
CHECK (length(message) <= 500);