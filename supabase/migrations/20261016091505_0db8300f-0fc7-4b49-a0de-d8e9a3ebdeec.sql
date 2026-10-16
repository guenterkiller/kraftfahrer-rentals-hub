ALTER TABLE public.job_assignments ADD COLUMN times_entered boolean;
COMMENT ON COLUMN public.job_assignments.times_entered IS 'true = Einsatzbeginn/-ende mit tatsächlicher Uhrzeit (Europe/Berlin) erfasst; NULL = Altbestand, Uhrzeit nicht erfasst';

CREATE OR REPLACE FUNCTION public.admin_mark_no_show(_assignment_id uuid, _reason text DEFAULT NULL::text, _override_fee_eur numeric DEFAULT NULL::numeric)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _job_id uuid; _driver_id uuid;
DECLARE _fee_cents int; _tier text;
DECLARE _rate_type text; _rate_value numeric; _starts_at timestamptz; _times_entered boolean;
BEGIN
  IF NOT public.is_admin_user() THEN RAISE EXCEPTION 'forbidden'; END IF;

  SELECT ja.job_id, ja.driver_id, ja.rate_type, ja.rate_value, ja.start_date::timestamptz, ja.times_entered
    INTO _job_id, _driver_id, _rate_type, _rate_value, _starts_at, _times_entered
  FROM public.job_assignments ja WHERE ja.id=_assignment_id;

  IF _job_id IS NULL THEN RAISE EXCEPTION 'assignment not found: %', _assignment_id; END IF;

  IF _override_fee_eur IS NOT NULL THEN
    _fee_cents := round(_override_fee_eur * 100); _tier := 'override';
  ELSIF _times_entered IS NOT TRUE OR _starts_at IS NULL THEN
    RAISE EXCEPTION 'Einsatzbeginn ohne erfasste Uhrzeit – No-Show-Gebühr bitte manuell festlegen';
  ELSE
    SELECT fee_cents, tier INTO _fee_cents, _tier
    FROM public.calc_no_show_fee_cents(_rate_type, _rate_value, _starts_at);
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