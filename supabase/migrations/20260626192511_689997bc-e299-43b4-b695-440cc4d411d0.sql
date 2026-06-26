GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_sessions TO authenticated;
GRANT ALL ON public.admin_sessions TO service_role;