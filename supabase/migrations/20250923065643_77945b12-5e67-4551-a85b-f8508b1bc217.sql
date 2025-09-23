-- Verbesserte Auto-Abschluss-Logik für alte Jobs
-- Die bestehende Funktion wird erweitert um bessere Zukunftserkennung

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
  -- ONLY mark jobs as completed if:
  -- 1. Status is 'open' (no active assignments)
  -- 2. Created more than _days_old days ago
  -- 3. No future dates in zeitraum field (improved detection)
  -- 4. No active assignments exist
  SELECT array_agg(id) INTO _job_ids
  FROM public.job_requests jr
  WHERE jr.status = 'open'  -- Only open jobs
    AND jr.created_at::date < _cutoff_date
    -- Enhanced future date detection: don't complete if zeitraum suggests future work
    AND NOT (
      -- Future years (2025, 2026, etc.)
      jr.zeitraum ~ '202[5-9]|20[3-9][0-9]'
      -- "ab" + future dates
      OR jr.zeitraum ~* 'ab\s+(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s*202[5-9]'
      OR jr.zeitraum ~* 'ab\s+[0-9]{1,2}\.202[5-9]'
      -- Current year but future months (November/Dezember 2024)
      OR jr.zeitraum ~* '(november|dezember)\s*2024'
      -- Keywords indicating ongoing projects
      OR jr.zeitraum ~* '(laufend|dauerhaft|permanent|fortlaufend)'
    )
    -- Ensure no active assignments exist
    AND NOT EXISTS (
      SELECT 1 FROM public.job_assignments ja 
      WHERE ja.job_id = jr.id 
      AND ja.status IN ('assigned', 'confirmed')
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
    'mark_old_open_jobs_completed_enhanced',
    (SELECT admin_email FROM public.admin_settings LIMIT 1),
    'Marked ' || _updated_count || ' open jobs older than ' || _days_old || ' days as completed (enhanced future detection, active assignments preserved)'
  );

  RETURN jsonb_build_object(
    'success', true,
    'updated_count', _updated_count,
    'cutoff_date', _cutoff_date,
    'message', 'Successfully marked ' || _updated_count || ' old open jobs as completed (enhanced future detection, active assignments preserved)'
  );
END $function$;