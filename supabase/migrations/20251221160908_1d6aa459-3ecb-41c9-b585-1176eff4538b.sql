-- Neue Spalten für Admin-Freigabe-Workflow hinzufügen
ALTER TABLE public.job_requests 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by TEXT,
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;

-- Status-Default auf 'pending' ändern für neue Anfragen
-- (Der aktuelle Default ist 'open', wir ändern ihn auf 'pending')
ALTER TABLE public.job_requests 
ALTER COLUMN status SET DEFAULT 'pending';

-- Kommentar zur Dokumentation
COMMENT ON COLUMN public.job_requests.approved_at IS 'Zeitpunkt der Admin-Freigabe';
COMMENT ON COLUMN public.job_requests.approved_by IS 'E-Mail des Admins der freigegeben hat';
COMMENT ON COLUMN public.job_requests.sent_at IS 'Zeitpunkt zu dem der Job an Fahrer gesendet wurde';