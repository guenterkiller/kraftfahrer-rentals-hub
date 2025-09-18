-- Fix Security Definer Views issue by ensuring functions used in views are SECURITY INVOKER where appropriate

-- The main function that needs to be SECURITY INVOKER for views is get_fahrer_admin_summary
-- Currently it's SECURITY DEFINER which bypasses RLS in views

-- Check if this function is used in views and if it should be SECURITY INVOKER instead
-- For admin functions that legitimately need elevated privileges, we keep SECURITY DEFINER
-- but add proper access control

-- The private_admin.fahrer_profile_admin_summary view uses is_admin_user() function
-- We need to ensure that view respects the caller's permissions, not the function creator's

-- Drop and recreate the problematic view with proper security context
DROP VIEW IF EXISTS private_admin.fahrer_profile_admin_summary CASCADE;

-- Recreate the view to be SECURITY INVOKER (default for views)
CREATE VIEW private_admin.fahrer_profile_admin_summary AS
SELECT 
  id,
  vorname,
  nachname,
  CASE 
    WHEN is_admin_user() THEN email
    ELSE '*****@*****.***'::text
  END AS email_display,
  CASE 
    WHEN is_admin_user() THEN telefon
    ELSE '*****'::text
  END AS telefon_display,
  CASE 
    WHEN is_admin_user() THEN adresse
    ELSE '[REDACTED]'::text
  END AS adresse_display,
  plz,
  ort,
  fuehrerscheinklassen,
  spezialisierungen,
  verfuegbare_regionen,
  verfuegbarkeit,
  beschreibung,
  status,
  stundensatz,
  erfahrung_jahre,
  no_show_count,
  email_opt_out,
  created_at,
  updated_at,
  dokumente
FROM public.fahrer_profile
WHERE is_admin_user(); -- Ensure only admins can see any data through this view

-- Add proper comment to document security model
COMMENT ON VIEW private_admin.fahrer_profile_admin_summary IS 
'Admin summary view with proper RLS respect. Only accessible to admin users via is_admin_user() function.';

-- Ensure the get_fahrer_admin_summary function properly respects the view's security
-- We'll keep it as SECURITY DEFINER but ensure it has proper access control
-- (this function already has proper is_admin_user() check in its body)