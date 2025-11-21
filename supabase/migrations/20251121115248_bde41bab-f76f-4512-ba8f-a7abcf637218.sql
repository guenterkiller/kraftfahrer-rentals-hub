-- Secure Admin Authentication Setup
-- This migration ensures the admin user exists and has proper role assignment

-- Note: The actual user account must be created via Supabase Auth Dashboard
-- Go to: Authentication > Users > Add User
-- Email: guenter.killer@t-online.de
-- Password: (set a strong password)
-- Email Confirm: Yes

-- Function to safely assign admin role to a user
CREATE OR REPLACE FUNCTION public.assign_admin_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create admin_sessions table for session tracking
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_activity timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text,
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS on admin_sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can view sessions
CREATE POLICY "Admins can view all sessions"
ON public.admin_sessions
FOR SELECT
TO authenticated
USING (is_admin_user());

-- System can insert sessions
CREATE POLICY "System can insert sessions"
ON public.admin_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can update their own sessions
CREATE POLICY "Users can update own sessions"
ON public.admin_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON public.admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON public.admin_sessions(is_active) WHERE is_active = true;

-- Function to log admin sessions
CREATE OR REPLACE FUNCTION public.log_admin_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log to admin_actions when admin logs in
  IF TG_OP = 'INSERT' AND is_admin_user() THEN
    INSERT INTO public.admin_actions (action, admin_email, note)
    VALUES (
      'admin_login',
      (SELECT email FROM auth.users WHERE id = NEW.user_id),
      'Session created from IP: ' || COALESCE(NEW.ip_address::text, 'unknown')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for session logging
DROP TRIGGER IF EXISTS log_admin_session_trigger ON public.admin_sessions;
CREATE TRIGGER log_admin_session_trigger
AFTER INSERT ON public.admin_sessions
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_session();

-- Function to cleanup old sessions
CREATE OR REPLACE FUNCTION public.cleanup_old_admin_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark sessions as inactive after 7 days of inactivity
  UPDATE public.admin_sessions
  SET is_active = false
  WHERE last_activity < now() - interval '7 days'
    AND is_active = true;
END;
$$;