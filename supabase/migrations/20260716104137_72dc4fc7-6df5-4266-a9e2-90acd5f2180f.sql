-- 1) Partial-Unique-Indizes entfernen (blockierten mehr als eine aktive Zuweisung pro Auftrag)
DROP INDEX IF EXISTS public.ux_job_assignments_job_active;
DROP INDEX IF EXISTS public.uniq_job_active_assignment;

-- UNIQUE(job_id, driver_id) bleibt unangetastet (verhindert Doppel-Zuweisung desselben Fahrers)

-- 2) RPC admin_assign_driver: Guard nur noch pro (job, driver), nicht mehr pro job insgesamt
CREATE OR REPLACE FUNCTION public.admin_assign_driver(
  _job_id uuid,
  _driver_id uuid,
  _rate_type text DEFAULT 'hourly'::text,
  _rate_value numeric DEFAULT NULL::numeric,
  _start_date date DEFAULT NULL::date,
  _end_date date DEFAULT NULL::date,
  _note text DEFAULT NULL::text
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _id uuid;
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF _job_id IS NULL THEN
    RAISE EXCEPTION 'param _job_id is null';
  END IF;
  IF _driver_id IS NULL THEN
    RAISE EXCEPTION 'param _driver_id is null';
  END IF;

  PERFORM 1 FROM public.job_requests WHERE id = _job_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'job not found: %', _job_id;
  END IF;

  PERFORM 1 FROM public.fahrer_profile WHERE id = _driver_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'driver not found: %', _driver_id;
  END IF;

  -- Nur denselben Fahrer am selben Auftrag blockieren; andere Fahrer sind erlaubt
  IF EXISTS (
    SELECT 1 FROM public.job_assignments
    WHERE job_id = _job_id
      AND driver_id = _driver_id
      AND status IN ('assigned','confirmed')
  ) THEN
    RAISE EXCEPTION 'driver already assigned to this job';
  END IF;

  INSERT INTO public.job_assignments
    (id, job_id, driver_id, status, assigned_at,
     rate_type, rate_value, start_date, end_date, admin_note)
  VALUES
    (gen_random_uuid(), _job_id, _driver_id, 'assigned', now(),
     _rate_type, _rate_value, _start_date, _end_date, _note)
  RETURNING id INTO _id;

  UPDATE public.job_requests
     SET status = 'assigned'
   WHERE id = _job_id
     AND status IS DISTINCT FROM 'confirmed';

  INSERT INTO public.admin_actions (action, job_id, assignment_id, admin_email, note)
  VALUES ('assign_driver', _job_id, _id, (SELECT admin_email FROM public.admin_settings LIMIT 1), _note);

  RETURN _id;
END
$function$;