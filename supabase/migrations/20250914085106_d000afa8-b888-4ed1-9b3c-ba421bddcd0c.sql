-- 1) Create/update roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin','staff','user')) DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2) Drop and recreate the is_admin_user function to avoid conflicts
DROP FUNCTION IF EXISTS public.is_admin_user();
DROP FUNCTION IF EXISTS public.is_admin_user(uuid);

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  );
$$;

-- 3) Create policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (is_admin_user());

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (is_admin_user());

-- 4) Ensure job_mail_log has proper RLS for admins
ALTER TABLE IF EXISTS public.job_mail_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "job_mail_log_admin_read" ON public.job_mail_log;
CREATE POLICY "job_mail_log_admin_read"
ON public.job_mail_log
FOR SELECT
USING (is_admin_user());

-- 5) Insert admin role for the existing admin user (if exists)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'guenter.killer@t-online.de'
ON CONFLICT (user_id) DO UPDATE SET role = excluded.role;