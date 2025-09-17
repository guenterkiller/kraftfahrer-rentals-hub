-- Reset Günter Killer's job request to open status for testing
UPDATE public.job_requests 
SET status = 'open' 
WHERE customer_email = 'guenter.killer@t-online.de';

-- Remove any existing assignments for this job
DELETE FROM public.job_assignments 
WHERE job_id IN (
  SELECT id FROM public.job_requests 
  WHERE customer_email = 'guenter.killer@t-online.de'
);