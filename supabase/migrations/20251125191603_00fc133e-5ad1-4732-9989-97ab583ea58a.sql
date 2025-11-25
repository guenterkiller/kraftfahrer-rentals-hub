-- Fix is_admin_user() to allow service role access
-- This allows edge functions using service role key to pass admin checks

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Allow service role (used by edge functions) OR authenticated admin users
  SELECT 
    auth.role() = 'service_role' 
    OR 
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    );
$$;