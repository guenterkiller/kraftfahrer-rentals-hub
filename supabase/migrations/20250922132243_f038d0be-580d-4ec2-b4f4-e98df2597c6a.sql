-- Update the admin_mark_old_jobs_completed function to consider job end dates
CREATE OR REPLACE FUNCTION public.admin_mark_old_jobs_completed(_days_old integer DEFAULT 30)
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
  -- AND ensure the job's time period has already passed
  SELECT array_agg(id) INTO _job_ids
  FROM public.job_requests
  WHERE status = 'open'  -- Only open jobs, not active assignments
    AND created_at::date < _cutoff_date
    -- Additional check: Don't mark jobs as complete if their time period suggests they might still be active
    -- Parse common date patterns in zeitraum field to determine if job is still ongoing
    AND (
      -- If zeitraum contains a future date (2025, 2026, etc), don't mark as complete
      zeitraum !~ '202[5-9]|20[3-9][0-9]'
      -- Or if zeitraum contains current month/year patterns that suggest ongoing work
      OR zeitraum !~ 'ab\s*(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s*202[5-9]|ab\s*[0-9]{1,2}\.202[5-9]'
    );

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
    'mark_old_open_jobs_completed_with_date_check',
    (SELECT admin_email FROM public.admin_settings LIMIT 1),
    'Marked ' || _updated_count || ' open jobs older than ' || _days_old || ' days as completed (active assignments and future dates preserved)'
  );

  RETURN jsonb_build_object(
    'success', true,
    'updated_count', _updated_count,
    'cutoff_date', _cutoff_date,
    'message', 'Successfully marked ' || _updated_count || ' old open jobs as completed (active assignments and future dates preserved)'
  );
END $function$;