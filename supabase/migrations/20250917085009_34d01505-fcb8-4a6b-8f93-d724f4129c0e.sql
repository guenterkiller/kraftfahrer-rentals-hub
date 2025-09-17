-- SECURITY ENHANCEMENT: Move admin view to private schema
-- This eliminates false positives from security scanners expecting RLS on views

-- 1) Privates Schema anlegen
CREATE SCHEMA IF NOT EXISTS private_admin;

-- 2) View in privates Schema verschieben
ALTER VIEW public.fahrer_profile_admin_summary
SET SCHEMA private_admin;

-- 3) Rechte hart setzen (nur service_role)
REVOKE ALL ON private_admin.fahrer_profile_admin_summary FROM PUBLIC, anon, authenticated;
GRANT  SELECT ON private_admin.fahrer_profile_admin_summary TO service_role;

-- 4) Zugriffsfunktion auf neues Schema umstellen
CREATE OR REPLACE FUNCTION public.get_fahrer_admin_summary()
RETURNS SETOF private_admin.fahrer_profile_admin_summary
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, private_admin
AS $$
  SELECT *
  FROM private_admin.fahrer_profile_admin_summary
  WHERE public.is_admin_user();
$$;

-- 5) Funktionsrechte schließen
REVOKE ALL ON FUNCTION public.get_fahrer_admin_summary() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_fahrer_admin_summary() TO service_role;

-- 6) Dokumentation
COMMENT ON SCHEMA private_admin IS 'Private schema for admin-only data - no public access allowed';
COMMENT ON VIEW private_admin.fahrer_profile_admin_summary IS 'Driver summary data - access only via public.get_fahrer_admin_summary() function';