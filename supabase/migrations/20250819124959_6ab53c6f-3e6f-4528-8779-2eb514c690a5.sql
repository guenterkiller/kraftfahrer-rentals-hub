-- HOTFIX: Repariere RLS Policy die auf auth.users zugreift

-- Drop the problematic policies that reference auth.users table
DROP POLICY IF EXISTS "Drivers can view their own profile" ON public.fahrer_profile;
DROP POLICY IF EXISTS "Drivers can update their own profile" ON public.fahrer_profile;

-- Recreate simplified policies that don't access auth.users
-- For driver self-access, we'll use a simpler approach or remove it entirely for now
-- since this is primarily an admin interface

CREATE POLICY "Admins can view all driver profiles"
ON public.fahrer_profile
FOR SELECT
USING (is_admin_user());

CREATE POLICY "Admins can update driver profiles and status"
ON public.fahrer_profile
FOR UPDATE
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Admins can delete driver profiles"
ON public.fahrer_profile
FOR DELETE
USING (is_admin_user());

-- Keep the public insert policy for registration form
-- (already exists and working)