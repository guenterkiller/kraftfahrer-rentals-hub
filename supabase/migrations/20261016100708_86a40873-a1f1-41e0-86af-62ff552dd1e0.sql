DO $$
DECLARE
  n int;
  test_driver constant uuid := 'c8ddeeef-b596-4b1d-9496-632fc54a7be4';
  test_jobs constant uuid[] := ARRAY['b80843ae-00f7-42c2-b7c3-4b3710f2f356','04c6d85d-85de-4ff0-9156-52d02977a34e','0efdff2e-353d-4b95-bb01-b76cd626c4af']::uuid[];
  test_acc constant uuid[] := ARRAY['aac8e051-d0a0-43f0-9845-b12c96510bce','83fd7932-9d37-417b-9ab2-6af793d29a38']::uuid[];
BEGIN
  -- Sicherheitsprüfungen: nur eindeutige Testdaten
  SELECT count(*) INTO n FROM fahrer_profile WHERE id = test_driver AND vorname='TEST' AND nachname='Annahme' AND email='info@kraftfahrer-mieten.com';
  IF n <> 1 THEN RAISE EXCEPTION 'Testfahrer nicht eindeutig'; END IF;
  SELECT count(*) INTO n FROM job_requests WHERE id = ANY(test_jobs) AND company LIKE 'TEST Firma%' AND customer_name='TEST Besteller' AND customer_email='info@kraftfahrer-mieten.com';
  IF n <> 3 THEN RAISE EXCEPTION 'Testaufträge nicht eindeutig'; END IF;
  SELECT count(*) INTO n FROM job_driver_acceptances WHERE id = ANY(test_acc) AND driver_id = test_driver AND job_id = ANY(test_jobs) AND flow='binding';
  IF n <> 2 THEN RAISE EXCEPTION 'Testannahmen nicht eindeutig'; END IF;
  -- Keine fremden Fahrer an Testaufträgen, keine weiteren Daten des Testfahrers
  SELECT count(*) INTO n FROM job_assignments WHERE job_id = ANY(test_jobs) AND driver_id <> test_driver;
  IF n <> 0 THEN RAISE EXCEPTION 'Fremde Zuteilung gefunden'; END IF;
  SELECT count(*) INTO n FROM job_assignments WHERE driver_id = test_driver AND NOT (job_id = ANY(test_jobs));
  IF n <> 0 THEN RAISE EXCEPTION 'Testfahrer an echtem Auftrag'; END IF;
  SELECT count(*) INTO n FROM job_driver_acceptances WHERE (job_id = ANY(test_jobs) OR driver_id = test_driver) AND NOT (id = ANY(test_acc));
  IF n <> 0 THEN RAISE EXCEPTION 'Weitere Nachweise gefunden'; END IF;
END $$;

-- Kontrollierte Ausnahme nur innerhalb dieser Transaktion (Tabelle exklusiv gesperrt)
LOCK TABLE public.job_driver_acceptances IN ACCESS EXCLUSIVE MODE;
ALTER TABLE public.job_driver_acceptances DISABLE TRIGGER trg_protect_binding_acceptances;
DELETE FROM public.job_driver_acceptances WHERE id IN ('aac8e051-d0a0-43f0-9845-b12c96510bce','83fd7932-9d37-417b-9ab2-6af793d29a38');
ALTER TABLE public.job_driver_acceptances ENABLE TRIGGER trg_protect_binding_acceptances;

DELETE FROM public.admin_actions WHERE job_id IN ('b80843ae-00f7-42c2-b7c3-4b3710f2f356','04c6d85d-85de-4ff0-9156-52d02977a34e','0efdff2e-353d-4b95-bb01-b76cd626c4af');
DELETE FROM public.email_log WHERE job_id IN ('b80843ae-00f7-42c2-b7c3-4b3710f2f356','04c6d85d-85de-4ff0-9156-52d02977a34e','0efdff2e-353d-4b95-bb01-b76cd626c4af');
DELETE FROM public.assignment_invites WHERE driver_id = 'c8ddeeef-b596-4b1d-9496-632fc54a7be4';
DELETE FROM public.job_assignments WHERE driver_id = 'c8ddeeef-b596-4b1d-9496-632fc54a7be4';
DELETE FROM public.job_requests WHERE id IN ('b80843ae-00f7-42c2-b7c3-4b3710f2f356','04c6d85d-85de-4ff0-9156-52d02977a34e','0efdff2e-353d-4b95-bb01-b76cd626c4af');
DELETE FROM public.fahrer_profile WHERE id = 'c8ddeeef-b596-4b1d-9496-632fc54a7be4';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_protect_binding_acceptances' AND tgenabled='O') THEN
    RAISE EXCEPTION 'Schutz nicht wieder aktiv';
  END IF;
END $$;