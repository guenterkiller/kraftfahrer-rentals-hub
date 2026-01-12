-- =====================================================
-- DROP TRUCKER CHAT FEATURE TABLES + BACKUP TABLES
-- Diese Tabellen haben keine aktiven Code-Referenzen mehr
-- =====================================================

-- 1. Drop Trucker Chat related tables (feature completely removed)
DROP TABLE IF EXISTS public.trucker_chat_reports CASCADE;
DROP TABLE IF EXISTS public.trucker_chat_blocklist CASCADE;
DROP TABLE IF EXISTS public.trucker_chat_messages CASCADE;
DROP TABLE IF EXISTS public.trucker_locations CASCADE;

-- 2. Drop orphaned backup tables (no code references)
DROP TABLE IF EXISTS public._backup_admin_log CASCADE;
DROP TABLE IF EXISTS public._backup_mail_log CASCADE;
DROP TABLE IF EXISTS public._backup_job_mail_log CASCADE;

-- 3. Drop the trigger function for trucker chat (no longer needed)
DROP FUNCTION IF EXISTS public.update_trucker_chat_updated_at() CASCADE;