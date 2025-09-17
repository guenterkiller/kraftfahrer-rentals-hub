-- Phase 2: Database Deduplication - Konsolidierung & Absicherung (Korrigiert)
-- Fix: admin_actions.job_id NOT NULL constraint

-- ===========================
-- 1. BACKUP TABELLEN ERSTELLEN
-- ===========================

-- Backup für admin_log (wird zu View)
CREATE TABLE IF NOT EXISTS public._backup_admin_log AS 
SELECT * FROM public.admin_log WITH NO DATA;
INSERT INTO public._backup_admin_log 
SELECT * FROM public.admin_log
ON CONFLICT DO NOTHING;

-- Backup für mail_log (wird zu View)
CREATE TABLE IF NOT EXISTS public._backup_mail_log AS 
SELECT * FROM public.mail_log WITH NO DATA;
INSERT INTO public._backup_mail_log 
SELECT * FROM public.mail_log
ON CONFLICT DO NOTHING;

-- Backup für job_mail_log (wird zu View + Migration)
CREATE TABLE IF NOT EXISTS public._backup_job_mail_log AS 
SELECT * FROM public.job_mail_log WITH NO DATA;
INSERT INTO public._backup_job_mail_log 
SELECT * FROM public.job_mail_log
ON CONFLICT DO NOTHING;

-- ===========================
-- 2. SCHEMA-FIX: admin_actions.job_id NULLABLE MACHEN
-- ===========================

-- Temporär job_id nullable machen für System-Logs ohne Job-Kontext
ALTER TABLE public.admin_actions 
ALTER COLUMN job_id DROP NOT NULL;

-- ===========================
-- 3. DATENMIGRATION
-- ===========================

-- Migration: job_mail_log → email_log
-- Mapping: job_mail_log Struktur auf email_log Schema
INSERT INTO public.email_log (
  id, created_at, template, subject, recipient, 
  status, assignment_id, job_id, sent_at
)
SELECT 
  gen_random_uuid() as id,
  jml.created_at,
  COALESCE(jml.mail_template, 'job_broadcast') as template,
  COALESCE(jml.subject, 'Job Assignment') as subject,
  jml.email as recipient,
  CASE 
    WHEN jml.status = 'sent' THEN 'sent'
    WHEN jml.error IS NOT NULL THEN 'failed'
    ELSE 'pending'
  END as status,
  NULL as assignment_id, -- job_mail_log hat keine assignment_id
  jml.job_request_id as job_id,
  jml.created_at as sent_at
FROM public.job_mail_log jml
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_log el 
  WHERE el.job_id = jml.job_request_id 
  AND el.recipient = jml.email
  AND el.template = COALESCE(jml.mail_template, 'job_broadcast')
)
ON CONFLICT DO NOTHING;

-- Migration: mail_log → email_log  
-- Mapping: mail_log Struktur auf email_log Schema
INSERT INTO public.email_log (
  id, created_at, template, recipient, 
  status, sent_at
)
SELECT 
  gen_random_uuid() as id,
  ml.created_at,
  ml.template,
  ml.recipient,
  CASE 
    WHEN ml.success = true THEN 'sent'
    WHEN ml.error_message IS NOT NULL THEN 'failed'
    ELSE 'pending'
  END as status,
  ml.created_at as sent_at
FROM public.mail_log ml
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_log el 
  WHERE el.recipient = ml.recipient 
  AND el.template = ml.template
  AND el.created_at = ml.created_at
)
ON CONFLICT DO NOTHING;

-- ===========================
-- 4. LEGACY TABELLEN ZU VIEWS UMWANDELN
-- ===========================

-- Drop existierende Tabellen (Backup bereits erstellt)
DROP TABLE IF EXISTS public.admin_log CASCADE;
DROP TABLE IF EXISTS public.mail_log CASCADE;
DROP TABLE IF EXISTS public.job_mail_log CASCADE;

-- admin_log → View auf admin_actions (Kompatibilitäts-Mapping)
CREATE VIEW public.admin_log AS
SELECT 
  id,
  created_at,
  created_at as timestamp,
  COALESCE(action, 'UNKNOWN_ACTION') as event,
  '127.0.0.1'::text as ip_address, -- Dummy IP für Kompatibilität
  admin_email as email
FROM public.admin_actions;

-- mail_log → View auf email_log (Kompatibilitäts-Mapping) 
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

-- job_mail_log → View auf email_log (erweiterte Mapping)
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

-- ===========================
-- 5. RLS POLICIES FÜR VIEWS
-- ===========================

-- Views sind automatisch read-only, aber RLS explizit setzen
ALTER VIEW public.admin_log SET (security_barrier = true);
ALTER VIEW public.mail_log SET (security_barrier = true);
ALTER VIEW public.job_mail_log SET (security_barrier = true);

-- ===========================
-- 6. JOBALARM FEATURE-FLAG & RLS LOCKDOWN
-- ===========================

-- Feature Flag für Jobalarm System hinzufügen
INSERT INTO public.feature_flags (flag_name, enabled, description)
VALUES ('JOBALARM_ENABLED', false, 'Enable job alert subscription system')
ON CONFLICT (flag_name) DO UPDATE SET
  enabled = false,
  description = 'Enable job alert subscription system (Phase 2: disabled)';

-- Jobalarm Tabellen auf admin-only umstellen
DROP POLICY IF EXISTS "Public can subscribe to job alerts" ON public.jobalarm_fahrer;
DROP POLICY IF EXISTS "Public can submit driver responses" ON public.jobalarm_antworten;

-- Neue admin-only Policies
CREATE POLICY "admin_only_jobalarm_fahrer_select" ON public.jobalarm_fahrer
  FOR SELECT USING (is_admin_user());

CREATE POLICY "admin_only_jobalarm_fahrer_all" ON public.jobalarm_fahrer
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "admin_only_jobalarm_antworten_select" ON public.jobalarm_antworten
  FOR SELECT USING (is_admin_user());

CREATE POLICY "admin_only_jobalarm_antworten_all" ON public.jobalarm_antworten
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

-- ===========================
-- 7. AUDIT TRAIL
-- ===========================

-- Log der Migration in admin_actions (job_id jetzt nullable)
INSERT INTO public.admin_actions (
  job_id, action, admin_email, note, created_at
) VALUES (
  NULL, -- Jetzt erlaubt da job_id nullable
  'DB_DEDUPLICATION_PHASE2',
  (SELECT admin_email FROM public.admin_settings LIMIT 1),
  'Migrated job_mail_log+mail_log→email_log, created compatibility views, locked down jobalarm system',
  NOW()
);