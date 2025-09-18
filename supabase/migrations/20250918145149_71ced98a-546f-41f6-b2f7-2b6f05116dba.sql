-- Test-Daten sauber herrichten
-- Eindeutigkeit absichern
CREATE UNIQUE INDEX IF NOT EXISTS uniq_job_active_assignment
ON public.job_assignments(job_id)
WHERE status IN ('assigned','confirmed');

-- Evtl. aktive Assignments für Test-Jobs stornieren
UPDATE public.job_assignments
SET status='cancelled', cancelled_at=now()
WHERE job_id IN (
  SELECT id FROM public.job_requests
  WHERE customer_email ILIKE 'guenter.killer@t-online.de'
)
AND status IN ('assigned','confirmed');

-- Jüngsten offenen Test-Job + aktiven Fahrer ermitteln
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