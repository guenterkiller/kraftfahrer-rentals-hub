-- Nur 1 aktives Assignment pro Job erlauben (falls noch nicht vorhanden)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_job_active_assignment
ON public.job_assignments(job_id)
WHERE status IN ('assigned','confirmed');