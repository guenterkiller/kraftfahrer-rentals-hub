-- Einzigartigkeit (gleicher Fahrer darf nicht mehrfach pro Job aktiv sein):
CREATE UNIQUE INDEX IF NOT EXISTS ux_job_assignments_job_driver
  ON public.job_assignments (job_id, driver_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_job_assignments_job_active
  ON public.job_assignments (job_id)
  WHERE status IN ('assigned','confirmed');

-- Feature Flag sicher aktiv
INSERT INTO public.feature_flags (flag_name, enabled, description)
VALUES ('ORDER_CONFIRMATION_ENABLED', true, 'Enable order confirmation emails and PDFs')
ON CONFLICT (flag_name) DO UPDATE SET enabled = true;