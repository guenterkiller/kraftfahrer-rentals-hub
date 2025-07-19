-- Enable Row Level Security on fahrer_profile table
ALTER TABLE public.fahrer_profile ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert new driver applications
CREATE POLICY "Anyone can submit driver applications" 
ON public.fahrer_profile 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow public viewing of approved driver profiles
CREATE POLICY "Public can view approved driver profiles" 
ON public.fahrer_profile 
FOR SELECT 
USING (status = 'approved');

-- Note: Admin access would require implementing authentication and user roles
-- For now, we secure the table and allow public viewing of approved profiles only