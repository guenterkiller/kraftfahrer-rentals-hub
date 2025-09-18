-- Create unique index to prevent duplicate active assignments
CREATE UNIQUE INDEX IF NOT EXISTS uniq_job_active_assignment
ON public.job_assignments(job_id)
WHERE status IN ('assigned','confirmed');

-- Update the RPC to be more robust and return exactly one UUID
CREATE OR REPLACE FUNCTION public.admin_assign_driver(
  _job_id uuid,
  _driver_id uuid,
  _rate_type text DEFAULT 'hourly',
  _rate_value numeric DEFAULT NULL,
  _start_date date DEFAULT NULL,
  _end_date date DEFAULT NULL,
  _note text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _id uuid;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Check for existing active assignment
  IF EXISTS (
    SELECT 1 FROM public.job_assignments
    WHERE job_id = _job_id AND status IN ('assigned','confirmed')
  ) THEN
    RAISE EXCEPTION 'Job already has an active assignment. Please cancel existing assignment first.';
  END IF;

  -- Insert new assignment
  INSERT INTO public.job_assignments
    (id, job_id, driver_id, status, assigned_at,
     rate_type, rate_value, start_date, end_date, admin_note)
  VALUES
    (gen_random_uuid(), _job_id, _driver_id, 'assigned', now(),
     _rate_type, _rate_value, _start_date, _end_date, _note)
  RETURNING id INTO _id;

  -- Update job status
  UPDATE public.job_requests
     SET status = 'assigned'
   WHERE id = _job_id
     AND status IS DISTINCT FROM 'confirmed';

  -- Audit log
  INSERT INTO public.admin_actions (action, job_id, assignment_id, admin_email, note)
  VALUES ('assign_driver', _job_id, _id, (SELECT admin_email FROM public.admin_settings LIMIT 1), _note);

  RETURN _id;
END $$;