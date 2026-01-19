-- Remove the problematic public read policy on admin_actions
-- This policy allows unauthenticated users to read admin audit logs
DROP POLICY IF EXISTS "Allow public read admin actions" ON public.admin_actions;

-- Verify that only admin-restricted policies remain:
-- admin_actions_admin_select (SELECT for is_admin_user())
-- admin_actions_admin_insert (INSERT for is_admin_user())