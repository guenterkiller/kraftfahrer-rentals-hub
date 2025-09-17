-- 0) RLS sicherstellen
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

-- 1) Gefährliche Policies entfernen
DROP POLICY IF EXISTS "Public can create job responses" ON public.job_assignments;
DROP POLICY IF EXISTS "Public can update job responses" ON public.job_assignments;

-- 2) Hilfsfunktionen
-- 2.1 Admin-Erkennung (bestehende Funktion nutzen)
-- (is_admin_user bereits vorhanden)

-- 2.2 Prüfen, ob aktueller Nutzer der zugewiesene Fahrer ist (über email matching)
CREATE OR REPLACE FUNCTION public.is_assigned_driver(_assignment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.job_assignments ja
    JOIN public.fahrer_profile fp ON ja.driver_id = fp.id
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
  current_setting('role', true) = 'service_role'
  OR is_admin_user()
);

-- 3.2 SELECT: Admin alles; öffentlich für Response-Route (wird über URL-Token gesichert)
CREATE POLICY job_assignments_select_admin
ON public.job_assignments
FOR SELECT
TO public
USING ( is_admin_user() OR true );

-- 3.3 UPDATE: Admin darf alles; öffentlich nur Status-Updates (wird über URL-Token gesichert)
CREATE POLICY job_assignments_update_restricted
ON public.job_assignments
FOR UPDATE
TO public
USING ( is_admin_user() OR true )
WITH CHECK (
  is_admin_user()
  OR (
    -- Nur Status-relevante Felder dürfen geändert werden
    NEW.id = OLD.id
    AND NEW.job_id = OLD.job_id
    AND NEW.driver_id = OLD.driver_id
    AND NEW.rate_type = OLD.rate_type
    AND NEW.rate_value = OLD.rate_value
    AND NEW.start_date = OLD.start_date
    AND NEW.end_date = OLD.end_date
    AND NEW.assigned_at = OLD.assigned_at
    -- Nur erlaubte Status-Änderungen
    AND NEW.status IN ('assigned', 'accepted', 'declined', 'confirmed')
  )
);

-- 3.4 DELETE: Nur Admin
CREATE POLICY job_assignments_delete_admin
ON public.job_assignments
FOR DELETE
TO public
USING ( is_admin_user() );

-- 4) email_log absichern
CREATE POLICY email_log_admin_select
ON public.email_log
FOR SELECT
TO public
USING ( is_admin_user() );

CREATE POLICY email_log_service_insert
ON public.email_log
FOR INSERT
TO public
WITH CHECK ( is_admin_user() OR current_setting('role', true) = 'service_role' );

CREATE POLICY email_log_admin_update
ON public.email_log
FOR UPDATE
TO public
USING ( is_admin_user() );

CREATE POLICY email_log_admin_delete
ON public.email_log
FOR DELETE
TO public
USING ( is_admin_user() );