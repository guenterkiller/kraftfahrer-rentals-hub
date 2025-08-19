-- ================================
-- Admin User Update & Storage Policy Completion
-- ================================

-- 1) Admin-User in user_roles einfügen (richtige ID verwenden)
INSERT INTO public.user_roles (user_id, role)
SELECT '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid, 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid AND role = 'admin'
);

-- 2) Storage Bucket erstellen (falls nicht vorhanden)
INSERT INTO storage.buckets (id, name, public)
VALUES ('fahrer-dokumente', 'fahrer-dokumente', false)
ON CONFLICT (id) DO NOTHING;

-- 3) Storage Policies vervollständigen
-- Alte Policies löschen falls vorhanden
DROP POLICY IF EXISTS "stor_ins_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "stor_upd_admin" ON storage.objects;
DROP POLICY IF EXISTS "stor_del_admin" ON storage.objects;
DROP POLICY IF EXISTS "fahrer_dokumente_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "fahrer_dokumente_admin_all" ON storage.objects;

-- Insert nur in eigenen Ordner: '<uid>/' Präfix erzwingen
CREATE POLICY "fahrer_dokumente_insert_own" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'fahrer-dokumente'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admin: Update/Delete auf alle Dateien im Bucket
CREATE POLICY "fahrer_dokumente_admin_all" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'fahrer-dokumente' 
  AND public.is_admin(auth.uid())
)
WITH CHECK (
  bucket_id = 'fahrer-dokumente' 
  AND public.is_admin(auth.uid())
);