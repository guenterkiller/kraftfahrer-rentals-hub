
-- 1. Storage: dead/misleading policy entfernen (Fahrer sind keine auth.users in dieser App)
DROP POLICY IF EXISTS "drivers_upload_own_docs" ON storage.objects;

-- 2. Storage: 'confirmations' Bucket admin-only absichern
DROP POLICY IF EXISTS "confirmations_admin_all" ON storage.objects;
CREATE POLICY "confirmations_admin_all"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'confirmations' AND public.is_admin_user(auth.uid()))
WITH CHECK (bucket_id = 'confirmations' AND public.is_admin_user(auth.uid()));

-- 3. user_roles: explizit RESTRICTIVE-Policies gegen Self-Escalation
--    (Service-Role + Admin bleiben erlaubt; Edge Functions nutzen Service Role und umgehen RLS.)
DROP POLICY IF EXISTS "user_roles_no_self_insert" ON public.user_roles;
CREATE POLICY "user_roles_no_self_insert"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles_no_self_update" ON public.user_roles;
CREATE POLICY "user_roles_no_self_update"
ON public.user_roles
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "user_roles_no_self_delete" ON public.user_roles;
CREATE POLICY "user_roles_no_self_delete"
ON public.user_roles
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));
