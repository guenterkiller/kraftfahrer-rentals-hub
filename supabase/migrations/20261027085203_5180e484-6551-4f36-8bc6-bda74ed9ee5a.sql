CREATE OR REPLACE FUNCTION public.set_is_test_flag() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
DECLARE _mail text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    _mail := CASE WHEN TG_TABLE_NAME = 'fahrer_profile' THEN to_jsonb(NEW)->>'email' ELSE to_jsonb(NEW)->>'customer_email' END;
    NEW.is_test := public.is_test_email(_mail);
    RETURN NEW;
  END IF;
  IF NEW.is_test IS DISTINCT FROM OLD.is_test THEN
    IF NOT (current_setting('app.test_mark_once', true) = 'on' AND session_user = 'postgres') THEN
      RAISE EXCEPTION 'Testkennzeichen ist unveränderlich und kann nicht nachträglich gesetzt werden' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.set_is_test_flag() FROM PUBLIC, anon, authenticated;

DO $$
DECLARE src text;
BEGIN
  SELECT pg_get_functiondef('public.guard_administrative_parent_delete()'::regprocedure) INTO src;
  src := replace(src,
    'IF public.test_purge_active() AND OLD.is_test
    AND public.is_test_email(CASE WHEN TG_TABLE_NAME=''fahrer_profile'' THEN OLD.email ELSE OLD.customer_email END) THEN',
    'IF public.test_purge_active() AND (to_jsonb(OLD)->>''is_test'')::boolean
    AND public.is_test_email(CASE WHEN TG_TABLE_NAME=''fahrer_profile'' THEN to_jsonb(OLD)->>''email'' ELSE to_jsonb(OLD)->>''customer_email'' END) THEN');
  IF position('to_jsonb(OLD)->>''is_test''' IN src) = 0 THEN RAISE EXCEPTION 'Ersetzung fehlgeschlagen'; END IF;
  EXECUTE src;
END $$;