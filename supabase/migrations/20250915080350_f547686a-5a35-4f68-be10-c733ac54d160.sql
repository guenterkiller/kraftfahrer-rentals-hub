-- Erstelle mail_log Tabelle für E-Mail-Protokollierung
CREATE TABLE IF NOT EXISTS public.mail_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mail_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy für Admins
CREATE POLICY "Admins can view mail logs" ON public.mail_log FOR SELECT USING (is_admin_user());
CREATE POLICY "System can insert mail logs" ON public.mail_log FOR INSERT WITH CHECK (true);