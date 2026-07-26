DROP POLICY IF EXISTS "job_requests_public_insert" ON public.job_requests;
REVOKE INSERT ON public.job_requests FROM anon;
REVOKE INSERT ON public.job_requests FROM authenticated;