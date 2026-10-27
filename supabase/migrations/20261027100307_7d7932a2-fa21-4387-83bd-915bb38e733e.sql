DO $$
DECLARE n int; blocked boolean := false;
BEGIN
  PERFORM set_config('app.test_mark_once','on',true);
  UPDATE public.job_requests SET is_test = true
   WHERE id = '15693ac0-e124-4a70-8d78-6eaea404bf27'
     AND is_test = false
     AND lower(customer_email) = 'guenter.killer@t-online.de';
  GET DIAGNOSTICS n = ROW_COUNT;
  PERFORM set_config('app.test_mark_once','off',true);
  IF n <> 1 THEN RAISE EXCEPTION 'Erwartet genau 1 Auftrag, gefunden %', n; END IF;
  BEGIN
    UPDATE public.job_requests SET is_test = false WHERE id = '15693ac0-e124-4a70-8d78-6eaea404bf27';
  EXCEPTION WHEN insufficient_privilege THEN blocked := true;
  END;
  IF NOT blocked THEN RAISE EXCEPTION 'Sperre gegen nachträgliche Kennzeichnung nicht wirksam'; END IF;
END $$;