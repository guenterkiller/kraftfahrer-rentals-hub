-- Add email opt-out capability for drivers
ALTER TABLE public.fahrer_profile
  ADD COLUMN IF NOT EXISTS email_opt_out boolean NOT NULL DEFAULT false;

-- Create mail log table for DSGVO compliance and debugging
CREATE TABLE IF NOT EXISTS public.job_mail_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL,
  fahrer_id uuid NOT NULL,
  email text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent','failed','opted_out')),
  error text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on job_mail_log
ALTER TABLE public.job_mail_log ENABLE ROW LEVEL SECURITY;

-- Update admin check function to work with current schema
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ) OR auth.uid() = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid;
$$;

-- Create policy for admin access to mail logs
CREATE POLICY job_mail_log_admin_read ON public.job_mail_log
FOR SELECT USING (is_admin_user());