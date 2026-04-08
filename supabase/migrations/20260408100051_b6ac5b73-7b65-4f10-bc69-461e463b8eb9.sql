-- Cleanup: Remove legacy policies on deprecated 'driver-documents' bucket
-- Upload goes through edge function (service_role), so these are unnecessary attack surface

DROP POLICY IF EXISTS "Drivers can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete driver documents" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update driver documents" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view driver documents" ON storage.objects;

-- Remove duplicate admin policy on fahrer-dokumente (keep only the one from latest migration)
DROP POLICY IF EXISTS "fahrer_dokumente_admin_all" ON storage.objects;
DROP POLICY IF EXISTS "fahrer_dokumente_insert_own" ON storage.objects;

-- Re-create clean driver upload policy: authenticated users can INSERT into their own folder only
CREATE POLICY "drivers_upload_own_docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fahrer-dokumente'
  AND (storage.foldername(name))[1] = auth.uid()::text
);