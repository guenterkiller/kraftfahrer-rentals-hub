-- Create debug echo function to test parameter passing
CREATE OR REPLACE FUNCTION public.debug_echo_ids(_job_id uuid, _driver_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN json_build_object(
    'job_id', _job_id, 
    'driver_id', _driver_id,
    'job_id_is_null', _job_id IS NULL,
    'driver_id_is_null', _driver_id IS NULL
  );
END $$;

-- Update admin_assign_driver with robust error handling and logging
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
  -- Admin check
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Parameter validation
  IF _job_id IS NULL THEN
    RAISE EXCEPTION 'param _job_id is null';
  END IF;
  IF _driver_id IS NULL THEN
    RAISE EXCEPTION 'param _driver_id is null';
  END IF;

  -- Check if job exists
  PERFORM 1 FROM public.job_requests WHERE id = _job_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'job not found: %', _job_id;
  END IF;

  -- Check if driver exists
  PERFORM 1 FROM public.fahrer_profile WHERE id = _driver_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'driver not found: %', _driver_id;
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