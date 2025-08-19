-- Fix security issues by updating RLS policies to restrict SELECT access

-- First, let's create a proper admin check function that uses the user_roles table
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = user_uuid AND ur.role = 'admin'
  ) OR user_uuid = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid;
$$;

-- Update fahrer_profile policies to restrict SELECT access
DROP POLICY IF EXISTS "Admin darf Fahrer sehen" ON public.fahrer_profile;
DROP POLICY IF EXISTS "Public can submit driver applications" ON public.fahrer_profile;

CREATE POLICY "Only admins can view driver profiles" 
ON public.fahrer_profile 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "Public can submit driver applications" 
ON public.fahrer_profile 
FOR INSERT 
WITH CHECK (true);

-- Update job_requests policies to restrict SELECT access
DROP POLICY IF EXISTS "Admin can view all job requests" ON public.job_requests;
DROP POLICY IF EXISTS "Admin can update job requests" ON public.job_requests;
DROP POLICY IF EXISTS "Public can submit job requests" ON public.job_requests;

CREATE POLICY "Only admins can view job requests" 
ON public.job_requests 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "Only admins can update job requests" 
ON public.job_requests 
FOR UPDATE 
USING (is_admin_user());

CREATE POLICY "Public can submit job requests" 
ON public.job_requests 
FOR INSERT 
WITH CHECK (true);

-- Update jobalarm_fahrer policies to restrict SELECT access
DROP POLICY IF EXISTS "Admin can view job alert subscriptions" ON public.jobalarm_fahrer;
DROP POLICY IF EXISTS "Public can subscribe to job alerts" ON public.jobalarm_fahrer;
DROP POLICY IF EXISTS "Users can delete their own subscription" ON public.jobalarm_fahrer;

CREATE POLICY "Only admins can view job alert subscriptions" 
ON public.jobalarm_fahrer 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "Public can subscribe to job alerts" 
ON public.jobalarm_fahrer 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can delete job alert subscriptions" 
ON public.jobalarm_fahrer 
FOR DELETE 
USING (is_admin_user());

-- Update jobalarm_antworten policies to restrict SELECT access
DROP POLICY IF EXISTS "Admin can view driver responses" ON public.jobalarm_antworten;
DROP POLICY IF EXISTS "Public can submit driver responses" ON public.jobalarm_antworten;

CREATE POLICY "Only admins can view driver responses" 
ON public.jobalarm_antworten 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "Public can submit driver responses" 
ON public.jobalarm_antworten 
FOR INSERT 
WITH CHECK (true);

-- Update fahrer_dokumente policies to use role-based access
DROP POLICY IF EXISTS "Admin darf alle Dokumente sehen" ON public.fahrer_dokumente;
DROP POLICY IF EXISTS "System can upload documents" ON public.fahrer_dokumente;

CREATE POLICY "Only admins can view driver documents" 
ON public.fahrer_dokumente 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "System can upload documents" 
ON public.fahrer_dokumente 
FOR INSERT 
WITH CHECK (true);