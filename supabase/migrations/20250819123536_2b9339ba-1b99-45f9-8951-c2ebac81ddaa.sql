-- CRITICAL SECURITY FIX: Fix Security Definer view and enable proper RLS

-- Fix the fahrer_profile_admin_summary view security issues
-- 1. Change from SECURITY DEFINER to SECURITY INVOKER mode
-- 2. Enable RLS on the view
-- 3. Add proper access control policies

-- First, enable RLS on the view and set security invoker mode
ALTER VIEW public.fahrer_profile_admin_summary SET (security_invoker = true);
ALTER VIEW public.fahrer_profile_admin_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to restrict access to admins only
CREATE POLICY "Only admins can access driver summary data"
ON public.fahrer_profile_admin_summary
FOR SELECT
USING (is_admin_user());

COMMENT ON VIEW public.fahrer_profile_admin_summary IS 'Admin view with enhanced security: RLS enabled, security invoker mode, admin-only access with anonymized contact details for privacy protection.';