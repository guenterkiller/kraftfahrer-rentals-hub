-- Drop and recreate the view with SECURITY DEFINER to ensure proper access control
DROP VIEW IF EXISTS public.fahrer_profile_admin_summary;

-- Create a secure function to get admin summary data
CREATE OR REPLACE FUNCTION public.get_fahrer_profile_admin_summary()
RETURNS TABLE (
    id uuid,
    vorname text,
    nachname text,
    email_display text,
    telefon_display text,
    ort text,
    fuehrerscheinklassen text[],
    spezialisierungen text[],
    verfuegbare_regionen text[],
    stundensatz numeric,
    erfahrung_jahre integer,
    status text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
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
$$;

-- Recreate the view using the secure function
CREATE VIEW public.fahrer_profile_admin_summary AS
SELECT * FROM public.get_fahrer_profile_admin_summary();