CREATE OR REPLACE FUNCTION public.test_purge_active() RETURNS boolean
LANGUAGE sql STABLE SET search_path TO 'public','pg_temp' AS $$
  SELECT COALESCE(current_setting('app.test_purge', true), '') = 'on';
$$;

CREATE OR REPLACE FUNCTION public.set_is_test_flag() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
DECLARE _mail text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _mail := CASE WHEN TG_TABLE_NAME = 'fahrer_profile' THEN to_jsonb(NEW)->>'email' ELSE to_jsonb(NEW)->>'customer_email' END;
    NEW.is_test := COALESCE(public.is_test_email(_mail), false);
    RETURN NEW;
  END IF;
  IF NEW.is_test IS DISTINCT FROM OLD.is_test THEN
    IF NOT (COALESCE(current_setting('app.test_mark_once', true), '') = 'on' AND session_user = 'postgres') THEN
      RAISE EXCEPTION 'Testkennzeichen ist unveränderlich und kann nicht nachträglich gesetzt werden' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.set_is_test_flag() FROM PUBLIC, anon, authenticated;