-- 1) Reset test job requests and remove assignments
DELETE FROM public.job_assignments a
USING public.job_requests j
WHERE a.job_id = j.id
  AND j.customer_email ILIKE 'guenter.killer@t-online.de';

-- 2) Reset status to 'open'
UPDATE public.job_requests
SET status = 'open'
WHERE customer_email ILIKE 'guenter.killer@t-online.de';

-- 3) Fix admin_log RLS policies properly
ALTER TABLE public.admin_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read admin logs
CREATE POLICY admin_log_select_admins
ON public.admin_log
FOR SELECT
USING (public.is_admin_user());

-- Only admins can insert logs (Edge functions with service key bypass RLS anyway)
CREATE POLICY admin_log_insert_admins
ON public.admin_log
FOR INSERT
WITH CHECK (public.is_admin_user());

-- No UPDATE/DELETE policies to keep audit log immutable