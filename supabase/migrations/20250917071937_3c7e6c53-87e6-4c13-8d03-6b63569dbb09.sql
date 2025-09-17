-- Erweitere job_requests um neue Status-Werte
ALTER TABLE public.job_requests 
ALTER COLUMN status TYPE text;

-- Erstelle job_assignments Tabelle für Fahrer-Job-Zuordnungen
CREATE TABLE IF NOT EXISTS public.job_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.job_requests(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.fahrer_profile(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'accepted', 'declined', 'confirmed')),
  rate_type text NOT NULL DEFAULT 'hourly' CHECK (rate_type IN ('hourly', 'daily', 'weekly', 'fixed')),
  rate_value numeric NOT NULL,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone,
  declined_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(job_id, driver_id)
);

-- RLS für job_assignments
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage job assignments" 
ON public.job_assignments 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Public can create job responses" 
ON public.job_assignments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update job responses" 
ON public.job_assignments 
FOR UPDATE 
USING (true);

-- Erweitere email_log (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES public.job_requests(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES public.job_assignments(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  subject text,
  template text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error')),
  error_message text,
  message_id text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email logs" 
ON public.email_log 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "System can insert email logs" 
ON public.email_log 
FOR INSERT 
WITH CHECK (true);

-- Storage Bucket für Auftragsbestätigungen
INSERT INTO storage.buckets (id, name, public) 
VALUES ('confirmations', 'confirmations', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies für Storage
CREATE POLICY "Admins can view confirmation PDFs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'confirmations' AND is_admin_user());

CREATE POLICY "System can upload confirmation PDFs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'confirmations');

-- Trigger für updated_at auf job_assignments
CREATE TRIGGER update_job_assignments_updated_at
BEFORE UPDATE ON public.job_assignments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Feature Flag Tabelle für ORDER_CONFIRMATION_ENABLED
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_name text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT false,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage feature flags" 
ON public.feature_flags 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Setze ORDER_CONFIRMATION_ENABLED Flag (default false)
INSERT INTO public.feature_flags (flag_name, enabled, description)
VALUES ('ORDER_CONFIRMATION_ENABLED', false, 'Enable automatic order confirmation emails with PDF')
ON CONFLICT (flag_name) DO NOTHING;