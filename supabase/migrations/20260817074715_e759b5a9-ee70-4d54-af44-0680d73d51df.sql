ALTER TABLE public.job_requests
  ADD COLUMN IF NOT EXISTS tarif_mehrstunde_netto numeric,
  ADD COLUMN IF NOT EXISTS tarif_needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tarif_reason text,
  ADD COLUMN IF NOT EXISTS maschinenbedienung text,
  ADD COLUMN IF NOT EXISTS weekend_days text[],
  ADD COLUMN IF NOT EXISTS holiday_days text[];