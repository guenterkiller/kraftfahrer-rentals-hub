-- Fix job-assignment status consistency
-- Step 1: Drop existing check constraint and add new one with 'completed'

-- 1. Drop existing status check constraint
ALTER TABLE public.job_assignments 
DROP CONSTRAINT IF EXISTS job_assignments_status_check;

-- 2. Add new check constraint with all valid status values
ALTER TABLE public.job_assignments
ADD CONSTRAINT job_assignments_status_check 
CHECK (status IN ('assigned', 'confirmed', 'cancelled', 'no_show', 'completed'));

-- 3. Update enforce_assignment_transitions function
CREATE OR REPLACE FUNCTION public.enforce_assignment_transitions()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Allow: assigned, confirmed, cancelled, no_show, completed
    IF NEW.status NOT IN ('assigned','confirmed','cancelled','no_show','completed') THEN
      RAISE EXCEPTION 'invalid status %', NEW.status;
    END IF;

    IF NEW.status = 'confirmed' AND OLD.status <> 'assigned' THEN
      RAISE EXCEPTION 'confirm allowed only from status=assigned';
    END IF;
    IF NEW.status = 'confirmed' AND NEW.confirmed_by_admin IS NOT TRUE THEN
      RAISE EXCEPTION 'confirmed_by_admin must be true';
    END IF;
    IF NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN
      NEW.confirmed_at := now();
    END IF;

    IF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
      NEW.cancelled_at := now();
    END IF;

    IF NEW.status = 'no_show' AND NEW.no_show_at IS NULL THEN
      NEW.no_show_at := now();
    END IF;
  END IF;
  RETURN NEW;
END $$
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public', 'pg_temp';

-- 4. Create function to auto-complete assignments when job is completed
CREATE OR REPLACE FUNCTION public.complete_job_assignments()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.job_assignments
    SET status = 'completed',
        updated_at = now()
    WHERE job_id = NEW.id
      AND status IN ('assigned', 'confirmed');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- 5. Create trigger to sync assignment status with job status
DROP TRIGGER IF EXISTS complete_assignments_on_job_complete ON public.job_requests;

CREATE TRIGGER complete_assignments_on_job_complete
  AFTER UPDATE OF status ON public.job_requests
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.complete_job_assignments();

-- 6. Fix existing inconsistent data
UPDATE public.job_assignments ja
SET status = 'completed',
    updated_at = now()
FROM public.job_requests jr
WHERE ja.job_id = jr.id
  AND jr.status = 'completed'
  AND ja.status IN ('assigned', 'confirmed');

-- 7. Log the action
INSERT INTO public.admin_actions (action, admin_email, note)
VALUES (
  'fix_job_assignment_status_sync',
  (SELECT admin_email FROM public.admin_settings LIMIT 1),
  'Added completed status support and automated assignment completion when job completes'
);