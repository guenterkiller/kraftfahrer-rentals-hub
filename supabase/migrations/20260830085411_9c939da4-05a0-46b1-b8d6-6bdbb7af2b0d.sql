ALTER TABLE public.fahrer_profile
  ADD COLUMN IF NOT EXISTS strasse text,
  ADD COLUMN IF NOT EXISTS hausnummer text,
  ADD COLUMN IF NOT EXISTS land text;

COMMENT ON COLUMN public.fahrer_profile.strasse IS 'Straße des Fahrerstandorts (An-/Abfahrt)';
COMMENT ON COLUMN public.fahrer_profile.hausnummer IS 'Hausnummer des Fahrerstandorts';
COMMENT ON COLUMN public.fahrer_profile.land IS 'Land des Fahrerstandorts';
COMMENT ON COLUMN public.fahrer_profile.adresse IS 'Legacy-Freitextadresse (Altdaten); neue Registrierungen nutzen strasse/hausnummer';