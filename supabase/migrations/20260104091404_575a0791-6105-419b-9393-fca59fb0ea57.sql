-- Token-Tabelle für sichere Unsubscribe-Links (Kunden-Newsletter)
CREATE TABLE public.customer_newsletter_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- RLS aktivieren
ALTER TABLE public.customer_newsletter_tokens ENABLE ROW LEVEL SECURITY;

-- Nur Service-Role darf lesen/schreiben (Edge Functions)
CREATE POLICY "Service role full access" 
ON public.customer_newsletter_tokens 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Index für schnelle Token-Suche
CREATE INDEX idx_customer_newsletter_tokens_token ON public.customer_newsletter_tokens(token);
CREATE INDEX idx_customer_newsletter_tokens_email ON public.customer_newsletter_tokens(email);