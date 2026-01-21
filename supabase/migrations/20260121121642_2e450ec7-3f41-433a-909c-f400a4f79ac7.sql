-- =====================================================
-- SECURITY FIX: RLS hardening (no public SELECT on sensitive tables)
-- Fixes policy function ambiguity by calling is_admin_user(auth.uid())
-- =====================================================

-- 0) Ensure RLS is enabled + forced (defense in depth)
ALTER TABLE public.job_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_requests FORCE ROW LEVEL SECURITY;

ALTER TABLE public.fahrer_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fahrer_profile FORCE ROW LEVEL SECURITY;

ALTER TABLE public.assignment_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_invites FORCE ROW LEVEL SECURITY;

-- =====================================================
-- 1) job_requests
--    - Keep public INSERT for form
--    - Admin-only SELECT
--    - Admin-only UPDATE
-- =====================================================

DROP POLICY IF EXISTS "Only admins can view job requests" ON public.job_requests;
DROP POLICY IF EXISTS "Public can submit job requests" ON public.job_requests;
DROP POLICY IF EXISTS "Only admins can update job requests" ON public.job_requests;
DROP POLICY IF EXISTS "Admins can update job contact data securely" ON public.job_requests;
DROP POLICY IF EXISTS "job_requests_admin_select" ON public.job_requests;
DROP POLICY IF EXISTS "job_requests_anon_no_select" ON public.job_requests;
DROP POLICY IF EXISTS "job_requests_public_insert" ON public.job_requests;
DROP POLICY IF EXISTS "job_requests_admin_update" ON public.job_requests;

-- Explicitly deny anon SELECT
CREATE POLICY "job_requests_anon_no_select"
ON public.job_requests
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

-- Admin SELECT (uses UUID overload; avoids ambiguity)
CREATE POLICY "job_requests_admin_select"
ON public.job_requests
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

-- Public INSERT (form)
CREATE POLICY "job_requests_public_insert"
ON public.job_requests
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admin UPDATE
CREATE POLICY "job_requests_admin_update"
ON public.job_requests
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

-- =====================================================
-- 2) fahrer_profile
--    - Admin-only SELECT
--    - Admin UPDATE/DELETE
--    - Service role INSERT (edge functions)
--    - NOTE: No per-driver owner policies because there is no user_id column.
-- =====================================================

DROP POLICY IF EXISTS "Restrict driver profile access to admins only" ON public.fahrer_profile;
DROP POLICY IF EXISTS "Admins can update driver profiles and status" ON public.fahrer_profile;
DROP POLICY IF EXISTS "Admins can delete driver profiles" ON public.fahrer_profile;
DROP POLICY IF EXISTS "Service role can insert driver profiles" ON public.fahrer_profile;
DROP POLICY IF EXISTS "fahrer_profile_admin_select" ON public.fahrer_profile;
DROP POLICY IF EXISTS "fahrer_profile_anon_no_select" ON public.fahrer_profile;
DROP POLICY IF EXISTS "fahrer_profile_service_insert" ON public.fahrer_profile;
DROP POLICY IF EXISTS "fahrer_profile_admin_update" ON public.fahrer_profile;
DROP POLICY IF EXISTS "fahrer_profile_admin_delete" ON public.fahrer_profile;

CREATE POLICY "fahrer_profile_anon_no_select"
ON public.fahrer_profile
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

CREATE POLICY "fahrer_profile_admin_select"
ON public.fahrer_profile
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "fahrer_profile_service_insert"
ON public.fahrer_profile
AS PERMISSIVE
FOR INSERT
TO service_role
WITH CHECK (
  vorname IS NOT NULL
  AND nachname IS NOT NULL
  AND email IS NOT NULL
  AND telefon IS NOT NULL
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

CREATE POLICY "fahrer_profile_admin_update"
ON public.fahrer_profile
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "fahrer_profile_admin_delete"
ON public.fahrer_profile
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (public.is_admin_user(auth.uid()));

-- =====================================================
-- 3) assignment_invites (tokens)
--    - No anon SELECT
--    - Admin can SELECT/INSERT/UPDATE/DELETE
--    - Service role can INSERT/UPDATE (edge functions need to create + mark responded)
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage invites" ON public.assignment_invites;
DROP POLICY IF EXISTS "assignment_invites_admin_select" ON public.assignment_invites;
DROP POLICY IF EXISTS "assignment_invites_anon_no_select" ON public.assignment_invites;
DROP POLICY IF EXISTS "assignment_invites_admin_insert" ON public.assignment_invites;
DROP POLICY IF EXISTS "assignment_invites_service_insert" ON public.assignment_invites;
DROP POLICY IF EXISTS "assignment_invites_admin_update" ON public.assignment_invites;
DROP POLICY IF EXISTS "assignment_invites_service_update" ON public.assignment_invites;
DROP POLICY IF EXISTS "assignment_invites_admin_delete" ON public.assignment_invites;

CREATE POLICY "assignment_invites_anon_no_select"
ON public.assignment_invites
AS RESTRICTIVE
FOR SELECT
TO anon
USING (false);

CREATE POLICY "assignment_invites_admin_select"
ON public.assignment_invites
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "assignment_invites_admin_insert"
ON public.assignment_invites
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "assignment_invites_admin_update"
ON public.assignment_invites
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (public.is_admin_user(auth.uid()))
WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "assignment_invites_admin_delete"
ON public.assignment_invites
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (public.is_admin_user(auth.uid()));

CREATE POLICY "assignment_invites_service_insert"
ON public.assignment_invites
AS PERMISSIVE
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "assignment_invites_service_update"
ON public.assignment_invites
AS PERMISSIVE
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- 4) Privileges (defense in depth; RLS is the primary control)
-- =====================================================
REVOKE SELECT ON public.job_requests FROM anon;
REVOKE SELECT ON public.fahrer_profile FROM anon;
REVOKE SELECT ON public.assignment_invites FROM anon;

GRANT INSERT ON public.job_requests TO anon;