-- Sicherheitsprüfung der Testdaten-Bereinigung. Läuft vollständig in einem Block,
-- der am Ende absichtlich abbricht: es bleiben KEINE Daten zurück, es werden KEINE E-Mails versendet.
-- Erwartetes Ergebnis: Fehler "ALLE_PRUEFUNGEN_BESTANDEN".
DO $$
DECLARE real_d uuid; test_d uuid; test_j uuid; real_j uuid; inv uuid; r jsonb; ok boolean;
BEGIN
  PERFORM set_config('request.jwt.claims', '{"role":"service_role"}', true);
  INSERT INTO public.test_identities(email, created_by) VALUES ('zz-pruefung@example.com', 'pruefung')
    ON CONFLICT DO NOTHING;

  INSERT INTO public.fahrer_profile(vorname,nachname,email,telefon,status)
    VALUES ('Echt','Pruefung','zz-echt-pruefung@example.com','0','approved') RETURNING id INTO real_d;
  INSERT INTO public.fahrer_profile(vorname,nachname,email,telefon,status, is_test)
    VALUES ('Test','Pruefung','zz-pruefung@example.com','0','approved', false) RETURNING id INTO test_d;

  -- 1 Kennzeichen bei Neuanlage serverseitig gesetzt (Client-Wert ignoriert)
  IF (SELECT is_test FROM public.fahrer_profile WHERE id=real_d) THEN RAISE EXCEPTION 'P1a: echter Fahrer gekennzeichnet'; END IF;
  IF NOT (SELECT is_test FROM public.fahrer_profile WHERE id=test_d) THEN RAISE EXCEPTION 'P1b: Testfahrer nicht gekennzeichnet'; END IF;

  -- 2 Nachträgliche Kennzeichnung unmöglich
  ok := false;
  BEGIN UPDATE public.fahrer_profile SET is_test=true WHERE id=real_d; EXCEPTION WHEN OTHERS THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'P2: nachträgliche Kennzeichnung möglich'; END IF;

  -- 3 Echter Fahrer mit E-Mail nachträglich in Liste: weiterhin nicht löschbar
  INSERT INTO public.test_identities(email) VALUES ('zz-echt-pruefung@example.com');
  r := public.admin_test_purge_preview('driver', real_d);
  IF r->>'blocked' IS NULL THEN RAISE EXCEPTION 'P3: echter Fahrer löschbar'; END IF;
  ok := false;
  BEGIN PERFORM public.admin_test_purge('driver', real_d, 'zz-echt-pruefung@example.com', 'TESTDATEN LÖSCHEN', 'p'); EXCEPTION WHEN OTHERS THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'P3b: echter Fahrer gelöscht'; END IF;

  -- 4 Vertragsnachweis echter Fahrer bleibt geschützt, auch bei gesetztem Ausnahmeschalter
  INSERT INTO public.driver_contract_invites(driver_id, token, contract_version, status, expires_at)
    VALUES (real_d, 'zz-real-'||gen_random_uuid(), '2026-10-25', 'used', now()+interval '1 day') RETURNING id INTO inv;
  INSERT INTO public.driver_contract_decisions(driver_id, invite_id, decision, contract_version, contract_text, consent_text, content_hash)
    VALUES (real_d, inv, 'accept', '2026-10-25', 't', 'c', 'h');
  PERFORM set_config('app.test_purge', 'on', true);
  ok := false;
  BEGIN DELETE FROM public.driver_contract_decisions WHERE driver_id=real_d; EXCEPTION WHEN OTHERS THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'P4: echter Vertragsnachweis löschbar'; END IF;
  ok := false;
  BEGIN DELETE FROM public.fahrer_profile WHERE id=real_d; EXCEPTION WHEN OTHERS THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'P4b: echter Fahrer löschbar'; END IF;
  PERFORM set_config('app.test_purge', 'off', true);

  -- 5 Falsche Sicherheitsbestätigung abgewiesen
  ok := false;
  BEGIN PERFORM public.admin_test_purge('driver', test_d, 'zz-pruefung@example.com', 'ja', 'p'); EXCEPTION WHEN OTHERS THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'P5: ohne Bestätigung gelöscht'; END IF;

  -- 6 Testauftrag mit Angebot an echten Fahrer: Löschung abgelehnt, Archivierung möglich
  INSERT INTO public.job_requests(customer_name,customer_email,customer_phone,einsatzort,zeitraum,fahrzeugtyp,fuehrerscheinklasse,nachricht,status)
    VALUES ('T','zz-pruefung@example.com','0','X','X','X','CE','X','open') RETURNING id INTO test_j;
  IF NOT (SELECT is_test FROM public.job_requests WHERE id=test_j) THEN RAISE EXCEPTION 'P6a: Testauftrag nicht gekennzeichnet'; END IF;
  INSERT INTO public.assignment_invites(job_id, driver_id, status, token, token_expires_at, purpose)
    VALUES (test_j, real_d, 'pending', 'zz-'||gen_random_uuid(), now()+interval '1 day', 'interest');
  ok := false;
  BEGIN PERFORM public.admin_test_purge('job', test_j, 'zz-pruefung@example.com', 'TESTDATEN LÖSCHEN', 'p'); EXCEPTION WHEN OTHERS THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'P6b: Auftrag mit echtem Fahrer gelöscht'; END IF;
  r := public.admin_test_purge_preview('job', test_j);
  IF NOT (r->>'archivable')::boolean THEN RAISE EXCEPTION 'P6c: Archivierung nicht möglich'; END IF;

  -- 7 Archivierung abgelehnt, wenn echter Fahrer zugeteilt ist
  INSERT INTO public.job_assignments(job_id, driver_id, status, rate_type, rate_value) VALUES (test_j, real_d, 'assigned', 'daily', 1);
  ok := false;
  BEGIN PERFORM public.admin_test_archive_job(test_j, 'zz-pruefung@example.com', 'p'); EXCEPTION WHEN OTHERS THEN ok := true; END;
  IF NOT ok THEN RAISE EXCEPTION 'P7: Archivierung trotz echter Zuteilung'; END IF;

  -- 8 Testfahrer mit eigenem Vertragsnachweis und Angebot zu echtem Auftrag: vollständig löschbar
  INSERT INTO public.job_requests(customer_name,customer_email,customer_phone,einsatzort,zeitraum,fahrzeugtyp,fuehrerscheinklasse,nachricht,status)
    VALUES ('R','zz-echt-kunde@example.com','0','X','X','X','CE','X','open') RETURNING id INTO real_j;
  INSERT INTO public.assignment_invites(job_id, driver_id, status, token, token_expires_at, purpose)
    VALUES (real_j, test_d, 'pending', 'zz-'||gen_random_uuid(), now()+interval '1 day', 'interest');
  INSERT INTO public.driver_contract_invites(driver_id, token, contract_version, status, expires_at)
    VALUES (test_d, 'zz-test-'||gen_random_uuid(), '2026-10-25', 'used', now()+interval '1 day') RETURNING id INTO inv;
  INSERT INTO public.driver_contract_decisions(driver_id, invite_id, decision, contract_version, contract_text, consent_text, content_hash)
    VALUES (test_d, inv, 'accept', '2026-10-25', 't', 'c', 'h');
  r := public.admin_test_purge('driver', test_d, 'zz-pruefung@example.com', 'TESTDATEN LÖSCHEN', 'p');
  IF EXISTS (SELECT 1 FROM public.fahrer_profile WHERE id=test_d) THEN RAISE EXCEPTION 'P8: Testfahrer nicht gelöscht'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.job_requests WHERE id=real_j) THEN RAISE EXCEPTION 'P8b: echter Auftrag mitgelöscht'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.driver_contract_decisions WHERE driver_id=real_d) THEN RAISE EXCEPTION 'P8c: echter Nachweis verloren'; END IF;
  IF public.test_purge_active() THEN RAISE EXCEPTION 'P8d: Ausnahmeschalter bleibt aktiv'; END IF;

  RAISE EXCEPTION 'ALLE_PRUEFUNGEN_BESTANDEN';
END $$;
