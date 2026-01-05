-- 1) Remove hardcoded UUID from is_admin_user() - only check user_roles table + service_role
CREATE OR REPLACE FUNCTION public.is_admin_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  -- Allow service_role (Edge Functions) OR authenticated admin users via user_roles
  SELECT 
    auth.role() = 'service_role' 
    OR 
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = COALESCE(user_uuid, auth.uid())
        AND ur.role = 'admin'
    );
$$;

-- 2) Ensure is_admin() also has no hardcoded UUID
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = user_uuid
      AND ur.role = 'admin'
  );
$$;

-- 3) Secure assign_admin_role: only callable by service_role (Edge Functions)
CREATE OR REPLACE FUNCTION public.assign_admin_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Only service_role can call this function
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'forbidden: only service_role can assign admin role';
  END IF;

  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- 4) Revoke direct execute from public/authenticated - only service_role via Edge Functions
REVOKE EXECUTE ON FUNCTION public.assign_admin_role(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.assign_admin_role(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.assign_admin_role(uuid) FROM anon;