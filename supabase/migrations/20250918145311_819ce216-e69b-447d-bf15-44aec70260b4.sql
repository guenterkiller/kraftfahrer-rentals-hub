-- Evtl. aktive Assignments für Test-Jobs stornieren (korrekter Status 'cancelled')
UPDATE public.job_assignments
SET status='cancelled', cancelled_at=now()
WHERE job_id IN (
  SELECT id FROM public.job_requests
  WHERE customer_email ILIKE 'guenter.killer@t-online.de'
)
AND status IN ('assigned','confirmed');