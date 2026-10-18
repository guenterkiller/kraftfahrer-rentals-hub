ALTER TABLE public.job_requests
  ADD COLUMN IF NOT EXISTS unterkunft_option text,
  ADD COLUMN IF NOT EXISTS unterkunft_obergrenze numeric,
  ADD COLUMN IF NOT EXISTS kosten_uebersicht jsonb;