-- Reset test account job requests to open status
UPDATE public.job_requests 
SET status = 'open', updated_at = now()
WHERE customer_email ILIKE 'guenter.killer@t-online.de';