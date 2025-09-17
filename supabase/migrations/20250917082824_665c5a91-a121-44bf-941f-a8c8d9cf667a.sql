-- SECURITY HOTFIX: Protect driver admin summary VIEW (admin-only access)
-- This view contains sensitive PII data: names, emails, phone numbers

-- 1) Set security barrier on the view
ALTER VIEW public.fahrer_profile_admin_summary
  SET (security_barrier = true);

-- 2) Create admin-only function that checks permissions before returning data
CREATE OR REPLACE FUNCTION public.get_fahrer_admin_summary()
RETURNS SETOF public.fahrer_profile_admin_summary
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.fahrer_profile_admin_summary
  WHERE public.is_admin_user();
$$;

-- 3) Revoke all direct access to the view from public roles
REVOKE ALL ON public.fahrer_profile_admin_summary FROM PUBLIC, anon, authenticated;

-- 4) Grant access only to service_role (for edge functions)
GRANT SELECT ON public.fahrer_profile_admin_summary TO service_role;

-- 5) Set restrictive function permissions
REVOKE ALL ON FUNCTION public.get_fahrer_admin_summary() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_fahrer_admin_summary() TO service_role;

-- 6) Add comment for documentation
COMMENT ON FUNCTION public.get_fahrer_admin_summary() IS 'Admin-only function to access driver summary data. Returns data only if current user is admin via is_admin_user() check.';