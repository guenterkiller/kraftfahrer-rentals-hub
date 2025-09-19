-- SECURITY FIX: Add admin-only RLS policies for backup tables

-- 1. _backup_admin_log - Admin activity logs
CREATE POLICY "backup_admin_log_admin_only" 
ON public._backup_admin_log 
FOR ALL
TO authenticated 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- 2. _backup_job_mail_log - Email logs with driver data  
CREATE POLICY "backup_job_mail_log_admin_only"
ON public._backup_job_mail_log
FOR ALL  
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- 3. _backup_mail_log - General email logs
CREATE POLICY "backup_mail_log_admin_only"
ON public._backup_mail_log
FOR ALL
TO authenticated  
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Verify policies are active
SELECT tablename, policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename LIKE '_backup_%' 
ORDER BY tablename;