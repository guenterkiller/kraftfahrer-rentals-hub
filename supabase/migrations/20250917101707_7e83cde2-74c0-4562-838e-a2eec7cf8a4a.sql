-- SECURITY FIX: Security Definer Views ohne SECURITY DEFINER neu anlegen
-- Errors 1-3: Security Definer View

-- Drop existierende Views mit SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_log CASCADE;
DROP VIEW IF EXISTS public.mail_log CASCADE; 
DROP VIEW IF EXISTS public.job_mail_log CASCADE;

-- Neue Views OHNE SECURITY DEFINER anlegen
CREATE VIEW public.admin_log AS
SELECT 
  id,
  created_at,
  created_at as timestamp,
  COALESCE(action, 'UNKNOWN_ACTION') as event,
  '127.0.0.1'::text as ip_address, -- Dummy IP für Kompatibilität
  admin_email as email
FROM public.admin_actions;

CREATE VIEW public.mail_log AS
SELECT 
  id,
  created_at,
  CASE 
    WHEN status = 'sent' THEN true
    ELSE false
  END as success,
  recipient,
  template,
  CASE 
    WHEN status = 'failed' THEN 'Email delivery failed'
    ELSE NULL
  END as error_message
FROM public.email_log;

CREATE VIEW public.job_mail_log AS
SELECT 
  id,
  created_at,
  job_id as job_request_id,
  NULL::uuid as fahrer_id, -- Nicht in email_log vorhanden
  recipient as email,
  status,
  CASE 
    WHEN status = 'failed' THEN 'Email delivery failed'
    ELSE NULL
  END as error,
  subject,
  template as mail_template,
  NULL::text as reply_to, -- Nicht in email_log vorhanden
  NULL::jsonb as driver_snapshot, -- Nicht in email_log vorhanden  
  NULL::jsonb as meta -- Nicht in email_log vorhanden
FROM public.email_log
WHERE job_id IS NOT NULL;