-- Ensure the admin summary view enforces underlying RLS by using SECURITY INVOKER
ALTER VIEW public.fahrer_profile_admin_summary SET (security_invoker = true, security_barrier = true);

-- Optional: make intent explicit with a comment
COMMENT ON VIEW public.fahrer_profile_admin_summary IS 'Admin-only summary. SECURITY INVOKER so RLS on fahrer_profile applies. Returns zero rows for non-admins via WHERE is_admin_user().'