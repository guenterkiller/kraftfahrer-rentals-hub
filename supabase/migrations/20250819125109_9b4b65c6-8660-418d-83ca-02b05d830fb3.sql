-- HOTFIX: Entferne nur die problematischen RLS Policies die auf auth.users zugreifen

-- Drop the problematic policies that reference auth.users table  
DROP POLICY IF EXISTS "Drivers can view their own profile" ON public.fahrer_profile;
DROP POLICY IF EXISTS "Drivers can update their own profile" ON public.fahrer_profile;

-- The admin policies already exist and work correctly
-- The public insert policy for registration also already exists

COMMENT ON TABLE public.fahrer_profile IS 'Driver profiles with simplified RLS - admin-only access for now. Driver self-access removed to prevent auth.users table access issues.';