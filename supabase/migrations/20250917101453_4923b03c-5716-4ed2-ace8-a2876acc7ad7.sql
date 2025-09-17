-- SECURITY FIX: Backup-Tabellen RLS aktivieren
-- Errors 5-7: RLS Disabled in Public für _backup_ Tabellen

ALTER TABLE public._backup_admin_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._backup_mail_log ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public._backup_job_mail_log ENABLE ROW LEVEL SECURITY;

-- Admin-only Policies für Backup-Tabellen
CREATE POLICY "backup_admin_log_admin_only" ON public._backup_admin_log
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "backup_mail_log_admin_only" ON public._backup_mail_log  
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());

CREATE POLICY "backup_job_mail_log_admin_only" ON public._backup_job_mail_log
  FOR ALL USING (is_admin_user()) WITH CHECK (is_admin_user());