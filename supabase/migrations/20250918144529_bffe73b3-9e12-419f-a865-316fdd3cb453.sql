-- A) Einziges, sauberes Test-Job-Setup
-- 1) Offene Test-Anfrage anlegen (falls noch nicht vorhanden)
INSERT INTO public.job_requests (id, customer_name, customer_email, customer_phone,
  customer_street, customer_house_number, customer_postal_code, customer_city, 
  einsatzort, zeitraum, fahrzeugtyp, fuehrerscheinklasse, nachricht, status, created_at)
VALUES (
  gen_random_uuid(), 'Test GmbH', 'guenter.killer@t-online.de', '+49 69 123456',
  'Walther-von-Cronberg-Platz', '12', '60594', 'Frankfurt am Main', 
  'Frankfurt am Main', 'Sofort verfügbar', 'LKW', 'C+E', 'Test-Nachricht', 'open', now()
)
ON CONFLICT DO NOTHING;

-- 2) Einen vorhandenen Fahrer wählen (oder minimalen Test-Fahrer anlegen)
--    (Nur wenn kein Fahrer existiert)
INSERT INTO public.fahrer_profile (id, vorname, nachname, email, telefon, status, created_at)
SELECT gen_random_uuid(), 'Test', 'Fahrer', 'test.fahrer@example.com', '+49 30 12345678', 'active', now()
WHERE NOT EXISTS (SELECT 1 FROM public.fahrer_profile WHERE status='active');

-- 3) Eindeutigkeit: nur ein aktives Assignment pro Job
CREATE UNIQUE INDEX IF NOT EXISTS uniq_job_active_assignment
ON public.job_assignments(job_id)
WHERE status IN ('assigned','confirmed');

-- 4) Evtl. aktive Assignments für den Test-Job stornieren
UPDATE public.job_assignments
SET status='cancelled', cancelled_at=now()
WHERE job_id IN (
  SELECT id FROM public.job_requests
  WHERE customer_email ILIKE 'guenter.killer@t-online.de'
)
AND status IN ('assigned','confirmed');

-- 5) Den jüngsten offenen Test-Job & einen aktiven Fahrer zurückgeben (Baseline)
WITH j AS (
  SELECT id AS job_id FROM public.job_requests
  WHERE customer_email ILIKE 'guenter.killer@t-online.de'
  ORDER BY created_at DESC LIMIT 1
),
d AS (
  SELECT id AS driver_id FROM public.fahrer_profile
  WHERE status='active' ORDER BY created_at ASC LIMIT 1
)
SELECT (SELECT job_id FROM j) AS job_id, (SELECT driver_id FROM d) AS driver_id;