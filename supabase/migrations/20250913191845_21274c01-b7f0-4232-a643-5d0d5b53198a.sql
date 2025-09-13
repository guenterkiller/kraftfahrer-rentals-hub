-- ============================================================
-- 1) SECURITY: festen search_path für log_driver_profile_access
--    (Signatur kann variieren – wir setzen sie dynamisch)
-- ============================================================
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT oid::regprocedure AS signature
    FROM pg_proc
    WHERE proname = 'log_driver_profile_access'
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %s SET search_path TO public, pg_temp',
      r.signature
    );
  END LOOP;
END $$;

-- ============================================================
-- 6) PERFORMANCE: Indizes für Fahrer-Suche & Mail-Logs
-- ============================================================
-- Fahrerstatus & Opt-out
CREATE INDEX IF NOT EXISTS idx_fahrer_profile_status
  ON public.fahrer_profile (status);

CREATE INDEX IF NOT EXISTS idx_fahrer_profile_email_opt_out
  ON public.fahrer_profile (email_opt_out);

-- Mail-Logs (für schnelle Auswertungen)
CREATE INDEX IF NOT EXISTS idx_job_mail_log_job
  ON public.job_mail_log (job_request_id);

CREATE INDEX IF NOT EXISTS idx_job_mail_log_fahrer
  ON public.job_mail_log (fahrer_id);

CREATE INDEX IF NOT EXISTS idx_job_mail_log_created_at
  ON public.job_mail_log (created_at);

-- ============================================================
-- 8) DSGVO-LOGGING: Spalten erweitern + Helper-Funktion + Policy
-- ============================================================
-- Zusätzliche Felder im Log (Betreff, Vorlage, Snapshot, Reply-To, Meta)
ALTER TABLE public.job_mail_log
  ADD COLUMN IF NOT EXISTS subject        text,
  ADD COLUMN IF NOT EXISTS mail_template  text,
  ADD COLUMN IF NOT EXISTS driver_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS reply_to       text,
  ADD COLUMN IF NOT EXISTS meta           jsonb;

-- Helfer-Funktion zum Loggen (für Edge Functions nutzbar)
-- SECURITY DEFINER + fester search_path
CREATE OR REPLACE FUNCTION public.log_job_mail(
  p_job_request_id  uuid,
  p_fahrer_id       uuid,
  p_email           text,
  p_status          text,         -- 'sent' | 'failed' | 'opted_out'
  p_error           text DEFAULT NULL,
  p_subject         text DEFAULT NULL,
  p_mail_template   text DEFAULT NULL,
  p_reply_to        text DEFAULT NULL,
  p_driver_snapshot jsonb DEFAULT NULL,
  p_meta            jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO public.job_mail_log (
    job_request_id, fahrer_id, email, status, error,
    subject, mail_template, reply_to, driver_snapshot, meta
  )
  VALUES (
    p_job_request_id, p_fahrer_id, p_email, p_status, p_error,
    p_subject, p_mail_template, p_reply_to, p_driver_snapshot, p_meta
  );
$$;

-- Kommentare für Dokumentation
COMMENT ON FUNCTION public.log_job_mail(uuid, uuid, text, text, text, text, text, text, jsonb, jsonb)
  IS 'Wird von Edge Functions zum DSGVO-konformen Mail-Logging genutzt. SECURITY DEFINER; search_path fixiert.';