-- Create policy to allow admin to view documents in fahrer-dokumente bucket
CREATE POLICY "Admin can view fahrer documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'fahrer-dokumente' AND auth.uid() = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid);

-- Create policy to allow admin to create signed URLs for fahrer documents
CREATE POLICY "Admin can create signed URLs for fahrer documents"
ON storage.objects
FOR ALL
USING (bucket_id = 'fahrer-dokumente' AND auth.uid() = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid);