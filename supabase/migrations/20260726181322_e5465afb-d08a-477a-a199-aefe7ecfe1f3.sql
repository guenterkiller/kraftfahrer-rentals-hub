ALTER TABLE public.job_driver_acceptances
  ALTER COLUMN billing_model DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS invite_id uuid REFERENCES public.assignment_invites(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assignment_id uuid REFERENCES public.job_assignments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS checkbox_text text,
  ADD COLUMN IF NOT EXISTS consent_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS job_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS flow text;

CREATE INDEX IF NOT EXISTS idx_job_driver_acceptances_invite_id
  ON public.job_driver_acceptances(invite_id);
CREATE INDEX IF NOT EXISTS idx_job_driver_acceptances_assignment_id
  ON public.job_driver_acceptances(assignment_id);