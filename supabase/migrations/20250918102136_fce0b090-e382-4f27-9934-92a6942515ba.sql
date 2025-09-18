-- Create SECURITY DEFINER function to bypass RLS for admin job lookups
CREATE OR REPLACE FUNCTION public.admin_get_job(_job_id uuid)
RETURNS public.job_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r public.job_requests;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO r FROM public.job_requests WHERE id = _job_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'job not found: %', _job_id;
  END IF;

  RETURN r;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_get_job(uuid) TO authenticated;