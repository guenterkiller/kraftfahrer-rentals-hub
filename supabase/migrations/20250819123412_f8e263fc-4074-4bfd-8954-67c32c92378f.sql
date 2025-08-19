-- Hotfix: Ensure fahrer-dokumente bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('fahrer-dokumente', 'fahrer-dokumente', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Ensure proper RLS policies for fahrer-dokumente bucket
CREATE POLICY IF NOT EXISTS "Service role can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fahrer-dokumente');

CREATE POLICY IF NOT EXISTS "Service role can view files"  
ON storage.objects FOR SELECT
USING (bucket_id = 'fahrer-dokumente' AND auth.role() = 'service_role');

CREATE POLICY IF NOT EXISTS "Admins can view all documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'fahrer-dokumente' AND is_admin_user());