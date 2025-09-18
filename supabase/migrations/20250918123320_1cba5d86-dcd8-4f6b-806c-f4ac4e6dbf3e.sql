-- 1. is_admin_user() final festziehen (einzige Quelle: user_roles)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (coalesce(auth.role(),'')='service_role')
      OR EXISTS (
          SELECT 1 FROM public.user_roles
           WHERE user_id = auth.uid() AND role = 'admin'
      );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon, authenticated;

-- 2. Günter als Admin sicherstellen
WITH u AS (
  SELECT id FROM auth.users WHERE lower(email)=lower('guenter.killer@t-online.de')
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM u
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';