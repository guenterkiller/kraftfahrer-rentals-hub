-- Enum anlegen (idempotent)
DO $$ BEGIN
  CREATE TYPE public.billing_model_enum AS ENUM ('direct','agency');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Neue Spalte mit Enum-Typ hinzufügen
ALTER TABLE public.job_requests 
ADD COLUMN IF NOT EXISTS billing_model_new public.billing_model_enum DEFAULT 'agency';

-- Daten von alter zu neuer Spalte übertragen
UPDATE public.job_requests 
SET billing_model_new = 
  CASE 
    WHEN billing_model = 'direct' THEN 'direct'::public.billing_model_enum
    ELSE 'agency'::public.billing_model_enum
  END;

-- Alte Spalte löschen und neue umbenennen
ALTER TABLE public.job_requests DROP COLUMN IF EXISTS billing_model;
ALTER TABLE public.job_requests RENAME COLUMN billing_model_new TO billing_model;

-- Rechnungs-/Payout-Felder
DO $$ BEGIN
  CREATE TYPE public.invoice_status AS ENUM ('draft','sent','paid','overdue','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.job_requests
  ADD COLUMN IF NOT EXISTS customer_invoice_id uuid,
  ADD COLUMN IF NOT EXISTS subcontractor_invoice_id uuid,
  ADD COLUMN IF NOT EXISTS customer_invoice_status public.invoice_status DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS subcontractor_invoice_status public.invoice_status DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'pending';

-- Consent/Audit Tabelle
CREATE TABLE IF NOT EXISTS public.job_driver_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.job_requests(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.fahrer_profile(id) ON DELETE CASCADE,
  billing_model public.billing_model_enum NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip inet,
  user_agent text,
  terms_version text DEFAULT 'v1',
  UNIQUE (job_id, driver_id)
);

-- RLS für job_driver_acceptances
ALTER TABLE public.job_driver_acceptances ENABLE ROW LEVEL SECURITY;

-- Policies für job_driver_acceptances
CREATE POLICY "job_driver_acceptances_admin_full" 
ON public.job_driver_acceptances 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "job_driver_acceptances_system_insert"
ON public.job_driver_acceptances
FOR INSERT
WITH CHECK (true);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_job_driver_acceptances_job_id ON public.job_driver_acceptances(job_id);
CREATE INDEX IF NOT EXISTS idx_job_driver_acceptances_driver_id ON public.job_driver_acceptances(driver_id);