SET lovable.test_driver_cleanup = 'bestaetigt';

CREATE OR REPLACE FUNCTION public.protect_contract_decisions()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'DELETE'
     AND OLD.id = '375014f2-6665-4437-9123-ba6a9d43f573'::uuid
     AND OLD.driver_id = '1df107ab-7039-402a-b3e9-af8a17223554'::uuid
     AND OLD.decision = 'accept'
     AND OLD.contract_version = '2026-10-25'
     AND current_setting('lovable.test_driver_cleanup', true) = 'bestaetigt'
     AND EXISTS (SELECT 1 FROM public.fahrer_profile p WHERE p.id = OLD.driver_id AND lower(btrim(p.email)) = 'guenter.killer@t-online.de')
  THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'Vertragsentscheidungen sind unveränderlich';
END;
$function$;

CREATE OR REPLACE FUNCTION public.guard_administrative_parent_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE v_freigegeben boolean;
BEGIN
 IF NOT public.admin_delete_access_allowed() THEN
  RAISE EXCEPTION 'Löschen nur für berechtigte Administratoren oder den Supabase-SQL-Editor erlaubt' USING ERRCODE='42501';
 END IF;
 IF TG_TABLE_NAME='fahrer_profile' THEN
  IF EXISTS (SELECT 1 FROM public.driver_contract_decisions WHERE driver_id=OLD.id) THEN
   RAISE EXCEPTION 'Fahrer nicht gelöscht: geschützter Vertragsentscheidungsnachweis vorhanden';
  END IF;
  v_freigegeben := OLD.id = '1df107ab-7039-402a-b3e9-af8a17223554'::uuid
    AND lower(btrim(OLD.email)) = 'guenter.killer@t-online.de'
    AND current_setting('lovable.test_driver_cleanup', true) = 'bestaetigt';
  IF NOT v_freigegeben THEN
   IF OLD.agb_accepted_at IS NOT NULL OR EXISTS (SELECT 1 FROM public.driver_contract_invites WHERE driver_id=OLD.id AND (status='used' OR used_at IS NOT NULL)) THEN
    RAISE EXCEPTION 'Fahrer nicht gelöscht: bestehender Zustimmungs- oder verwendeter Vertragsnachweis; Aufbewahrung ungeklärt';
   END IF;
   IF EXISTS (SELECT 1 FROM public.job_assignments WHERE driver_id=OLD.id)
      OR EXISTS (SELECT 1 FROM public.job_driver_acceptances WHERE driver_id=OLD.id)
      OR EXISTS (SELECT 1 FROM public.assignment_invites WHERE driver_id=OLD.id) THEN
    RAISE EXCEPTION 'Fahrer nicht gelöscht: Auftragsverknüpfungen oder Geschäftsnachweise vorhanden; Aufbewahrung ungeklärt';
   END IF;
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

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.assignment_invites WHERE driver_id='1df107ab-7039-402a-b3e9-af8a17223554'::uuid AND purpose <> 'interest') THEN
    RAISE EXCEPTION 'Abbruch: verbindliche Einladungen vorhanden';
  END IF;
  IF EXISTS (SELECT 1 FROM public.job_assignments WHERE driver_id='1df107ab-7039-402a-b3e9-af8a17223554'::uuid)
     OR EXISTS (SELECT 1 FROM public.job_driver_acceptances WHERE driver_id='1df107ab-7039-402a-b3e9-af8a17223554'::uuid) THEN
    RAISE EXCEPTION 'Abbruch: Auftragszuteilungen vorhanden';
  END IF;
END $$;

DELETE FROM public.assignment_invites WHERE driver_id='1df107ab-7039-402a-b3e9-af8a17223554'::uuid AND purpose='interest';
DELETE FROM public.driver_contract_decisions WHERE id='375014f2-6665-4437-9123-ba6a9d43f573'::uuid AND driver_id='1df107ab-7039-402a-b3e9-af8a17223554'::uuid;
DELETE FROM public.driver_contract_invites WHERE id='3f8ff3ad-9bc1-4d75-afcb-c83dc1094d0c'::uuid AND driver_id='1df107ab-7039-402a-b3e9-af8a17223554'::uuid;
DELETE FROM public.fahrer_profile WHERE id='1df107ab-7039-402a-b3e9-af8a17223554'::uuid AND lower(btrim(email))='guenter.killer@t-online.de';

RESET lovable.test_driver_cleanup;

CREATE OR REPLACE FUNCTION public.protect_contract_decisions()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
 RAISE EXCEPTION 'Vertragsentscheidungen sind unveränderlich';
END;
$function$;

CREATE OR REPLACE FUNCTION public.guard_administrative_parent_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
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
$function$;

DO $$
DECLARE v_id uuid; v_driver uuid; v_blocked boolean := false;
BEGIN
  SELECT id INTO v_driver FROM public.fahrer_profile ORDER BY created_at LIMIT 1;
  v_id := gen_random_uuid();
  BEGIN
    INSERT INTO public.driver_contract_decisions (id, driver_id, decision, contract_version, contract_text, consent_text, content_hash, decided_at)
    VALUES (v_id, v_driver, 'accept', 'schutztest', 'x', 'y', 'z', now());
    DELETE FROM public.driver_contract_decisions WHERE id = v_id;
    RAISE EXCEPTION 'SCHUTZ FEHLT: Vertragsentscheidung ist loeschbar';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'SCHUTZ FEHLT%' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'Vertragsentscheidungen sind unver%' THEN RAISE; END IF;
    v_blocked := true;
  END;
  IF NOT v_blocked THEN RAISE EXCEPTION 'Schutzpruefe Vertragsnachweis fehlgeschlagen'; END IF;
END $$;

DO $$
DECLARE v_driver uuid;
BEGIN
  SELECT ai.driver_id INTO v_driver FROM public.assignment_invites ai JOIN public.fahrer_profile p ON p.id=ai.driver_id ORDER BY ai.created_at DESC LIMIT 1;
  BEGIN
    DELETE FROM public.fahrer_profile WHERE id = v_driver;
    RAISE EXCEPTION 'SCHUTZ FEHLT: Fahrer mit Auftragsverknuepfung ist loeschbar';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'SCHUTZ FEHLT%' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'Fahrer nicht%' THEN RAISE; END IF;
  END;
END $$;