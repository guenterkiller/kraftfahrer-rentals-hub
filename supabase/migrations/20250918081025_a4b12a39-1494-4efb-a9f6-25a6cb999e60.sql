-- Fix remaining Security Definer Views by converting them to use SECURITY INVOKER explicitly
-- The issue is likely with views that call SECURITY DEFINER functions

-- Drop and recreate the remaining views with explicit SECURITY INVOKER
-- PostgreSQL 15+ supports SECURITY INVOKER option for views

-- First, let's recreate the admin_log view as SECURITY INVOKER
DROP VIEW IF EXISTS public.admin_log CASCADE;
CREATE VIEW public.admin_log WITH (security_invoker = true) AS
SELECT 
  id,
  created_at,
  created_at AS "timestamp",
  COALESCE(action, 'UNKNOWN_ACTION'::text) AS event,
  '127.0.0.1'::text AS ip_address,
  admin_email AS email
FROM public.admin_actions
WHERE is_admin_user(); -- Ensure proper access control

-- Recreate job_mail_log view as SECURITY INVOKER  
DROP VIEW IF EXISTS public.job_mail_log CASCADE;
CREATE VIEW public.job_mail_log WITH (security_invoker = true) AS
SELECT 
  id,
  created_at,
  job_id AS job_request_id,
  NULL::uuid AS fahrer_id,
  recipient AS email,
  status,
  CASE 
    WHEN (status = 'failed'::text) THEN error_message
    ELSE NULL::text
  END AS error,
  'job_confirmation'::text AS mail_template,
  subject,
  NULL::text AS reply_to,
  NULL::jsonb AS driver_snapshot,
  NULL::jsonb AS meta
FROM public.email_log
WHERE is_admin_user(); -- Ensure proper access control

-- Recreate mail_log view as SECURITY INVOKER
DROP VIEW IF EXISTS public.mail_log CASCADE; 
CREATE VIEW public.mail_log WITH (security_invoker = true) AS
SELECT 
  id,
  created_at,
  CASE 
    WHEN (status = 'sent'::text) THEN true
    ELSE false
  END AS success,
  recipient,
  template,
  CASE 
    WHEN (status = 'failed'::text) THEN error_message
    ELSE NULL::text
  END AS error_message
FROM public.email_log
WHERE is_admin_user(); -- Ensure proper access control

-- Add comments to document the security model
COMMENT ON VIEW public.admin_log IS 'Admin activity log view with SECURITY INVOKER - respects caller permissions';
COMMENT ON VIEW public.job_mail_log IS 'Job mail log view with SECURITY INVOKER - respects caller permissions';  
COMMENT ON VIEW public.mail_log IS 'Mail log view with SECURITY INVOKER - respects caller permissions';