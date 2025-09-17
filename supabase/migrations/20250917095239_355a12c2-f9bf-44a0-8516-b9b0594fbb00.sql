-- Update admin_assign_driver to use UPSERT for idempotent assignments
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
     assigned_at = coalesce(public.job_assignments.assigned_at, now()),
     rate_type   = coalesce(EXCLUDED.rate_type,  public.job_assignments.rate_type),
     rate_value  = coalesce(EXCLUDED.rate_value, public.job_assignments.rate_value),
     start_date  = coalesce(EXCLUDED.start_date, public.job_assignments.start_date),
     end_date    = coalesce(EXCLUDED.end_date,   public.job_assignments.end_date),
     admin_note  = coalesce(EXCLUDED.admin_note, public.job_assignments.admin_note)
  RETURNING id INTO _id;

  RETURN _id;
END $$;