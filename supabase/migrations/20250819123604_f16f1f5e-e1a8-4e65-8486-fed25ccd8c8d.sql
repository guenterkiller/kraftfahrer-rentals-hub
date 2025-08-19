-- SECURITY FIX: Fix Security Definer view issue properly

-- Drop and recreate the view with proper security settings
DROP VIEW IF EXISTS public.fahrer_profile_admin_summary;

-- Recreate the view with security invoker mode (not definer)
-- This ensures the view executes with the privileges of the querying user
CREATE VIEW public.fahrer_profile_admin_summary 
WITH (security_invoker = true) AS
SELECT 
  id,
  vorname,
  nachname,
  -- Partially anonymize email and phone for privacy
  CASE 
    WHEN is_admin_user() THEN email
    ELSE CONCAT(LEFT(email, 3), '***', RIGHT(email, 10))
  END as email_display,
  CASE 
    WHEN is_admin_user() THEN telefon  
    ELSE CONCAT(LEFT(telefon, 3), '***', RIGHT(telefon, 3))
  END as telefon_display,
  ort,
  fuehrerscheinklassen,
  spezialisierungen,
  verfuegbare_regionen,
  stundensatz,
  erfahrung_jahre,
  status,
  created_at,
  updated_at
FROM public.fahrer_profile
WHERE is_admin_user(); -- Only admins can see any data

-- Grant access to authenticated users (RLS on underlying table will control access)
GRANT SELECT ON public.fahrer_profile_admin_summary TO authenticated;

COMMENT ON VIEW public.fahrer_profile_admin_summary IS 'Admin-only view with security invoker mode. Shows anonymized contact details for privacy protection while ensuring proper access control through underlying table RLS policies.';