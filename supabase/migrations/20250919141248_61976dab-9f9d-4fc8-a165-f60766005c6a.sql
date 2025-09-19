-- Create a policy that allows admin users to update job contact data
CREATE POLICY "Admins can update job contact data via frontend"
ON public.job_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_settings
    WHERE admin_email = current_setting('request.jwt.claims', true)::json->>'email'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_settings  
    WHERE admin_email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);