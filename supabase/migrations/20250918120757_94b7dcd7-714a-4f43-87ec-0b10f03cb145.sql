-- 1) is_admin_user() vereinfachen (einzige Quelle: user_roles)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (coalesce(auth.role(), '') = 'service_role')             -- Edge Functions
    OR EXISTS (
      SELECT 1
      FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user() TO anon, authenticated;

-- 2) user_roles absichern (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY,
  role text NOT NULL CHECK (role IN ('admin','user')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS für user_roles (Admins verwalten über service_role; Lesen optional)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_roles_select ON public.user_roles;
CREATE POLICY user_roles_select ON public.user_roles
FOR SELECT USING (public.is_admin_user());  -- nur Admins sehen Einträge

-- 3) Günter als Admin setzen (Upsert über E-Mail)
-- Auth-ID der Mail holen
WITH u AS (
  SELECT id FROM auth.users WHERE lower(email)=lower('guenter.killer@t-online.de')
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM u
ON CONFLICT (user_id) DO UPDATE SET role='admin';