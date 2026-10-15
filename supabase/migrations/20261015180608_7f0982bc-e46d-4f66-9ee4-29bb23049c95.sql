ALTER TABLE public.job_assignments ADD COLUMN IF NOT EXISTS commission_pct numeric;
ALTER TABLE public.job_assignments ADD CONSTRAINT job_assignments_commission_pct_check CHECK (commission_pct IS NULL OR commission_pct IN (20, 25));

ALTER TABLE public.assignment_invites ADD COLUMN IF NOT EXISTS purpose text NOT NULL DEFAULT 'interest';
ALTER TABLE public.assignment_invites ADD CONSTRAINT assignment_invites_purpose_check CHECK (purpose IN ('interest','binding'));
ALTER TABLE public.assignment_invites ADD COLUMN IF NOT EXISTS assignment_id uuid REFERENCES public.job_assignments(id);
ALTER TABLE public.assignment_invites ADD COLUMN IF NOT EXISTS expiry_notified_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_assignment_invites_assignment_id ON public.assignment_invites(assignment_id);

ALTER TABLE public.job_driver_acceptances ADD COLUMN IF NOT EXISTS contract_text text;
ALTER TABLE public.job_driver_acceptances ADD COLUMN IF NOT EXISTS contract_version text;
ALTER TABLE public.job_driver_acceptances ADD COLUMN IF NOT EXISTS commission_pct numeric;
ALTER TABLE public.job_driver_acceptances ADD COLUMN IF NOT EXISTS content_hash text;
ALTER TABLE public.job_driver_acceptances ADD COLUMN IF NOT EXISTS pdf_path text;

ALTER TABLE public.job_driver_acceptances DROP CONSTRAINT job_driver_acceptances_job_id_driver_id_key;
CREATE UNIQUE INDEX job_driver_acceptances_interest_unique ON public.job_driver_acceptances(job_id, driver_id) WHERE flow IS DISTINCT FROM 'binding';
CREATE UNIQUE INDEX job_driver_acceptances_binding_unique ON public.job_driver_acceptances(assignment_id) WHERE flow = 'binding';

CREATE OR REPLACE FUNCTION public.protect_binding_acceptances()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.flow = 'binding' THEN RAISE EXCEPTION 'binding acceptance is immutable'; END IF;
    RETURN OLD;
  END IF;
  IF OLD.flow = 'binding' THEN
    -- Nur das einmalige Nachtragen des PDF-Pfads ist erlaubt
    IF NEW.pdf_path IS DISTINCT FROM OLD.pdf_path AND OLD.pdf_path IS NULL
       AND (to_jsonb(NEW) - 'pdf_path') = (to_jsonb(OLD) - 'pdf_path') THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'binding acceptance is immutable';
  END IF;
  IF NEW.flow = 'binding' AND OLD.flow IS DISTINCT FROM 'binding' THEN
    RAISE EXCEPTION 'cannot convert to binding acceptance';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_protect_binding_acceptances
BEFORE UPDATE OR DELETE ON public.job_driver_acceptances
FOR EACH ROW EXECUTE FUNCTION public.protect_binding_acceptances();