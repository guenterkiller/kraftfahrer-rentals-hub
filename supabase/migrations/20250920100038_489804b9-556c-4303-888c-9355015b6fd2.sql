-- Add 'completed' status to job_requests and create function to mark old jobs as completed
ALTER TABLE public.job_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create function to mark old jobs as completed
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
  SELECT array_agg(id) INTO _job_ids
  FROM public.job_requests
  WHERE status IN ('open', 'assigned', 'confirmed') 
    AND created_at::date < _cutoff_date;

  -- Update jobs to completed status
  UPDATE public.job_requests
  SET status = 'completed',
      completed_at = now(),
      updated_at = now()
  WHERE id = ANY(_job_ids);

  GET DIAGNOSTICS _updated_count = ROW_COUNT;

  -- Log the admin action
  INSERT INTO public.admin_actions (action, admin_email, note)
  VALUES (
    'mark_old_jobs_completed',
    (SELECT admin_email FROM public.admin_settings LIMIT 1),
    'Marked ' || _updated_count || ' jobs older than ' || _days_old || ' days as completed'
  );

  RETURN jsonb_build_object(
    'success', true,
    'updated_count', _updated_count,
    'cutoff_date', _cutoff_date,
    'message', 'Successfully marked ' || _updated_count || ' old jobs as completed'
  );
END $function$;