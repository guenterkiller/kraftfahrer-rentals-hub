-- Add DELETE policy for job_requests: admin only
CREATE POLICY "job_requests_admin_delete"
ON public.job_requests
FOR DELETE
USING (public.is_admin_user(auth.uid()));