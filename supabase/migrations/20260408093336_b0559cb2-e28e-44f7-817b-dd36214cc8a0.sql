-- =============================================
-- FIX 1: user_roles - Prevent privilege escalation
-- Only existing admins can INSERT new roles
-- =============================================

CREATE POLICY "user_roles_admin_insert_only"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "user_roles_anon_no_insert"
ON public.user_roles FOR INSERT
TO anon
WITH CHECK (false);

-- =============================================
-- FIX 2: confirmations bucket - No anonymous uploads
-- Service role bypasses RLS, so edge functions still work
-- =============================================

DROP POLICY IF EXISTS "System can upload confirmation PDFs" ON storage.objects;

-- =============================================
-- FIX 3: Replace hardcoded UUID with role check
-- =============================================

DROP POLICY IF EXISTS "Admin can view fahrer documents" ON storage.objects;
DROP POLICY IF EXISTS "Admin can create signed URLs for fahrer documents" ON storage.objects;

CREATE POLICY "Admin can view fahrer documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'fahrer-dokumente' AND public.is_admin(auth.uid()));

CREATE POLICY "Admin can manage fahrer documents"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'fahrer-dokumente' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'fahrer-dokumente' AND public.is_admin(auth.uid()));