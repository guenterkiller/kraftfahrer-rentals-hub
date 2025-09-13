-- Drop the existing view
DROP VIEW IF EXISTS public.fahrer_profile_admin_summary;

-- Recreate the view with RLS security check
CREATE VIEW public.fahrer_profile_admin_summary AS
SELECT 
  id,
  vorname,
  nachname,
  CASE 
    WHEN is_admin_user() THEN email
    ELSE '*****@*****.***'
  END as email_display,
  CASE 
    WHEN is_admin_user() THEN telefon
    ELSE '*****'
  END as telefon_display,
  ort,
  fuehrerscheinklassen,
  spezialisierungen,
  verfuegbare_regionen,
  erfahrung_jahre,
  stundensatz,
  status,
  created_at,
  updated_at
FROM public.fahrer_profile
WHERE is_admin_user(); -- Only return rows if user is admin