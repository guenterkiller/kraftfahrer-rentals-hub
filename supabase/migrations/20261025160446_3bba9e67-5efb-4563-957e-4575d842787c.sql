CREATE OR REPLACE FUNCTION public.admin_delete_access_allowed()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
 SELECT (session_user = 'postgres' AND current_setting('role', true) IN ('none','postgres'))
 OR (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='admin'));
$$;
REVOKE ALL ON FUNCTION public.admin_delete_access_allowed() FROM PUBLIC, anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.guard_administrative_parent_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
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
$$;
REVOKE ALL ON FUNCTION public.guard_administrative_parent_delete() FROM PUBLIC, anon, authenticated, service_role;
CREATE TRIGGER guard_driver_admin_delete BEFORE DELETE ON public.fahrer_profile FOR EACH ROW EXECUTE FUNCTION public.guard_administrative_parent_delete();
CREATE TRIGGER guard_job_admin_delete BEFORE DELETE ON public.job_requests FOR EACH ROW EXECUTE FUNCTION public.guard_administrative_parent_delete();

CREATE OR REPLACE FUNCTION public.admin_delete_driver(_driver_id uuid, _confirm_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE r public.fahrer_profile;
BEGIN
 IF NOT public.admin_delete_access_allowed() THEN RAISE EXCEPTION 'Keine Administratorberechtigung' USING ERRCODE='42501'; END IF;
 SELECT * INTO r FROM public.fahrer_profile WHERE id=_driver_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Fahrerprofil nicht gefunden'; END IF;
 IF _confirm_email IS NULL OR lower(trim(_confirm_email)) <> lower(trim(r.email)) THEN RAISE EXCEPTION 'Bestätigungs-E-Mail stimmt nicht überein'; END IF;
 DELETE FROM public.fahrer_profile WHERE id=r.id;
 RETURN jsonb_build_object('geloescht',true,'fahrer_id',r.id);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_delete_driver(uuid,text) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_driver(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_delete_job(_job_id uuid, _confirm_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE r public.job_requests;
BEGIN
 IF NOT public.admin_delete_access_allowed() THEN RAISE EXCEPTION 'Keine Administratorberechtigung' USING ERRCODE='42501'; END IF;
 SELECT * INTO r FROM public.job_requests WHERE id=_job_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Kundenanfrage nicht gefunden'; END IF;
 IF _confirm_email IS NULL OR lower(trim(_confirm_email)) <> lower(trim(r.customer_email)) THEN RAISE EXCEPTION 'Bestätigungs-E-Mail stimmt nicht überein'; END IF;
 DELETE FROM public.job_requests WHERE id=r.id;
 RETURN jsonb_build_object('geloescht',true,'auftrag_id',r.id);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_delete_job(uuid,text) FROM PUBLIC, anon, service_role;
GRANT EXECUTE ON FUNCTION public.admin_delete_job(uuid,text) TO authenticated;

DO $$
DECLARE d uuid; j uuid; result jsonb; blocked boolean;
BEGIN
 BEGIN
  INSERT INTO public.fahrer_profile(vorname,nachname,email,telefon) VALUES ('TEST','Loeschverwaltung','delete-atomic-regression@example.invalid','TEST') RETURNING id INTO d;
  INSERT INTO public.driver_contract_invites(driver_id,token,contract_version,expires_at,created_by) VALUES(d,gen_random_uuid()::text,'TEST',now()+interval '1 day','TEST');
  blocked:=false;
  BEGIN PERFORM public.admin_delete_driver(d,'wrong@example.invalid'); EXCEPTION WHEN raise_exception THEN blocked:=true; END;
  IF NOT blocked OR NOT EXISTS(SELECT 1 FROM public.fahrer_profile WHERE id=d) THEN RAISE EXCEPTION 'TEST: falsche Bestätigung muss unverändert abbrechen'; END IF;
  result:=public.admin_delete_driver(d,'delete-atomic-regression@example.invalid');
  IF result->>'geloescht'<>'true' OR EXISTS(SELECT 1 FROM public.fahrer_profile WHERE id=d) OR EXISTS(SELECT 1 FROM public.driver_contract_invites WHERE driver_id=d) THEN RAISE EXCEPTION 'TEST: Fahrer und Einladung müssen gelöscht sein'; END IF;
  INSERT INTO public.job_requests(customer_name,customer_email,customer_phone,einsatzort,zeitraum,fahrzeugtyp,nachricht) VALUES('TEST','delete-job-regression@example.invalid','TEST','TEST','TEST','TEST','TEST') RETURNING id INTO j;
  INSERT INTO public.admin_actions(action,job_id,note) VALUES('TEST',j,'TEST');
  result:=public.admin_delete_job(j,'delete-job-regression@example.invalid');
  IF result->>'geloescht'<>'true' OR EXISTS(SELECT 1 FROM public.job_requests WHERE id=j) OR EXISTS(SELECT 1 FROM public.admin_actions WHERE job_id=j) THEN RAISE EXCEPTION 'TEST: Anfrage und Verknüpfung müssen gelöscht sein'; END IF;
  INSERT INTO public.fahrer_profile(vorname,nachname,email,telefon,agb_accepted_at) VALUES ('TEST','Geschuetzt','delete-protected-regression@example.invalid','TEST',now()) RETURNING id INTO d;
  INSERT INTO public.driver_contract_invites(driver_id,token,contract_version,expires_at,created_by) VALUES(d,gen_random_uuid()::text,'TEST',now()+interval '1 day','TEST');
  blocked:=false;
  BEGIN PERFORM public.admin_delete_driver(d,'delete-protected-regression@example.invalid'); EXCEPTION WHEN raise_exception THEN blocked:=true; END;
  IF NOT blocked OR NOT EXISTS(SELECT 1 FROM public.fahrer_profile WHERE id=d) OR NOT EXISTS(SELECT 1 FROM public.driver_contract_invites WHERE driver_id=d) THEN RAISE EXCEPTION 'TEST: Schutz muss atomar abbrechen'; END IF;
  INSERT INTO public.job_requests(customer_name,customer_email,customer_phone,einsatzort,zeitraum,fahrzeugtyp,nachricht,customer_invoice_status) VALUES('TEST','delete-billing-regression@example.invalid','TEST','TEST','TEST','TEST','TEST','paid') RETURNING id INTO j;
  blocked:=false;
  BEGIN PERFORM public.admin_delete_job(j,'delete-billing-regression@example.invalid'); EXCEPTION WHEN raise_exception THEN blocked:=true; END;
  IF NOT blocked OR NOT EXISTS(SELECT 1 FROM public.job_requests WHERE id=j) THEN RAISE EXCEPTION 'TEST: Abrechnung muss geschützt bleiben'; END IF;
  RAISE EXCEPTION USING ERRCODE='ZX001', MESSAGE='TEST fixtures rollback';
 EXCEPTION WHEN SQLSTATE 'ZX001' THEN NULL;
 END;
END;
$$;