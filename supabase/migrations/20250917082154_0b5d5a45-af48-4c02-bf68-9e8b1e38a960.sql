-- SINGLE-ADMIN SECURITY HARDENING
-- Ziel: Nur ein Admin (Günter) über zentrale E-Mail-Konfiguration

-- 1.1 Single-Admin Konfiguration
CREATE TABLE IF NOT EXISTS public.admin_settings (
  admin_email text PRIMARY KEY
);

-- Eintragen/aktualisieren der Admin-E-Mail
INSERT INTO public.admin_settings (admin_email)
VALUES ('info@kraftfahrer-mieten.com')
ON CONFLICT (admin_email) DO NOTHING;

-- 1.2 is_admin_user() härten auf E-Mail + service_role
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT
    -- Edge Functions mit service_role sind immer "admin"
    current_setting('role', true) = 'service_role'
    OR
    -- sonst nur, wenn die JWT-Email exakt der hinterlegten Admin-Email entspricht
    (COALESCE(NULLIF(current_setting('request.jwt.claims', true), ''), '{}')::json->>'email')
      = (SELECT admin_email FROM public.admin_settings LIMIT 1);
$$;