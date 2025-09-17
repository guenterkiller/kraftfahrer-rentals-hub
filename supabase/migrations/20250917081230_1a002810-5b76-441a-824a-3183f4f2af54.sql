-- SECURITY HOTFIX: Protect driver admin summary (admin-only)

-- 1) RLS aktivieren
ALTER TABLE public.fahrer_profile_admin_summary ENABLE ROW LEVEL SECURITY;

-- 2) Eventuelle Alt-Policies entfernen (falls vorhanden)
DROP POLICY IF EXISTS "Public read driver admin summary"  ON public.fahrer_profile_admin_summary;
DROP POLICY IF EXISTS "Anyone can select"                 ON public.fahrer_profile_admin_summary;
DROP POLICY IF EXISTS fpas_public_select                  ON public.fahrer_profile_admin_summary;
DROP POLICY IF EXISTS fpas_public_update                  ON public.fahrer_profile_admin_summary;
DROP POLICY IF EXISTS fpas_public_insert                  ON public.fahrer_profile_admin_summary;
DROP POLICY IF EXISTS fpas_public_delete                  ON public.fahrer_profile_admin_summary;

-- 3) Sichere Policies setzen: NUR Admin darf lesen; keine Inserts/Updates/Deletes
CREATE POLICY fpas_admin_select
  ON public.fahrer_profile_admin_summary
  FOR SELECT
  USING ( public.is_admin_user() );