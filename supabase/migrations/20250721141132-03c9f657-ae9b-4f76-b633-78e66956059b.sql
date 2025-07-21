-- Create job_requests table for storing customer job requests
CREATE TABLE public.job_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  company TEXT,
  einsatzort TEXT NOT NULL,
  zeitraum TEXT NOT NULL,
  fahrzeugtyp TEXT NOT NULL,
  fuehrerscheinklasse TEXT NOT NULL DEFAULT 'C+E',
  besonderheiten TEXT,
  nachricht TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create jobalarm_antworten table for storing driver responses
CREATE TABLE public.jobalarm_antworten (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.job_requests(id) ON DELETE CASCADE,
  fahrer_email TEXT NOT NULL,
  antwort TEXT NOT NULL CHECK (antwort IN ('available', 'unavailable')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security on both tables
ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobalarm_antworten ENABLE ROW LEVEL SECURITY;

-- Create policies for job_requests
CREATE POLICY "Anyone can insert job requests" 
ON public.job_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view job requests" 
ON public.job_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update job request status" 
ON public.job_requests 
FOR UPDATE 
USING (true);

-- Create policies for jobalarm_antworten  
CREATE POLICY "Anyone can insert driver responses" 
ON public.jobalarm_antworten 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view driver responses" 
ON public.jobalarm_antworten 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_job_requests_status ON public.job_requests(status);
CREATE INDEX idx_job_requests_created_at ON public.job_requests(created_at);
CREATE INDEX idx_jobalarm_antworten_job_id ON public.jobalarm_antworten(job_id);
CREATE INDEX idx_jobalarm_antworten_fahrer_email ON public.jobalarm_antworten(fahrer_email);

-- Create unique constraint to prevent duplicate responses
CREATE UNIQUE INDEX idx_jobalarm_antworten_unique_response ON public.jobalarm_antworten(job_id, fahrer_email);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on job_requests
CREATE TRIGGER update_job_requests_updated_at
  BEFORE UPDATE ON public.job_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();