-- Add missing email_opt_out column to fahrer_profile
ALTER TABLE public.fahrer_profile
  ADD COLUMN IF NOT EXISTS email_opt_out boolean NOT NULL DEFAULT false;

-- Create job_mail_log table if not exists
CREATE TABLE IF NOT EXISTS public.job_mail_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_request_id uuid NOT NULL,
  fahrer_id uuid NOT NULL,
  email text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent','failed','opted_out')),
  error text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on job_mail_log
ALTER TABLE public.job_mail_log ENABLE ROW LEVEL SECURITY;

-- Create admin read policy for job_mail_log
CREATE POLICY "job_mail_log_admin_read" ON public.job_mail_log
FOR SELECT USING (is_admin_user());