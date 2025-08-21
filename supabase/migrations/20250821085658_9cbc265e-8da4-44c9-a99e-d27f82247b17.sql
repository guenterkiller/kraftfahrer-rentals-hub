-- Drop and recreate the admin summary view with security protections
DROP VIEW IF EXISTS public.fahrer_profile_admin_summary;

CREATE VIEW public.fahrer_profile_admin_summary
WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  fp.id,
  fp.vorname,
  fp.nachname,
  fp.email as email_display,
  fp.telefon as telefon_display,
  fp.ort,
  fp.fuehrerscheinklassen,
  fp.spezialisierungen,
  fp.verfuegbare_regionen,
  fp.erfahrung_jahre,
  fp.stundensatz,
  fp.status,
  fp.created_at,
  fp.updated_at
FROM public.fahrer_profile fp
WHERE public.is_admin_user();

COMMENT ON VIEW public.fahrer_profile_admin_summary IS
  'Admin-only summary. SECURITY INVOKER + SECURITY BARRIER; rows restricted by WHERE is_admin_user() and underlying fahrer_profile RLS.';