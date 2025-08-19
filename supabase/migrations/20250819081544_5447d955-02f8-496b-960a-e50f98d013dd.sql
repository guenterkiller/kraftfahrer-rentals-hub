-- Enable RLS on all tables (some may already be enabled)
ALTER TABLE public.fahrer_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fahrer_dokumente ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobalarm_fahrer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobalarm_antworten ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_log ENABLE ROW LEVEL SECURITY;

-- Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role text NOT NULL DEFAULT 'driver',
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1),
    'driver'
  );
$$;

-- Security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE  
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'admin'
  ) OR user_uuid = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid;
$$;

-- Drop existing policies that are too permissive
DROP POLICY IF EXISTS "Anyone can view job requests" ON public.job_requests;
DROP POLICY IF EXISTS "Anyone can insert job requests" ON public.job_requests;  
DROP POLICY IF EXISTS "Anyone can update job request status" ON public.job_requests;
DROP POLICY IF EXISTS "Anyone can submit driver applications" ON public.fahrer_profile;
DROP POLICY IF EXISTS "Admin darf Fahrer sehen" ON public.fahrer_profile;
DROP POLICY IF EXISTS "Admin darf alle Dokumente sehen" ON public.fahrer_dokumente;
DROP POLICY IF EXISTS "System darf Dokumente einfügen" ON public.fahrer_dokumente;

-- FAHRER_PROFILE policies
CREATE POLICY "Drivers can view own profile" ON public.fahrer_profile
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    id = auth.uid() OR 
    public.is_admin(auth.uid())
  )
);

CREATE POLICY "Drivers can insert own profile" ON public.fahrer_profile  
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND id = auth.uid()
);

CREATE POLICY "Drivers can update own profile" ON public.fahrer_profile
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    id = auth.uid() OR
    public.is_admin(auth.uid())
  )
);

CREATE POLICY "Only admin can delete profiles" ON public.fahrer_profile
FOR DELETE USING (
  public.is_admin(auth.uid())
);

-- FAHRER_DOKUMENTE policies  
CREATE POLICY "Users can view own documents" ON public.fahrer_dokumente
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    fahrer_id = auth.uid() OR
    public.is_admin(auth.uid())
  )
);

CREATE POLICY "Users can insert own documents" ON public.fahrer_dokumente
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND fahrer_id = auth.uid()
);

CREATE POLICY "Only admin can update documents" ON public.fahrer_dokumente  
FOR UPDATE USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Only admin can delete documents" ON public.fahrer_dokumente
FOR DELETE USING (
  public.is_admin(auth.uid())
);

-- JOB_REQUESTS policies
CREATE POLICY "Anyone can view job requests" ON public.job_requests
FOR SELECT USING (true);

CREATE POLICY "Anyone can create job requests" ON public.job_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admin can update job requests" ON public.job_requests
FOR UPDATE USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Only admin can delete job requests" ON public.job_requests  
FOR DELETE USING (
  public.is_admin(auth.uid())
);

-- JOBALARM_FAHRER policies
CREATE POLICY "Users can view own job alerts" ON public.jobalarm_fahrer
FOR SELECT USING (
  public.is_admin(auth.uid()) OR
  email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

CREATE POLICY "Anyone can subscribe to job alerts" ON public.jobalarm_fahrer
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own subscription" ON public.jobalarm_fahrer  
FOR DELETE USING (
  public.is_admin(auth.uid()) OR
  email IN (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
);

-- JOBALARM_ANTWORTEN policies
CREATE POLICY "Admin can view all responses" ON public.jobalarm_antworten
FOR SELECT USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Anyone can insert responses" ON public.jobalarm_antworten
FOR INSERT WITH CHECK (true);

-- USER_ROLES policies
CREATE POLICY "Users can view own role" ON public.user_roles
FOR SELECT USING (
  user_id = auth.uid() OR public.is_admin(auth.uid())
);

CREATE POLICY "Only admin can manage roles" ON public.user_roles
FOR ALL USING (
  public.is_admin(auth.uid())
);

-- ADMIN_LOG policies  
CREATE POLICY "Only admin can view logs" ON public.admin_log
FOR SELECT USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "System can insert logs" ON public.admin_log
FOR INSERT WITH CHECK (true);

-- Storage policies for fahrer-dokumente bucket
CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'fahrer-dokumente' AND 
  auth.uid() IS NOT NULL AND (
    (storage.foldername(name))[1] = auth.uid()::text OR
    public.is_admin(auth.uid())
  )
);

CREATE POLICY "Users can upload own documents" ON storage.objects  
FOR INSERT WITH CHECK (
  bucket_id = 'fahrer-dokumente' AND
  auth.uid() IS NOT NULL AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Only admin can update storage objects" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'fahrer-dokumente' AND
  public.is_admin(auth.uid())
);

CREATE POLICY "Only admin can delete storage objects" ON storage.objects
FOR DELETE USING (  
  bucket_id = 'fahrer-dokumente' AND
  public.is_admin(auth.uid())
);

-- Ensure fahrer-dokumente bucket is private
UPDATE storage.buckets SET public = false WHERE id = 'fahrer-dokumente';

-- Create admin user role for the hardcoded admin
INSERT INTO public.user_roles (user_id, role) 
VALUES ('484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid, 'admin')
ON CONFLICT (user_id, role) DO NOTHING;