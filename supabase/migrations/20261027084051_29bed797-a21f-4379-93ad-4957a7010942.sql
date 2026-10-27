-- 1. Test-Adressliste
CREATE TABLE public.test_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX test_identities_email_uq ON public.test_identities (lower(trim(email)));
GRANT SELECT, INSERT, DELETE ON public.test_identities TO authenticated;
GRANT ALL ON public.test_identities TO service_role;
ALTER TABLE public.test_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read test identities" ON public.test_identities FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins add test identities" ON public.test_identities FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins remove test identities" ON public.test_identities FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.is_test_email(_email text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
  SELECT _email IS NOT NULL AND EXISTS (SELECT 1 FROM public.test_identities t WHERE lower(trim(t.email)) = lower(trim(_email)));
$$;
REVOKE EXECUTE ON FUNCTION public.is_test_email(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.test_identities_audit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.email := lower(trim(NEW.email));
    IF NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN RAISE EXCEPTION 'Ungültige E-Mail-Adresse'; END IF;
    NEW.created_by := COALESCE(NEW.created_by, (SELECT email FROM auth.users WHERE id = auth.uid()));
    INSERT INTO public.admin_actions(action, admin_email, note) VALUES ('test_identity_added', NEW.created_by, NEW.email);
    RETURN NEW;
  END IF;
  INSERT INTO public.admin_actions(action, admin_email, note) VALUES ('test_identity_removed', (SELECT email FROM auth.users WHERE id = auth.uid()), OLD.email);
  RETURN OLD;
END $$;
CREATE TRIGGER test_identities_audit_ins BEFORE INSERT ON public.test_identities FOR EACH ROW EXECUTE FUNCTION public.test_identities_audit();
CREATE TRIGGER test_identities_audit_del BEFORE DELETE ON public.test_identities FOR EACH ROW EXECUTE FUNCTION public.test_identities_audit();

-- 2. Testkennzeichen: nur bei Neuanlage, danach unveränderlich
ALTER TABLE public.fahrer_profile ADD COLUMN is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.job_requests ADD COLUMN is_test boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.set_is_test_flag() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.is_test := public.is_test_email(CASE WHEN TG_TABLE_NAME = 'fahrer_profile' THEN NEW.email ELSE NEW.customer_email END);
    RETURN NEW;
  END IF;
  IF NEW.is_test IS DISTINCT FROM OLD.is_test THEN
    IF NOT (current_setting('app.test_mark_once', true) = 'on' AND session_user = 'postgres') THEN
      RAISE EXCEPTION 'Testkennzeichen ist unveränderlich und kann nicht nachträglich gesetzt werden' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER fahrer_profile_is_test BEFORE INSERT OR UPDATE ON public.fahrer_profile FOR EACH ROW EXECUTE FUNCTION public.set_is_test_flag();
CREATE TRIGGER job_requests_is_test BEFORE INSERT OR UPDATE ON public.job_requests FOR EACH ROW EXECUTE FUNCTION public.set_is_test_flag();

-- 3. Eng begrenzte Ausnahmen in bestehenden Schutzregeln
CREATE OR REPLACE FUNCTION public.test_purge_active() RETURNS boolean
LANGUAGE sql STABLE SET search_path TO 'public','pg_temp' AS $$
  SELECT current_setting('app.test_purge', true) = 'on';
$$;

CREATE OR REPLACE FUNCTION public.protect_contract_decisions()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $function$
BEGIN
 IF TG_OP = 'DELETE' AND public.test_purge_active()
    AND EXISTS (SELECT 1 FROM public.fahrer_profile f WHERE f.id = OLD.driver_id AND f.is_test AND public.is_test_email(f.email)) THEN
   RETURN OLD;
 END IF;
 RAISE EXCEPTION 'Vertragsentscheidungen sind unveränderlich';
END;
$function$;

CREATE OR REPLACE FUNCTION public.protect_binding_acceptances()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $function$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.flow = 'binding' THEN
      IF public.test_purge_active()
         AND EXISTS (SELECT 1 FROM public.fahrer_profile f WHERE f.id = OLD.driver_id AND f.is_test AND public.is_test_email(f.email)) THEN
        RETURN OLD;
      END IF;
      RAISE EXCEPTION 'binding acceptance is immutable';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.flow = 'binding' THEN
    IF NEW.pdf_path IS DISTINCT FROM OLD.pdf_path AND OLD.pdf_path IS NULL
       AND (to_jsonb(NEW) - 'pdf_path') = (to_jsonb(OLD) - 'pdf_path') THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'binding acceptance is immutable';
  END IF;
  IF NEW.flow = 'binding' AND OLD.flow IS DISTINCT FROM 'binding' THEN
    RAISE EXCEPTION 'cannot convert to binding acceptance';
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.guard_administrative_parent_delete()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp' AS $function$
BEGIN
 -- Testdaten-Ausnahme: nur innerhalb der Bereinigungsfunktion und nur für gekennzeichnete Datensätze
 IF public.test_purge_active() AND OLD.is_test
    AND public.is_test_email(CASE WHEN TG_TABLE_NAME='fahrer_profile' THEN OLD.email ELSE OLD.customer_email END) THEN
  RETURN OLD;
 END IF;
 IF NOT public.admin_delete_access_allowed() THEN
  RAISE EXCEPTION 'Löschen nur für berechtigte Administratoren oder den Supabase-SQL-Editor erlaubt' USING ERRCODE='42501';
 END IF;
 IF TG_TABLE_NAME='fahrer_profile' THEN
  IF EXISTS (SELECT 1 FROM public.driver_contract_decisions WHERE driver_id=OLD.id) THEN
   RAISE EXCEPTION 'Fahrer nicht gelöscht: geschützter Vertragsentscheidungsnachweis vorhanden';
  END IF;
  IF OLD.agb_accepted_at IS NOT NULL OR EXISTS (SELECT 1 FROM public.driver_contract_invites WHERE driver_id=OLD.id AND (status='used' OR used_at IS NOT NULL)) THEN
   RAISE EXCEPTION 'Fahrer nicht gelöscht: bestehender Zustimmungs- oder verwendeter Vertragsnachweis; Aufbewahrung ungeklärt';
  END IF;
  IF EXISTS (SELECT 1 FROM public.job_assignments WHERE driver_id=OLD.id)
     OR EXISTS (SELECT 1 FROM public.job_driver_acceptances WHERE driver_id=OLD.id)
     OR EXISTS (SELECT 1 FROM public.assignment_invites WHERE driver_id=OLD.id) THEN
   RAISE EXCEPTION 'Fahrer nicht gelöscht: Auftragsverknüpfungen oder Geschäftsnachweise vorhanden; Aufbewahrung ungeklärt';
  END IF;
  IF EXISTS (SELECT 1 FROM public.fahrer_dokumente WHERE fahrer_id=OLD.id)
     OR COALESCE(OLD.dokumente,'{}'::jsonb) NOT IN ('{}'::jsonb,'[]'::jsonb,'null'::jsonb)
     OR EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id='fahrer-dokumente' AND name LIKE OLD.id::text || '/%') THEN
   RAISE EXCEPTION 'Fahrer nicht gelöscht: Unterlagen vorhanden; Dateilöschung benötigt gesonderte Prüfung und ist nicht SQL-atomar';
  END IF;
  DELETE FROM public.driver_contract_invites WHERE driver_id=OLD.id;
 ELSIF TG_TABLE_NAME='job_requests' THEN
  IF EXISTS (SELECT 1 FROM public.job_assignments WHERE job_id=OLD.id)
     OR EXISTS (SELECT 1 FROM public.job_driver_acceptances WHERE job_id=OLD.id)
     OR OLD.customer_invoice_id IS NOT NULL OR OLD.subcontractor_invoice_id IS NOT NULL
     OR COALESCE(OLD.customer_invoice_status::text,'draft') <> 'draft'
     OR COALESCE(OLD.subcontractor_invoice_status::text,'draft') <> 'draft'
     OR COALESCE(OLD.payout_status,'pending') <> 'pending'
     OR OLD.approved_at IS NOT NULL OR OLD.sent_at IS NOT NULL OR OLD.completed_at IS NOT NULL
     OR OLD.status NOT IN ('pending','open','rejected','cancelled') THEN
   RAISE EXCEPTION 'Auftrag nicht gelöscht: Zuteilung, Freigabe, Annahme oder Abrechnungsnachweis vorhanden; Aufbewahrung ungeklärt';
  END IF;
  IF EXISTS (SELECT 1 FROM public.assignment_invites WHERE job_id=OLD.id AND (purpose='binding' OR responded_at IS NOT NULL OR status <> 'pending')) THEN
   RAISE EXCEPTION 'Auftrag nicht gelöscht: verbindliche oder beantwortete Einladung vorhanden';
  END IF;
  IF EXISTS (SELECT 1 FROM public.email_log WHERE job_id=OLD.id AND (status='sent' OR sent_at IS NOT NULL)) THEN
   RAISE EXCEPTION 'Auftrag nicht gelöscht: versandte Geschäftskorrespondenz vorhanden; Aufbewahrung ungeklärt';
  END IF;
  IF EXISTS (SELECT 1 FROM public.job_attachments WHERE job_id=OLD.id)
     OR EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id IN ('job-attachments','confirmations') AND name LIKE OLD.id::text || '/%') THEN
   RAISE EXCEPTION 'Auftrag nicht gelöscht: Dateien vorhanden; Dateilöschung benötigt gesonderte Prüfung und ist nicht SQL-atomar';
  END IF;
 ELSE
  RAISE EXCEPTION 'Unzulässige Löschtabelle';
 END IF;
 RETURN OLD;
