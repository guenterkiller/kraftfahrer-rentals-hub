-- Drop the existing view
DROP VIEW IF EXISTS public.fahrer_profile_admin_summary;

-- Recreate the view with proper security invoker mode
CREATE VIEW public.fahrer_profile_admin_summary 
WITH (security_invoker = true) AS
SELECT 
    id,
    vorname,
    nachname,
    CASE
        WHEN is_admin_user() THEN email
        ELSE concat("left"(email, 3), '***', "right"(email, 10))
    END AS email_display,
    CASE
        WHEN is_admin_user() THEN telefon
        ELSE concat("left"(telefon, 3), '***', "right"(telefon, 3))
    END AS telefon_display,
    ort,
    fuehrerscheinklassen,
    spezialisierungen,
    verfuegbare_regionen,
    stundensatz,
    erfahrung_jahre,
    status,
    created_at,
    updated_at
FROM fahrer_profile
WHERE is_admin_user();