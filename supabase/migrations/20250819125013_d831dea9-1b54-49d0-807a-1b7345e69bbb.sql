-- Enable RLS on the admin summary view
ALTER TABLE public.fahrer_profile_admin_summary ENABLE ROW LEVEL SECURITY;

-- Add RLS policy to restrict access to admins only
CREATE POLICY "Only admins can view driver summary data" 
ON public.fahrer_profile_admin_summary 
FOR SELECT 
USING (is_admin_user());