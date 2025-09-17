-- Admin RPC function to reset job requests by email
CREATE OR REPLACE FUNCTION public.admin_reset_jobs_by_email(_email text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  _job_ids uuid[];
  _deleted_assignments int;
  _updated_jobs int;
BEGIN
  -- Check admin permissions
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Get all job IDs for this email
  SELECT array_agg(id) INTO _job_ids
  FROM public.job_requests
  WHERE customer_email = _email;

  -- Delete job assignments for these jobs
  DELETE FROM public.job_assignments
  WHERE job_id = ANY(_job_ids);
  
  GET DIAGNOSTICS _deleted_assignments = ROW_COUNT;

  -- Reset job requests to 'open' status
  UPDATE public.job_requests
  SET status = 'open', updated_at = now()
  WHERE customer_email = _email;
  
  GET DIAGNOSTICS _updated_jobs = ROW_COUNT;

  -- Log the admin action
  INSERT INTO public.admin_actions (action, admin_email, note)
  VALUES (
    'reset_jobs_by_email', 
    (SELECT admin_email FROM public.admin_settings LIMIT 1),
    'Reset ' || _updated_jobs || ' jobs and deleted ' || _deleted_assignments || ' assignments for email: ' || _email
  );

  RETURN jsonb_build_object(
    'success', true,
    'email', _email,
    'jobs_updated', _updated_jobs,
    'assignments_deleted', _deleted_assignments
  );
END $$;