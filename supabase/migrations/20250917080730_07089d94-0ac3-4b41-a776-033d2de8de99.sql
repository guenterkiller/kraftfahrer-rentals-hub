-- SECURITY HOTFIX: RLS & Policies ohne Neuanlage der Funktion

-- 1) RLS aktivieren
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags   ENABLE ROW LEVEL SECURITY;

-- 2) Alte/unsichere Policies entfernen (so viele Namen wie möglich abdecken)
DROP POLICY IF EXISTS "Public can create job responses"       ON public.job_assignments;
DROP POLICY IF EXISTS "Public can update job responses"       ON public.job_assignments;
DROP POLICY IF EXISTS "Public can view specific assignments"  ON public.job_assignments;
DROP POLICY IF EXISTS "Restricted assignment updates"         ON public.job_assignments;
DROP POLICY IF EXISTS "Admin and service can create assignments" ON public.job_assignments;
DROP POLICY IF EXISTS "Admin can view all assignments"        ON public.job_assignments;
DROP POLICY IF EXISTS "Admin can delete assignments"          ON public.job_assignments;
DROP POLICY IF EXISTS "job_assignments_insert_service"        ON public.job_assignments;
DROP POLICY IF EXISTS "job_assignments_select_admin"          ON public.job_assignments;
DROP POLICY IF EXISTS "job_assignments_update_restricted"     ON public.job_assignments;
DROP POLICY IF EXISTS "job_assignments_delete_admin"          ON public.job_assignments;

DROP POLICY IF EXISTS "Public can update feature flags"       ON public.feature_flags;
DROP POLICY IF EXISTS "System can update feature flags"       ON public.feature_flags;
DROP POLICY IF EXISTS "Anyone can update feature flags"       ON public.feature_flags;
DROP POLICY IF EXISTS "Feature flags public update"           ON public.feature_flags;
DROP POLICY IF EXISTS "Admins can manage feature flags"       ON public.feature_flags;

-- 3) Sichere Policies neu setzen
-- job_assignments
CREATE POLICY job_assignments_admin_select
  ON public.job_assignments
  FOR SELECT
  USING ( public.is_admin_user() );

CREATE POLICY job_assignments_admin_service_insert
  ON public.job_assignments
  FOR INSERT
  WITH CHECK ( public.is_admin_user() OR current_setting('role', true) = 'service_role' );

CREATE POLICY job_assignments_admin_service_update
  ON public.job_assignments
  FOR UPDATE
  USING ( public.is_admin_user() OR current_setting('role', true) = 'service_role' )
  WITH CHECK ( public.is_admin_user() OR current_setting('role', true) = 'service_role' );

CREATE POLICY job_assignments_admin_delete
  ON public.job_assignments
  FOR DELETE
  USING ( public.is_admin_user() );

-- feature_flags (nur Admin)
CREATE POLICY feature_flags_admin_select
  ON public.feature_flags
  FOR SELECT
  USING ( public.is_admin_user() );

CREATE POLICY feature_flags_admin_insert
  ON public.feature_flags
  FOR INSERT
  WITH CHECK ( public.is_admin_user() );

CREATE POLICY feature_flags_admin_update
  ON public.feature_flags
  FOR UPDATE
  USING ( public.is_admin_user() )
  WITH CHECK ( public.is_admin_user() );

CREATE POLICY feature_flags_admin_delete
  ON public.feature_flags
  FOR DELETE
  USING ( public.is_admin_user() );