ALTER TABLE public.fahrer_profile
  ADD COLUMN IF NOT EXISTS agb_version text,
  ADD COLUMN IF NOT EXISTS agb_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS agb_ip inet,
  ADD COLUMN IF NOT EXISTS agb_user_agent text;