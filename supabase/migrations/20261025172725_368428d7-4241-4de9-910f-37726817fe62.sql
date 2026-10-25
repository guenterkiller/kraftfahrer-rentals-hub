DO $preflight$
DECLARE v_count integer;
BEGIN
 SELECT count(*) INTO v_count FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='submit_job_request';
 IF v_count <> 1 THEN RAISE EXCEPTION 'Unerwartete Anzahl alter Anfragefunktionen: %',v_count; END IF;
END $preflight$;
CREATE TEMP TABLE request_revoke_baseline ON COMMIT DROP AS SELECT count(*) AS request_count,md5(coalesce(string_agg(to_jsonb(j)::text,'' ORDER BY id),'')) AS fingerprint FROM public.job_requests j;
REVOKE EXECUTE ON FUNCTION public.submit_job_request(text,text,text,text,text,text,text,text,text,text) FROM PUBLIC,anon,authenticated,service_role;
DO $test$
DECLARE role_name text;
BEGIN
 FOREACH role_name IN ARRAY ARRAY['anon','authenticated','service_role'] LOOP
  IF has_function_privilege(role_name,'public.submit_job_request(text,text,text,text,text,text,text,text,text,text)','EXECUTE') THEN RAISE EXCEPTION 'Alter Schreibweg für % noch ausführbar',role_name; END IF;
 END LOOP;
 IF has_table_privilege('anon','public.job_requests','INSERT') THEN RAISE EXCEPTION 'Anonyme Tabellen-Einfügung noch möglich'; END IF;
 IF NOT has_table_privilege('service_role','public.job_requests','INSERT') THEN RAISE EXCEPTION 'Aktiver serverseitiger Anfrageweg hat keine Schreibberechtigung'; END IF;
END $test$;
SET LOCAL ROLE anon;
DO $anon_test$
BEGIN
 BEGIN
  PERFORM public.submit_job_request(NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text);
  RAISE EXCEPTION 'Alter RPC für anon nicht gesperrt';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $anon_test$;
RESET ROLE;
SET LOCAL ROLE authenticated;
DO $auth_test$
BEGIN
 BEGIN
  PERFORM public.submit_job_request(NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text);
  RAISE EXCEPTION 'Alter RPC für authenticated nicht gesperrt';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $auth_test$;
RESET ROLE;
SET LOCAL ROLE service_role;
DO $service_test$
BEGIN
 BEGIN
  PERFORM public.submit_job_request(NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text,NULL::text);
  RAISE EXCEPTION 'Alter RPC für service_role nicht gesperrt';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $service_test$;
RESET ROLE;
DO $unchanged$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM request_revoke_baseline b CROSS JOIN (SELECT count(*) AS request_count,md5(coalesce(string_agg(to_jsonb(j)::text,'' ORDER BY id),'')) AS fingerprint FROM public.job_requests j) current_state WHERE b.request_count=current_state.request_count AND b.fingerprint=current_state.fingerprint) THEN RAISE EXCEPTION 'Bestehende Anfragen wurden verändert'; END IF;
END $unchanged$;