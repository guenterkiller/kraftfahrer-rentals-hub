-- SECURITY FIX: Enable RLS on admin_settings table
-- This table contains sensitive admin configuration and must be protected

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create admin-only policies for admin_settings
-- Only admins can view admin settings
CREATE POLICY "admin_settings_admin_select"
  ON public.admin_settings
  FOR SELECT
  USING (public.is_admin_user());

-- Only admins can modify admin settings  
CREATE POLICY "admin_settings_admin_insert"
  ON public.admin_settings
  FOR INSERT
  WITH CHECK (public.is_admin_user());

CREATE POLICY "admin_settings_admin_update"
  ON public.admin_settings
  FOR UPDATE
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

CREATE POLICY "admin_settings_admin_delete"
  ON public.admin_settings
  FOR DELETE
  USING (public.is_admin_user());