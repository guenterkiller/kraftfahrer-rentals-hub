-- SECURITY FIX: Restrict assign_admin_role to service_role only
-- This prevents any client from calling the function directly

-- 1. Revoke public execution rights
REVOKE EXECUTE ON FUNCTION public.assign_admin_role(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.assign_admin_role(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.assign_admin_role(uuid) FROM authenticated;

-- 2. Only service_role can execute (used by edge functions with service key)
GRANT EXECUTE ON FUNCTION public.assign_admin_role(uuid) TO service_role;

-- 3. Fix storage SELECT policy for driver-documents bucket
-- Currently allows any authenticated user to view - should be admin only
DROP POLICY IF EXISTS "Users can view their own driver documents" ON storage.objects;

CREATE POLICY "Admin can view driver documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'driver-documents' 
  AND is_admin(auth.uid())
);

-- 4. Fix DELETE policy - should be admin only
DROP POLICY IF EXISTS "Users can delete their own driver documents" ON storage.objects;

CREATE POLICY "Admin can delete driver documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'driver-documents' 
  AND is_admin(auth.uid())
);

-- 5. Fix UPDATE policy - should be admin only
DROP POLICY IF EXISTS "Users can update their own driver documents" ON storage.objects;

CREATE POLICY "Admin can update driver documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'driver-documents' 
  AND is_admin(auth.uid())
);

-- 6. Keep INSERT for authenticated users (drivers upload their own docs during registration)
-- But add folder restriction so they can only upload to their own folder
DROP POLICY IF EXISTS "Authenticated users can upload driver documents" ON storage.objects;

CREATE POLICY "Drivers can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'driver-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);