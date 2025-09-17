-- 1) Felder für No-Show
ALTER TABLE public.job_assignments
  ADD COLUMN IF NOT EXISTS no_show_at              timestamptz,
  ADD COLUMN IF NOT EXISTS no_show_reason          text,
  ADD COLUMN IF NOT EXISTS no_show_marked_by_admin boolean NOT NULL DEFAULT false;

-- Optional: Kennzähler im Fahrerprofil
ALTER TABLE public.fahrer_profile
  ADD COLUMN IF NOT EXISTS no_show_count integer NOT NULL DEFAULT 0;

-- 2) Status-Übergänge erweitern (assigned -> confirmed|cancelled|no_show)
CREATE OR REPLACE FUNCTION public.enforce_assignment_transitions()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status NOT IN ('assigned','confirmed','cancelled','no_show') THEN
      RAISE EXCEPTION 'invalid status %', NEW.status;
    END IF;

    IF NEW.status = 'confirmed' AND OLD.status <> 'assigned' THEN
      RAISE EXCEPTION 'confirm allowed only from status=assigned';
    END IF;
    IF NEW.status = 'confirmed' AND NEW.confirmed_by_admin IS NOT TRUE THEN
      RAISE EXCEPTION 'confirmed_by_admin must be true';
    END IF;
    IF NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN
      NEW.confirmed_at := now();
    END IF;

    IF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
      NEW.cancelled_at := now();
    END IF;

    IF NEW.status = 'no_show' AND NEW.no_show_at IS NULL THEN
      NEW.no_show_at := now();
    END IF;
  END IF;
  RETURN NEW;
END $function$;

DROP TRIGGER IF EXISTS trg_enforce_assignment_transitions ON public.job_assignments;
CREATE TRIGGER trg_enforce_assignment_transitions
BEFORE UPDATE ON public.job_assignments
FOR EACH ROW EXECUTE FUNCTION public.enforce_assignment_transitions();

-- 3) Admin-RPC: No-Show markieren
CREATE OR REPLACE FUNCTION public.admin_mark_no_show(
  _assignment_id uuid,
  _reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _job_id uuid;
  _driver_id uuid;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.job_assignments
     SET status                 = 'no_show',
         no_show_marked_by_admin= true,
         no_show_at             = COALESCE(no_show_at, now()),
         no_show_reason         = COALESCE(_reason, no_show_reason)
   WHERE id = _assignment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'assignment not found: %', _assignment_id;
  END IF;

  SELECT job_id, driver_id INTO _job_id, _driver_id
  FROM public.job_assignments WHERE id = _assignment_id;

  -- Fahrer-Statistik inkrementieren (falls vorhanden)
  UPDATE public.fahrer_profile
     SET no_show_count = no_show_count + 1
   WHERE id = _driver_id;

  -- (Optional) Job-Status für UI kennzeichnen
  UPDATE public.job_requests
     SET status = 'no_show'
   WHERE id = _job_id;

  -- Audit
  INSERT INTO public.admin_actions (action, job_id, assignment_id, admin_email, note)
  VALUES ('admin_no_show', _job_id, _assignment_id,
          (SELECT admin_email FROM public.admin_settings LIMIT 1), _reason);

  RETURN true;
END $function$;

GRANT EXECUTE ON FUNCTION public.admin_mark_no_show(uuid, text) TO authenticated;

-- 4) Eindeutigkeiten (falls noch nicht gesetzt)
CREATE UNIQUE INDEX IF NOT EXISTS ux_job_assignments_job_driver
ON public.job_assignments (job_id, driver_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_job_assignments_job_active
ON public.job_assignments (job_id)
WHERE status IN ('assigned','confirmed');