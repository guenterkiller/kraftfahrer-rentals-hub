ALTER TABLE public.fahrer_profile
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS unsubscribed_reason text NULL;