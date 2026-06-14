-- Admin-only preview wrapper around calc_no_show_fee_cents.
-- Pure read/calculation: no data writes, no mails, no audit entries.
CREATE OR REPLACE FUNCTION public.admin_preview_no_show_fee(
  _rate_type  text,
  _rate_value numeric,
  _starts_at  timestamptz
)
RETURNS TABLE(fee_cents int, tier text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  RETURN QUERY
  SELECT c.fee_cents, c.tier
  FROM public.calc_no_show_fee_cents(_rate_type, _rate_value, _starts_at) c;
END;
$$;

-- Lock down default grants, then expose only to authenticated.
REVOKE EXECUTE ON FUNCTION public.admin_preview_no_show_fee(text, numeric, timestamptz) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.admin_preview_no_show_fee(text, numeric, timestamptz) TO authenticated;