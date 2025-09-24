-- Fix security issue: Driver personal data exposed to public
-- The current SELECT policy is PERMISSIVE which allows access by default
-- We need to make it RESTRICTIVE to block unauthorized access

-- Drop the existing permissive SELECT policy
DROP POLICY IF EXISTS "Admins can view all driver profiles" ON public.fahrer_profile;

-- Create a restrictive SELECT policy that only allows admin access
CREATE POLICY "Restrict driver profile access to admins only" 
ON public.fahrer_profile 
FOR SELECT 
TO public
USING (is_admin_user());

-- Verify the policy is applied correctly
COMMENT ON POLICY "Restrict driver profile access to admins only" ON public.fahrer_profile 
IS 'Security policy: Only admin users can view driver personal data including names, emails, phones, addresses';