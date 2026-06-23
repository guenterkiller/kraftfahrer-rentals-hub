ALTER TABLE public.fahrer_profile
  ADD COLUMN IF NOT EXISTS is_inactive boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS inactive_since timestamptz NULL,
  ADD COLUMN IF NOT EXISTS inactive_reason text NULL,
  ADD COLUMN IF NOT EXISTS inactive_reason_code text NULL,
  ADD COLUMN IF NOT EXISTS inactive_notified_at timestamptz NULL;

COMMENT ON COLUMN public.fahrer_profile.is_inactive IS 'Vorübergehend deaktiviert – nicht für Auftragsangebote berücksichtigen. Keine Sperre.';
COMMENT ON COLUMN public.fahrer_profile.inactive_reason_code IS 'docs_missing | license_missing | trade_cert_missing | no_response | declines_jobs | other';