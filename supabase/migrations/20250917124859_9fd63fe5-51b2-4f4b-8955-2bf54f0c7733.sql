-- email_log erweitern für Versandmodus & PDF-Info
ALTER TABLE public.email_log
  ADD COLUMN IF NOT EXISTS delivery_mode text NOT NULL DEFAULT 'inline', -- 'inline' | 'both' | 'pdf-only'
  ADD COLUMN IF NOT EXISTS pdf_path text,
  ADD COLUMN IF NOT EXISTS pdf_url  text;

-- hilfreicher Index
CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON public.email_log(created_at DESC);