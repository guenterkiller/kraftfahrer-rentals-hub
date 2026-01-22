-- Sicherstellen dass RLS aktiviert und erzwungen ist
ALTER TABLE public.fahrer_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fahrer_profile FORCE ROW LEVEL SECURITY;

-- Bestehende Policies sind bereits korrekt konfiguriert:
-- ✓ fahrer_profile_anon_no_select (RESTRICTIVE, USING false) - blockiert anon SELECT
-- ✓ fahrer_profile_admin_select (RESTRICTIVE, USING is_admin_user) - erlaubt Admin SELECT
-- ✓ fahrer_profile_service_insert (RESTRICTIVE) - erlaubt INSERT mit Validierung
-- ✓ fahrer_profile_admin_update (RESTRICTIVE) - erlaubt Admin UPDATE
-- ✓ fahrer_profile_admin_delete (RESTRICTIVE) - erlaubt Admin DELETE

-- Keine neuen Policies nötig - nur FORCE RLS sicherstellen