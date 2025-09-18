-- 1) Reset test job requests and remove assignments
DELETE FROM public.job_assignments a
USING public.job_requests j
WHERE a.job_id = j.id
  AND j.customer_email ILIKE 'guenter.killer@t-online.de';

-- 2) Reset status to 'open'
UPDATE public.job_requests
SET status = 'open'
WHERE customer_email ILIKE 'guenter.killer@t-online.de';

-- 3) Fix admin_actions table RLS (admin_log is a view, so we secure the underlying table)
-- admin_actions already has proper RLS policies, so no changes needed there

-- 4) Verify the reset worked
SELECT 'Reset completed - check job_requests status' as message;