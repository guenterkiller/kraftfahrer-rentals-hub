-- Opt-Out-Liste NUR für Kunden-Newsletter
-- Beeinflusst keine anderen E-Mails (operative, manuelle, Fahrer)
CREATE TABLE public.customer_newsletter_optout (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  opted_out_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.customer_newsletter_optout ENABLE ROW LEVEL SECURITY;

-- Nur Service-Role darf lesen/schreiben (Edge Functions)
CREATE POLICY "Service role full access" 
ON public.customer_newsletter_optout 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Index für schnelle E-Mail-Suche
CREATE INDEX idx_customer_newsletter_optout_email ON public.customer_newsletter_optout(email);