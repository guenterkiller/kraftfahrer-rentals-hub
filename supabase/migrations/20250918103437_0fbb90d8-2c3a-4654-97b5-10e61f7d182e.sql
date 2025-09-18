-- Dauerhafte Absicherung: Unique Index für aktive Assignments
CREATE UNIQUE INDEX IF NOT EXISTS uniq_job_active_assignment
ON public.job_assignments(job_id)
WHERE status IN ('assigned','confirmed');