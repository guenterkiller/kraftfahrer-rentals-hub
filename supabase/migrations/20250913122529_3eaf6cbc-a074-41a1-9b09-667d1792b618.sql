-- Enable Row Level Security on fahrer_profile_admin_summary
ALTER TABLE public.fahrer_profile_admin_summary ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admins to view driver summary data
CREATE POLICY "Only admins can view driver summary data" 
ON public.fahrer_profile_admin_summary 
FOR SELECT 
USING (is_admin_user());

-- Create policy to prevent any inserts/updates/deletes (this appears to be a view/summary table)
CREATE POLICY "No modifications allowed on summary table" 
ON public.fahrer_profile_admin_summary 
FOR ALL 
USING (false) 
WITH CHECK (false);