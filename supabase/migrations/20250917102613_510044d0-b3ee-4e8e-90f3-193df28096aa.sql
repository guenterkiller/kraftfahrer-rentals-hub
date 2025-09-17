-- Fix: Status & Mail + Schutz vor Doppel-Zuweisung

-- 1) Eindeutigkeit sicherstellen
-- 1a) Gleiches (job_id, driver_id) nur einmal -> ermöglicht echtes UPSERT
CREATE UNIQUE INDEX IF NOT EXISTS ux_job_assignments_job_driver
ON public.job_assignments (job_id, driver_id);

-- 1b) Optional/empfohlen: Pro Job nur EIN aktiver Fahrer (assigned/confirmed)
CREATE UNIQUE INDEX IF NOT EXISTS ux_job_assignments_job_active
ON public.job_assignments (job_id)
WHERE status IN ('assigned','confirmed');

-- 2) admin_assign_driver: nach UPSERT auch job_requests.status setzen
CREATE OR REPLACE FUNCTION public.admin_assign_driver(
  _job_id uuid,
  _driver_id uuid,
  _rate_type text DEFAULT NULL,
  _rate_value numeric DEFAULT NULL,
  _start_date date DEFAULT NULL,
  _end_date date DEFAULT NULL,
  _note text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _id uuid;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.job_assignments
    (id, job_id, driver_id, status, assigned_at,
     rate_type, rate_value, start_date, end_date, admin_note)
  VALUES
    (gen_random_uuid(), _job_id, _driver_id, 'assigned', now(),
     _rate_type, _rate_value, _start_date, _end_date, _note)
  ON CONFLICT (job_id, driver_id)
  DO UPDATE SET
     status      = 'assigned',
     assigned_at = COALESCE(public.job_assignments.assigned_at, now()),
     rate_type   = COALESCE(EXCLUDED.rate_type,  public.job_assignments.rate_type),
     rate_value  = COALESCE(EXCLUDED.rate_value, public.job_assignments.rate_value),
     start_date  = COALESCE(EXCLUDED.start_date, public.job_assignments.start_date),
     end_date    = COALESCE(EXCLUDED.end_date,   public.job_assignments.end_date),
     admin_note  = COALESCE(EXCLUDED.admin_note, public.job_assignments.admin_note)
  RETURNING id INTO _id;

  -- Wichtig: Anfrage-Status sichtbar umstellen
  UPDATE public.job_requests
     SET status = 'assigned'
   WHERE id = _job_id
     AND status IS DISTINCT FROM 'confirmed';

  -- Audit
  INSERT INTO public.admin_actions (action, job_id, assignment_id, admin_email, note)
  VALUES ('assign_driver', _job_id, _id, (SELECT admin_email FROM public.admin_settings LIMIT 1), _note);

  RETURN _id;
END $$;

-- 3) admin_confirm_assignment: auch job_requests.status = 'confirmed'
CREATE OR REPLACE FUNCTION public.admin_confirm_assignment(_assignment_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _job_id uuid;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.job_assignments
     SET status = 'confirmed',
         confirmed_by_admin = true,
         confirmed_at = COALESCE(confirmed_at, now())
   WHERE id = _assignment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'assignment not found: %', _assignment_id;
  END IF;

  SELECT job_id INTO _job_id FROM public.job_assignments WHERE id = _assignment_id;

  UPDATE public.job_requests
     SET status = 'confirmed'
   WHERE id = _job_id;

  -- Audit
  INSERT INTO public.admin_actions (action, job_id, assignment_id, admin_email)
  VALUES ('admin_confirm', _job_id, _assignment_id, (SELECT admin_email FROM public.admin_settings LIMIT 1));

  RETURN true;
END $$;

-- Feature Flag sicherstellen
INSERT INTO public.feature_flags (flag_name, enabled, description)
VALUES ('ORDER_CONFIRMATION_ENABLED', true, 'Enable order confirmation emails and PDFs')
ON CONFLICT (flag_name) DO UPDATE SET enabled = true;