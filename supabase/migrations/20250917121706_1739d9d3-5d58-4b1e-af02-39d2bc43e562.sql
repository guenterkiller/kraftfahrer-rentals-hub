-- 1) Felder für Beträge/Tier
ALTER TABLE public.job_assignments
  ADD COLUMN IF NOT EXISTS no_show_fee_cents     integer,
  ADD COLUMN IF NOT EXISTS no_show_fee_currency  text NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS no_show_tier          text,  -- '<6h', '6-24h', '24-48h'
  ADD COLUMN IF NOT EXISTS starts_at             timestamptz; -- falls noch nicht vorhanden, für Berechnung

-- 2) Hilfsfunktion: Betrag berechnen (aus rate_type/rate_value + starts_at vs now)
CREATE OR REPLACE FUNCTION public.calc_no_show_fee_cents(
  _rate_type text,
  _rate_value numeric,
  _starts_at timestamptz
) RETURNS TABLE (fee_cents int, tier text) LANGUAGE plpgsql AS $function$
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

-- 3) admin_mark_no_show um Betrag erweitern (optional override)
CREATE OR REPLACE FUNCTION public.admin_mark_no_show(
  _assignment_id uuid,
  _reason text DEFAULT NULL,
  _override_fee_eur numeric DEFAULT NULL
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $function$
DECLARE _job_id uuid; _driver_id uuid;
DECLARE _fee_cents int; _tier text;
DECLARE _rate_type text; _rate_value numeric; _starts_at timestamptz;
BEGIN
  IF NOT public.is_admin_user() THEN RAISE EXCEPTION 'forbidden'; END IF;

  SELECT ja.job_id, ja.driver_id, ja.rate_type, ja.rate_value, ja.start_date::timestamptz AS starts_at
    INTO _job_id, _driver_id, _rate_type, _rate_value, _starts_at
  FROM public.job_assignments ja WHERE ja.id=_assignment_id;

  IF _job_id IS NULL THEN RAISE EXCEPTION 'assignment not found: %', _assignment_id; END IF;

  IF _override_fee_eur IS NOT NULL THEN
    _fee_cents := round(_override_fee_eur * 100); _tier := 'override';
  ELSE
    SELECT fee_cents, tier INTO _fee_cents, _tier
    FROM public.calc_no_show_fee_cents(_rate_type, _rate_value, COALESCE(_starts_at, now()));
  END IF;

  UPDATE public.job_assignments
     SET status='no_show',
         no_show_marked_by_admin=true,
         no_show_at=COALESCE(no_show_at, now()),
         no_show_reason=COALESCE(_reason, no_show_reason),
         no_show_fee_cents=_fee_cents,
         no_show_fee_currency='EUR',
         no_show_tier=_tier
   WHERE id=_assignment_id;

  UPDATE public.fahrer_profile
     SET no_show_count = no_show_count + 1
   WHERE id = _driver_id;

  UPDATE public.job_requests SET status='no_show' WHERE id=_job_id;

  INSERT INTO public.admin_actions (action, job_id, assignment_id, admin_email, note)
  VALUES ('admin_no_show', _job_id, _assignment_id, (SELECT admin_email FROM public.admin_settings LIMIT 1), _reason);

  RETURN true;
END $function$;

GRANT EXECUTE ON FUNCTION public.calc_no_show_fee_cents(text, numeric, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_mark_no_show(uuid, text, numeric) TO authenticated;