-- Admin-Logging Tabelle erstellen
CREATE TABLE public.admin_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  event TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.admin_log ENABLE ROW LEVEL SECURITY;

-- Policy für Admin-Zugriff
CREATE POLICY "Admin darf alle Logs sehen"
ON public.admin_log
FOR SELECT
TO authenticated
USING (auth.uid() = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid);

-- Policy für Einfügen
CREATE POLICY "System darf Logs einfügen"
ON public.admin_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Index für bessere Performance
CREATE INDEX idx_admin_log_email ON public.admin_log(email);
CREATE INDEX idx_admin_log_timestamp ON public.admin_log(timestamp DESC);
CREATE INDEX idx_admin_log_event ON public.admin_log(event);