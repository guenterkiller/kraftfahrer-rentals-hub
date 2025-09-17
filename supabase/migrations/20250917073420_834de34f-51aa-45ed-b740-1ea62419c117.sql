-- 0) RLS sicherstellen
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

-- 1) Gefährliche Policies entfernen
DROP POLICY IF EXISTS "Public can create job responses" ON public.job_assignments;
DROP POLICY IF EXISTS "Public can update job responses" ON public.job_assignments;

-- 2) Hilfsfunktionen (robust mit Fallback auf JWT-Claim 'role')
-- 2.1 Admin-Erkennung (JWT: {"role":"admin"})
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT (coalesce(NULLIF(current_setting('request.jwt.claims', true), ''), '{}')::json->>'role') = 'admin';
$$;

-- 2.2 Prüfen, ob aktueller Nutzer der zugewiesene Fahrer ist (über auth.uid → fahrer_profile.user_id)
CREATE OR REPLACE FUNCTION public.is_assigned_driver(_assignment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.job_assignments ja
    JOIN public.fahrer_profile fp
      ON fp.user_id = auth.uid()
     AND (ja.driver_id = fp.id OR ja.driver_user_id = fp.user_id)  -- je nach Schema
    WHERE ja.id = _assignment_id
  );
$$;

-- 3) Sichere Policies für job_assignments

-- 3.1 INSERT: Nur Edge Functions (service_role) oder Admin dürfen Assignments anlegen
CREATE POLICY job_assignments_insert_service
ON public.job_assignments
FOR INSERT
TO public
WITH CHECK (
  current_setting('role', true) = 'service_role'  -- Edge Function mit service_role-Header
  OR public.is_admin_user()
);

-- 3.2 SELECT: Admin alles; Fahrer nur eigene Assignments
CREATE POLICY job_assignments_select_admin
ON public.job_assignments
FOR SELECT
TO public
USING ( public.is_admin_user() OR public.is_assigned_driver(id) );

-- 3.3 UPDATE: 
--  - Admin darf alles
--  - Fahrer darf NUR Status-Felder toggeln (z. B. status, accepted_at/declined_at), KEINE Stammdaten
CREATE POLICY job_assignments_update_restricted
ON public.job_assignments
FOR UPDATE
TO public
USING (
  public.is_admin_user()
  OR public.is_assigned_driver(id)
)
WITH CHECK (
  public.is_admin_user()
  OR (
    public.is_assigned_driver(id)
    AND  -- Fahrer dürfen nur diese Felder ändern (Adjust je nach Schema)
      NEW.id = OLD.id
      AND NEW.job_id = OLD.job_id
      AND NEW.driver_id = OLD.driver_id
      AND NEW.rate_type = OLD.rate_type
      AND NEW.rate_value = OLD.rate_value
      AND NEW.start_date = OLD.start_date
      AND NEW.end_date   = OLD.end_date
      -- Erlaubte Änderungen:
      AND (
        (NEW.status IN ('accepted','declined') AND OLD.status IN ('assigned','accepted','declined'))
        OR NEW.status = OLD.status
      )
      AND (
        (NEW.accepted_at IS DISTINCT FROM OLD.accepted_at)
        OR (NEW.declined_at IS DISTINCT FROM OLD.declined_at)
        OR (NEW.accepted_at IS NULL AND OLD.accepted_at IS NULL)
        OR (NEW.declined_at IS NULL AND OLD.declined_at IS NULL)
      )
  )
);

-- 3.4 DELETE: Nur Admin
CREATE POLICY job_assignments_delete_admin
ON public.job_assignments
FOR DELETE
TO public
USING ( public.is_admin_user() );

-- 4) email_log absichern (nur Admin lesen/schreiben)
REVOKE ALL ON public.email_log FROM anon, authenticated;
CREATE POLICY email_log_admin_select
ON public.email_log
FOR SELECT
TO public
USING ( public.is_admin_user() );

CREATE POLICY email_log_admin_insert
ON public.email_log
FOR INSERT
TO public
WITH CHECK ( public.is_admin_user() OR current_setting('role', true) = 'service_role' );

-- (optional, wenn Updates/Deletes vorkommen)
CREATE POLICY email_log_admin_update
ON public.email_log
FOR UPDATE
TO public
USING ( public.is_admin_user() );

CREATE POLICY email_log_admin_delete
ON public.email_log
FOR DELETE
TO public
USING ( public.is_admin_user() );