END;
$function$;

-- 4. Prüfung (ohne Löschung)
CREATE OR REPLACE FUNCTION public.admin_test_purge_preview(_kind text, _id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
DECLARE d public.fahrer_profile; j public.job_requests; _blocked text; _real int; _files jsonb;
BEGIN
  IF NOT (auth.role() = 'service_role' OR public.is_admin(auth.uid())) THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='42501'; END IF;
  IF _kind = 'driver' THEN
    SELECT * INTO d FROM public.fahrer_profile WHERE id = _id;
    IF NOT FOUND THEN RETURN jsonb_build_object('found', false); END IF;
    IF NOT d.is_test THEN _blocked := 'Kein gekennzeichneter Testdatensatz';
    ELSIF NOT public.is_test_email(d.email) THEN _blocked := 'E-Mail-Adresse steht nicht in der Test-Adressliste';
    ELSIF EXISTS (SELECT 1 FROM public.job_assignments a JOIN public.job_requests r ON r.id=a.job_id WHERE a.driver_id=_id AND NOT r.is_test)
       OR EXISTS (SELECT 1 FROM public.job_driver_acceptances x JOIN public.job_requests r ON r.id=x.job_id WHERE x.driver_id=_id AND NOT r.is_test) THEN
      _blocked := 'Zuteilung oder Annahme zu einem echten Kundenauftrag vorhanden – Löschung nicht zulässig';
    END IF;
    SELECT COALESCE(jsonb_agg(jsonb_build_object('bucket', bucket_id, 'path', name)), '[]'::jsonb) INTO _files
      FROM storage.objects WHERE bucket_id='fahrer-dokumente' AND name LIKE _id::text || '/%';
    RETURN jsonb_build_object('found', true, 'kind','driver', 'email', d.email, 'name', d.vorname||' '||d.nachname,
      'blocked', _blocked, 'files', _files,
      'counts', jsonb_build_object(
        'vertragsentscheidungen', (SELECT count(*) FROM public.driver_contract_decisions WHERE driver_id=_id),
        'vertragslinks', (SELECT count(*) FROM public.driver_contract_invites WHERE driver_id=_id),
        'angebote', (SELECT count(*) FROM public.assignment_invites WHERE driver_id=_id),
        'zuteilungen', (SELECT count(*) FROM public.job_assignments WHERE driver_id=_id),
        'annahmen', (SELECT count(*) FROM public.job_driver_acceptances WHERE driver_id=_id),
        'unterlagen', (SELECT count(*) FROM public.fahrer_dokumente WHERE fahrer_id=_id)));
  ELSIF _kind = 'job' THEN
    SELECT * INTO j FROM public.job_requests WHERE id = _id;
    IF NOT FOUND THEN RETURN jsonb_build_object('found', false); END IF;
    SELECT count(DISTINCT f.id) INTO _real FROM public.fahrer_profile f WHERE NOT f.is_test AND (
      f.id IN (SELECT driver_id FROM public.assignment_invites WHERE job_id=_id)
      OR f.id IN (SELECT driver_id FROM public.job_assignments WHERE job_id=_id)
      OR f.id IN (SELECT driver_id FROM public.job_driver_acceptances WHERE job_id=_id)
      OR lower(f.email) IN (SELECT lower(recipient) FROM public.email_log WHERE job_id=_id));
    IF NOT j.is_test THEN _blocked := 'Kein gekennzeichneter Testdatensatz';
    ELSIF NOT public.is_test_email(j.customer_email) THEN _blocked := 'E-Mail-Adresse steht nicht in der Test-Adressliste';
    ELSIF _real > 0 THEN _blocked := 'Auftrag betrifft ' || _real || ' echte Fahrer – nur Archivierung möglich';
    END IF;
    SELECT COALESCE(jsonb_agg(jsonb_build_object('bucket', bucket_id, 'path', name)), '[]'::jsonb) INTO _files
      FROM storage.objects WHERE (bucket_id IN ('job-attachments','confirmations') AND name LIKE _id::text || '/%')
         OR (bucket_id='job-attachments' AND name IN (SELECT filepath FROM public.job_attachments WHERE job_id=_id))
         OR (bucket_id='confirmations' AND name IN (SELECT pdf_path FROM public.job_driver_acceptances WHERE job_id=_id AND pdf_path IS NOT NULL));
    RETURN jsonb_build_object('found', true, 'kind','job', 'email', j.customer_email, 'name', COALESCE(j.company, j.customer_name),
      'status', j.status, 'blocked', _blocked, 'real_drivers', _real, 'files', _files,
      'archivable', (j.is_test AND public.is_test_email(j.customer_email) AND j.status <> 'cancelled'
         AND NOT EXISTS (SELECT 1 FROM public.job_assignments a JOIN public.fahrer_profile f ON f.id=a.driver_id WHERE a.job_id=_id AND NOT f.is_test)
         AND NOT EXISTS (SELECT 1 FROM public.job_driver_acceptances x JOIN public.fahrer_profile f ON f.id=x.driver_id WHERE x.job_id=_id AND NOT f.is_test)),
      'counts', jsonb_build_object(
        'angebote', (SELECT count(*) FROM public.assignment_invites WHERE job_id=_id),
        'zuteilungen', (SELECT count(*) FROM public.job_assignments WHERE job_id=_id),
        'annahmen', (SELECT count(*) FROM public.job_driver_acceptances WHERE job_id=_id),
        'anhaenge', (SELECT count(*) FROM public.job_attachments WHERE job_id=_id)));
  END IF;
  RAISE EXCEPTION 'Unbekannte Art';
END $$;

-- 5. Endgültige Löschung (atomar)
CREATE OR REPLACE FUNCTION public.admin_test_purge(_kind text, _id uuid, _confirm_email text, _confirm_text text, _admin_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
DECLARE p jsonb; _asg uuid[]; _files int;
BEGIN
  IF NOT (auth.role() = 'service_role' OR public.is_admin(auth.uid())) THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='42501'; END IF;
  IF _confirm_text IS DISTINCT FROM 'TESTDATEN LÖSCHEN' THEN RAISE EXCEPTION 'Sicherheitsbestätigung fehlt oder ist falsch'; END IF;
  p := public.admin_test_purge_preview(_kind, _id);
  IF NOT (p->>'found')::boolean THEN RAISE EXCEPTION 'Datensatz nicht gefunden'; END IF;
  IF p->>'blocked' IS NOT NULL THEN RAISE EXCEPTION 'Löschung abgelehnt: %', p->>'blocked'; END IF;
  IF _confirm_email IS NULL OR lower(trim(_confirm_email)) <> lower(trim(p->>'email')) THEN RAISE EXCEPTION 'Bestätigungs-E-Mail stimmt nicht überein'; END IF;
  _files := jsonb_array_length(p->'files');
  IF _files > 0 THEN RAISE EXCEPTION 'Es sind noch % gespeicherte Dateien vorhanden – zuerst Dateien entfernen', _files; END IF;

  PERFORM set_config('app.test_purge', 'on', true);
  IF _kind = 'driver' THEN
    SELECT COALESCE(array_agg(id), '{}') INTO _asg FROM public.job_assignments WHERE driver_id=_id;
    DELETE FROM public.job_driver_acceptances WHERE driver_id=_id OR assignment_id = ANY(_asg);
    DELETE FROM public.assignment_invites WHERE driver_id=_id OR assignment_id = ANY(_asg);
    DELETE FROM public.email_log WHERE assignment_id = ANY(_asg);
    UPDATE public.admin_actions SET assignment_id = NULL WHERE assignment_id = ANY(_asg);
    DELETE FROM public.job_assignments WHERE id = ANY(_asg);
    DELETE FROM public.driver_contract_decisions WHERE driver_id=_id;
    DELETE FROM public.driver_contract_invites WHERE driver_id=_id;
    DELETE FROM public.fahrer_dokumente WHERE fahrer_id=_id;
    DELETE FROM public.email_log WHERE lower(recipient) = lower(p->>'email') AND job_id IS NULL AND assignment_id IS NULL;
    DELETE FROM public.fahrer_profile WHERE id=_id;
  ELSE
    SELECT COALESCE(array_agg(id), '{}') INTO _asg FROM public.job_assignments WHERE job_id=_id;
    DELETE FROM public.job_driver_acceptances WHERE job_id=_id;
    DELETE FROM public.assignment_invites WHERE job_id=_id;
    DELETE FROM public.email_log WHERE job_id=_id OR assignment_id = ANY(_asg);
    UPDATE public.admin_actions SET job_id = NULL, assignment_id = NULL WHERE job_id=_id OR assignment_id = ANY(_asg);
    DELETE FROM public.jobalarm_antworten WHERE job_id=_id;
    DELETE FROM public.job_assignments WHERE job_id=_id;
    DELETE FROM public.job_attachments WHERE job_id=_id;
    DELETE FROM public.job_requests WHERE id=_id;
  END IF;
  PERFORM set_config('app.test_purge', 'off', true);

  INSERT INTO public.admin_actions(action, admin_email, note)
  VALUES ('test_purge_' || _kind, _admin_email, 'Testdaten gelöscht: ' || (p->>'name') || ' <' || (p->>'email') || '> ID ' || _id || ' Umfang ' || (p->'counts')::text);
  RETURN jsonb_build_object('ok', true, 'counts', p->'counts');
END $$;

-- 6. Archivierung (still, ohne E-Mail)
CREATE OR REPLACE FUNCTION public.admin_test_archive_job(_id uuid, _confirm_email text, _admin_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
DECLARE p jsonb;
BEGIN
  IF NOT (auth.role() = 'service_role' OR public.is_admin(auth.uid())) THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='42501'; END IF;
  p := public.admin_test_purge_preview('job', _id);
  IF NOT (p->>'found')::boolean THEN RAISE EXCEPTION 'Auftrag nicht gefunden'; END IF;
  IF NOT (p->>'archivable')::boolean THEN RAISE EXCEPTION 'Archivierung abgelehnt: kein Testauftrag, bereits archiviert oder Zuteilung/Annahme echter Fahrer vorhanden'; END IF;
  IF _confirm_email IS NULL OR lower(trim(_confirm_email)) <> lower(trim(p->>'email')) THEN RAISE EXCEPTION 'Bestätigungs-E-Mail stimmt nicht überein'; END IF;
  UPDATE public.job_requests SET status='cancelled' WHERE id=_id;
  INSERT INTO public.admin_actions(action, job_id, admin_email, note)
  VALUES ('test_archive_job', _id, _admin_email, 'Testauftrag still archiviert (keine E-Mails)');
  RETURN jsonb_build_object('ok', true);
END $$;

REVOKE EXECUTE ON FUNCTION public.admin_test_purge_preview(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_test_purge(text, uuid, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_test_archive_job(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_test_purge_preview(text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_test_purge(text, uuid, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_test_archive_job(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.is_test_email(text) TO service_role;

-- 7. Erste Test-Adresse und einmalige Kennzeichnung (ohne Löschung)
INSERT INTO public.test_identities(email, created_by) VALUES ('guenter.killer@t-online.de', 'Ersteinrichtung');
DO $$
BEGIN
  PERFORM set_config('app.test_mark_once', 'on', true);
  UPDATE public.fahrer_profile SET is_test = true
   WHERE id = '5d84956a-78f3-4349-ac61-15dc4d3d0a48' AND lower(email) = 'guenter.killer@t-online.de';
  IF NOT FOUND THEN RAISE EXCEPTION 'Testprofil nicht gefunden'; END IF;
  PERFORM set_config('app.test_mark_once', 'off', true);
END $$;