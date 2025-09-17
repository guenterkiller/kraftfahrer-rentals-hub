-- Admin RPC: Auftraggeber-Daten sicher speichern
CREATE OR REPLACE FUNCTION public.admin_update_job_contact(
  _job_id uuid,
  _firma_oder_name text,
  _ansprechpartner text,
  _street text,
  _house text,
  _postal text,
  _city text,
  _phone text,
  _email text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.job_requests
     SET customer_name        = NULLIF(_firma_oder_name,''),
         company              = NULLIF(_firma_oder_name,''),
         customer_street      = NULLIF(_street,''),
         customer_house_number= NULLIF(_house,''),
         customer_postal_code = NULLIF(_postal,''),
         customer_city        = NULLIF(_city,''),
         customer_phone       = NULLIF(_phone,''),
         customer_email       = NULLIF(_email,''),
         updated_at           = now()
   WHERE id = _job_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'job not found: %', _job_id;
  END IF;

  INSERT INTO public.admin_actions (action, job_id, admin_email, note)
  VALUES ('admin_update_job_contact', _job_id, (SELECT admin_email FROM public.admin_settings LIMIT 1), 'Auftraggeberdaten ergänzt/aktualisiert');

  RETURN true;
END $$;

GRANT EXECUTE ON FUNCTION public.admin_update_job_contact(
  uuid, text, text, text, text, text, text, text, text
) TO authenticated;