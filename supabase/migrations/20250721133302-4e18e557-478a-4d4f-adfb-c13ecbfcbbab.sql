-- Create jobalarm_fahrer table for job alert subscriptions
CREATE TABLE public.jobalarm_fahrer (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.jobalarm_fahrer ENABLE ROW LEVEL SECURITY;

-- Create policies for job alert subscriptions
CREATE POLICY "Anyone can subscribe to job alerts" 
ON public.jobalarm_fahrer 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view job alert subscriptions" 
ON public.jobalarm_fahrer 
FOR SELECT 
USING (true);

CREATE POLICY "Users can delete their own subscription" 
ON public.jobalarm_fahrer 
FOR DELETE 
USING (true);

-- Create index for email lookups
CREATE INDEX idx_jobalarm_fahrer_email ON public.jobalarm_fahrer(email);