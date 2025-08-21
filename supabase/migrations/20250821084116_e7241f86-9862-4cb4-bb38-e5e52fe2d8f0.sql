-- Fix Security Definer View issue
-- Drop the problematic SECURITY DEFINER function
DROP FUNCTION IF EXISTS public.get_fahrer_profile_admin_summary();

-- Drop the existing view if it exists
DROP VIEW IF EXISTS public.fahrer_profile_admin_summary;

-- Create a secure view that properly enforces RLS
CREATE VIEW public.fahrer_profile_admin_summary AS
SELECT 
    fp.id,
    fp.vorname,
    fp.nachname,
    CASE
        WHEN is_admin_user() THEN fp.email
        ELSE concat(left(fp.email, 3), '***', right(fp.email, 10))
    END AS email_display,
    CASE
        WHEN is_admin_user() THEN fp.telefon
        ELSE concat(left(fp.telefon, 3), '***', right(fp.telefon, 3))
    END AS telefon_display,
    fp.ort,
    fp.fuehrerscheinklassen,
    fp.spezialisierungen,
    fp.verfuegbare_regionen,
    fp.stundensatz,
    fp.erfahrung_jahre,
    fp.status,
    fp.created_at,
    fp.updated_at
FROM public.fahrer_profile fp
WHERE is_admin_user();

-- Enable RLS on the view
ALTER VIEW public.fahrer_profile_admin_summary SET (security_barrier = true);

-- Create RLS policy for the view
CREATE POLICY "Only admins can access admin summary view"
ON public.fahrer_profile_admin_summary
FOR SELECT
USING (is_admin_user());