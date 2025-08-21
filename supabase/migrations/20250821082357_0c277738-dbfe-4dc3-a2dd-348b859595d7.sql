-- Enable Row Level Security on fahrer_profile_admin_summary table
ALTER TABLE public.fahrer_profile_admin_summary ENABLE ROW LEVEL SECURITY;

-- Add policy to restrict access to admins only
CREATE POLICY "Only admins can view driver summary data" 
ON public.fahrer_profile_admin_summary 
FOR SELECT 
USING (is_admin_user());

-- Ensure no other operations are allowed on this summary table
-- (INSERT, UPDATE, DELETE should not be permitted as this appears to be a read-only summary)