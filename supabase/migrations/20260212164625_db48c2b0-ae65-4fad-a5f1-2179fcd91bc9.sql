-- Fix the ambiguity by making the parameterless version a wrapper
-- that explicitly calls the parameterized version
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT public.is_admin_user(auth.uid());
$$;