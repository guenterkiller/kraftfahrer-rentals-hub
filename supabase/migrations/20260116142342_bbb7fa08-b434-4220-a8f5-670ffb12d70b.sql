-- Remove service_role policies (service_role bypasses RLS by default)
DROP POLICY IF EXISTS "Service role can insert email logs" ON public.email_log;
DROP POLICY IF EXISTS "Service role can update email logs" ON public.email_log;
DROP POLICY IF EXISTS "Service role can delete email logs" ON public.email_log;