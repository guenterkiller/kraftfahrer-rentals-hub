-- Harden SECURITY DEFINER functions: remove them from the public API surface
-- These functions are either internally guarded (assign_admin_role) or intended
-- for internal use only (cleanup_old_admin_sessions, calc_no_show_fee_cents).
-- Revoking EXECUTE from anon, authenticated, and PUBLIC is idempotent.

-- 1) assign_admin_role: already has an internal service_role guard;
--    this REVOKE ensures it is not callable via RPC at all.
REVOKE EXECUTE ON FUNCTION public.assign_admin_role(uuid) FROM anon, authenticated, public;

-- 2) cleanup_old_admin_sessions: maintenance helper, no legitimate frontend or edge-function caller.
REVOKE EXECUTE ON FUNCTION public.cleanup_old_admin_sessions() FROM anon, authenticated, public;

-- 3) calc_no_show_fee_cents: internal calculation helper, called only by admin_mark_no_show.
--    Frontend preview (NoShowDialog) falls back to 150 € if the direct RPC fails.
REVOKE EXECUTE ON FUNCTION public.calc_no_show_fee_cents(text, numeric, timestamp with time zone) FROM anon, authenticated, public;