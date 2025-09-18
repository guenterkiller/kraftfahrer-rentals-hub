-- Fix is_admin_user function to use user_roles table instead of admin_settings
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid DEFAULT auth.uid())
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public', 'pg_temp'
AS $$
  SELECT
    -- Edge Functions mit service_role sind immer "admin"
    current_setting('role', true) = 'service_role'
    OR
    -- Prüfe admin role in user_roles Tabelle
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = COALESCE(user_uuid, auth.uid()) 
      AND role = 'admin'
    );
$$;