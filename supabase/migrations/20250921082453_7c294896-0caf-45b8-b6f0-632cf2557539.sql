-- Behebe verbleibende Function Search Path Probleme

-- Aktualisiere debug_echo_ids Funktion mit sicherem search_path (war vergessen)
CREATE OR REPLACE FUNCTION public.debug_echo_ids(_job_id uuid, _driver_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN json_build_object(
    'job_id', _job_id, 
    'driver_id', _driver_id,
    'job_id_is_null', _job_id IS NULL,
    'driver_id_is_null', _driver_id IS NULL
  );
END $function$;

-- Aktualisiere calc_no_show_fee_cents Funktion mit sicherem search_path (war vergessen)  
CREATE OR REPLACE FUNCTION public.calc_no_show_fee_cents(_rate_type text, _rate_value numeric, _starts_at timestamp with time zone)
 RETURNS TABLE(fee_cents integer, tier text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE diff_hours numeric;
DECLARE base_cents int;
BEGIN
  diff_hours := EXTRACT(EPOCH FROM (_starts_at - now()))/3600.0;
  -- Basis: Tagessatz falls bekannt; sonst 4h Stundensatz; sonst Minimum 350€
  IF _rate_type = 'daily' AND _rate_value IS NOT NULL THEN
    base_cents := round(_rate_value * 100);
  ELSIF _rate_type = 'hourly' AND _rate_value IS NOT NULL THEN
    base_cents := round(_rate_value * 100 * 8); -- Tagesäquivalent 8h
  ELSE
    base_cents := 35000; -- Fallback 350€
  END IF;

  IF diff_hours < 6 THEN
    fee_cents := GREATEST(base_cents, 35000);  tier := '<6h';
  ELSIF diff_hours < 24 THEN
    fee_cents := GREATEST(round(base_cents * 0.60), 30000);  tier := '6-24h';
  ELSIF diff_hours < 48 THEN
    fee_cents := GREATEST(round(base_cents * 0.30), 25000);  tier := '24-48h';
  ELSE
    fee_cents := 0; tier := '>=48h';
  END IF;

  -- Deckel max. 900€ nur im <6h-Fall
  IF tier = '<6h' THEN
    fee_cents := LEAST(fee_cents, 90000);
  END IF;

  RETURN NEXT;
END $function$;

-- Behebe Job Alert Subscriptions - sichere RLS Policy hinzufügen
-- Erlaube kontrollierte öffentliche Eintragungen nur durch sichere Funktion
DROP POLICY IF EXISTS "Public can subscribe to job alerts" ON public.jobalarm_fahrer;

-- Erstelle sichere Funktion für Job-Alert-Anmeldungen
CREATE OR REPLACE FUNCTION public.subscribe_to_job_alerts(_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  _subscription_id uuid;
BEGIN
  -- Validierung der E-Mail
  IF _email IS NULL OR NOT (_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
    RAISE EXCEPTION 'Gültige E-Mail-Adresse ist erforderlich';
  END IF;

  -- Prüfe auf doppelte Anmeldungen
  IF EXISTS (SELECT 1 FROM public.jobalarm_fahrer WHERE email = LOWER(TRIM(_email))) THEN
    RAISE EXCEPTION 'Diese E-Mail-Adresse ist bereits für Job-Benachrichtigungen angemeldet';
  END IF;

  -- Sichere Einfügung
  INSERT INTO public.jobalarm_fahrer (email, created_at)
  VALUES (LOWER(TRIM(_email)), now())
  RETURNING id INTO _subscription_id;

  RETURN _subscription_id;
END $function$;

-- Erlaube öffentlichen Zugriff auf die sichere Funktion
GRANT EXECUTE ON FUNCTION public.subscribe_to_job_alerts TO anon;