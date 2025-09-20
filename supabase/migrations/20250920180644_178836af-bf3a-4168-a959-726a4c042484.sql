-- Update function to only mark truly old/inactive jobs as completed
CREATE OR REPLACE FUNCTION public.admin_mark_old_jobs_completed(_days_old INTEGER DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _cutoff_date DATE;
  _updated_count INTEGER;
  _job_ids uuid[];
BEGIN
  -- Admin check
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  -- Calculate cutoff date
  _cutoff_date := CURRENT_DATE - INTERVAL '1 day' * _days_old;

  -- Get jobs that should be marked as completed
  -- Only include 'open' status jobs (not assigned/confirmed which are still active)
  SELECT array_agg(id) INTO _job_ids
  FROM public.job_requests
  WHERE status = 'open'  -- Only open jobs, not active assignments
    AND created_at::date < _cutoff_date;

  -- Update jobs to completed status (preserving all customer data)
  UPDATE public.job_requests
  SET status = 'completed',
      completed_at = now(),
      updated_at = now()
      -- Keep all customer data unchanged: customer_name, customer_email, etc.
  WHERE id = ANY(_job_ids);

  GET DIAGNOSTICS _updated_count = ROW_COUNT;

  -- Log the admin action
  INSERT INTO public.admin_actions (action, admin_email, note)
  VALUES (
    'mark_old_open_jobs_completed',
    (SELECT admin_email FROM public.admin_settings LIMIT 1),
    'Marked ' || _updated_count || ' open jobs older than ' || _days_old || ' days as completed (active assignments preserved)'
  );

  RETURN jsonb_build_object(
    'success', true,
    'updated_count', _updated_count,
    'cutoff_date', _cutoff_date,
    'message', 'Successfully marked ' || _updated_count || ' old open jobs as completed (active assignments preserved)'
  );
END $function$;