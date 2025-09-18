-- Reset Günter Killer jobs to open status for fresh testing
-- First delete any existing assignments
DELETE FROM public.job_assignments a
USING public.job_requests j
WHERE a.job_id = j.id
  AND j.customer_email ILIKE 'guenter.killer@t-online.de';

-- Reset job status to open
UPDATE public.job_requests
SET status = 'open'
WHERE customer_email ILIKE 'guenter.killer@t-online.de';