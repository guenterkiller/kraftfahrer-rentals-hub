ALTER TABLE public.job_requests
 ADD COLUMN customer_confirmation_given boolean,
 ADD COLUMN customer_confirmation_at timestamptz,
 ADD COLUMN customer_terms_version text,
 ADD COLUMN customer_confirmation_text text,
 ADD COLUMN customer_terms_text text;

CREATE FUNCTION public.guard_customer_confirmation()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF ROW(NEW.customer_confirmation_given,NEW.customer_confirmation_at,NEW.customer_terms_version,NEW.customer_confirmation_text,NEW.customer_terms_text)
     IS DISTINCT FROM ROW(OLD.customer_confirmation_given,OLD.customer_confirmation_at,OLD.customer_terms_version,OLD.customer_confirmation_text,OLD.customer_terms_text) THEN
   RAISE EXCEPTION 'Kundenbestätigungsnachweis ist unveränderlich; kein Nachtragen erlaubt' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
 END IF;
 IF NEW.customer_confirmation_given IS NULL AND NEW.customer_confirmation_at IS NULL AND NEW.customer_terms_version IS NULL AND NEW.customer_confirmation_text IS NULL AND NEW.customer_terms_text IS NULL THEN RETURN NEW; END IF;
 IF NEW.customer_confirmation_given IS DISTINCT FROM true OR nullif(trim(NEW.customer_terms_version),'') IS NULL OR nullif(trim(NEW.customer_confirmation_text),'') IS NULL OR nullif(trim(NEW.customer_terms_text),'') IS NULL THEN
  RAISE EXCEPTION 'Kundenbestätigungsnachweis muss vollständig sein' USING ERRCODE='23514';
 END IF;
 IF coalesce(auth.role(),'') <> 'service_role' AND current_user <> 'postgres' THEN
  RAISE EXCEPTION 'Kundenbestätigungsnachweis nur über serverseitige Verarbeitung' USING ERRCODE='42501';
 END IF;
 NEW.customer_confirmation_at := clock_timestamp();
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_customer_confirmation() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_customer_confirmation BEFORE INSERT OR UPDATE ON public.job_requests FOR EACH ROW EXECUTE FUNCTION public.guard_customer_confirmation();

DO $$
DECLARE test_id uuid; legacy_id uuid; stored public.job_requests; rejected boolean;
BEGIN
 BEGIN
  INSERT INTO public.job_requests(customer_name,customer_email,customer_phone,einsatzort,zeitraum,fahrzeugtyp,nachricht,status,customer_confirmation_given,customer_confirmation_at,customer_terms_version,customer_confirmation_text,customer_terms_text)
  VALUES('ISOLIERTER TEST','confirmation-test@example.invalid','TEST','TEST','TEST','TEST','TEST','open',true,'2000-01-01','TEST-v1','TEST Bestätigung','TEST Bedingungen') RETURNING id INTO test_id;
  SELECT * INTO stored FROM public.job_requests WHERE id=test_id;
  IF stored.customer_confirmation_given IS DISTINCT FROM true OR stored.customer_confirmation_at < now()-interval '1 minute' OR stored.customer_terms_version <> 'TEST-v1' THEN RAISE EXCEPTION 'Nachweis/Serverzeit nicht korrekt'; END IF;
  rejected:=false;
  BEGIN UPDATE public.job_requests SET customer_terms_text='manipuliert' WHERE id=test_id; EXCEPTION WHEN check_violation THEN rejected:=true; END;
  IF NOT rejected THEN RAISE EXCEPTION 'Änderungsschutz fehlt'; END IF;
  UPDATE public.job_requests SET nachricht='TEST bearbeitet' WHERE id=test_id;
  INSERT INTO public.job_requests(customer_name,customer_email,customer_phone,einsatzort,zeitraum,fahrzeugtyp,nachricht,status)
  VALUES('ISOLIERTER ALTTEST','legacy-test@example.invalid','TEST','TEST','TEST','TEST','TEST','open') RETURNING id INTO legacy_id;
  rejected:=false;
  BEGIN UPDATE public.job_requests SET customer_confirmation_given=true,customer_terms_version='TEST-v1',customer_confirmation_text='TEST',customer_terms_text='TEST' WHERE id=legacy_id; EXCEPTION WHEN check_violation THEN rejected:=true; END;
  IF NOT rejected THEN RAISE EXCEPTION 'Nachträglicher Nachweis möglich'; END IF;
  rejected:=false;
  BEGIN INSERT INTO public.job_requests(customer_name,customer_email,customer_phone,einsatzort,zeitraum,fahrzeugtyp,nachricht,customer_confirmation_given) VALUES('TEST','invalid@example.invalid','TEST','TEST','TEST','TEST','TEST',true); EXCEPTION WHEN check_violation THEN rejected:=true; END;
  IF NOT rejected THEN RAISE EXCEPTION 'Unvollständiger Nachweis möglich'; END IF;
  RAISE EXCEPTION USING ERRCODE='ZX001',MESSAGE='Isolierte Tests erfolgreich; Prüfdaten zurückrollen';
 EXCEPTION WHEN SQLSTATE 'ZX001' THEN RAISE NOTICE 'Nachweisspeicherung, Serverzeit, Änderungsschutz, Altanfragen und normale Bearbeitung geprüft; sämtliche Prüfdaten zurückgerollt';
 END;
 IF EXISTS(SELECT 1 FROM public.job_requests WHERE id IN(test_id,legacy_id)) THEN RAISE EXCEPTION 'Prüfdaten nicht zurückgerollt'; END IF;
END $$;