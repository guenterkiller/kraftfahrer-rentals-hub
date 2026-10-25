DO $$
DECLARE d uuid; j uuid; blocked boolean; before_snapshot jsonb; after_snapshot jsonb;
BEGIN
 SELECT jsonb_build_object('drivers',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.fahrer_profile f),'jobs',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.job_requests f),'assignments',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.job_assignments f),'acceptances',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.job_driver_acceptances f),'decisions',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.driver_contract_decisions f),'roles',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.user_roles f),'auth',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM auth.users f)) INTO before_snapshot;
 blocked:=false;
 BEGIN PERFORM public.admin_delete_driver('1df107ab-7039-402a-b3e9-af8a17223554','guenter.killer@t-online.de'); EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE '%geschützter Vertragsentscheidungsnachweis%' THEN RAISE; END IF; blocked:=true; END;
 IF NOT blocked THEN RAISE EXCEPTION 'TEST: Günters Nachweis muss geschützt sein'; END IF;
 BEGIN
  INSERT INTO public.fahrer_profile(vorname,nachname,email,telefon) VALUES('TEST','Tabelleneditor','editor-delete-regression@example.invalid','TEST') RETURNING id INTO d;
  INSERT INTO public.driver_contract_invites(driver_id,token,contract_version,expires_at,created_by) VALUES(d,gen_random_uuid()::text,'TEST',now()+interval '1 day','TEST');
  DELETE FROM public.fahrer_profile WHERE id=d;
  IF EXISTS(SELECT 1 FROM public.fahrer_profile WHERE id=d) OR EXISTS(SELECT 1 FROM public.driver_contract_invites WHERE driver_id=d) THEN RAISE EXCEPTION 'TEST: direkter Tabelleneditor-Pfad fehlgeschlagen'; END IF;
  INSERT INTO public.job_requests(customer_name,customer_email,customer_phone,einsatzort,zeitraum,fahrzeugtyp,nachricht) VALUES('TEST','editor-job-regression@example.invalid','TEST','TEST','TEST','TEST','TEST') RETURNING id INTO j;
  DELETE FROM public.job_requests WHERE id=j;
  IF EXISTS(SELECT 1 FROM public.job_requests WHERE id=j) THEN RAISE EXCEPTION 'TEST: direkte Auftragslöschung fehlgeschlagen'; END IF;
  RAISE EXCEPTION USING ERRCODE='ZX001', MESSAGE='Rollback TEST';
 EXCEPTION WHEN SQLSTATE 'ZX001' THEN NULL;
 END;
 SELECT jsonb_build_object('drivers',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.fahrer_profile f),'jobs',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.job_requests f),'assignments',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.job_assignments f),'acceptances',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.job_driver_acceptances f),'decisions',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.driver_contract_decisions f),'roles',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM public.user_roles f),'auth',(SELECT md5(COALESCE(string_agg(to_jsonb(f)::text,'' ORDER BY id),'')) FROM auth.users f)) INTO after_snapshot;
 IF before_snapshot IS DISTINCT FROM after_snapshot THEN RAISE EXCEPTION 'TEST: Bestandsdaten oder Administratorzugang verändert'; END IF;
END $$;
SET LOCAL ROLE anon;
DO $$ BEGIN
 IF public.admin_delete_access_allowed() THEN RAISE EXCEPTION 'TEST: anon darf nicht löschen'; END IF;
EXCEPTION WHEN insufficient_privilege THEN NULL;
END $$;
RESET ROLE;