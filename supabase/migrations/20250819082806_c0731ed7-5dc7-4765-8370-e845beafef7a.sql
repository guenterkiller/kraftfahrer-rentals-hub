-- ================================
-- Complete Security Setup: User Roles & Storage Policies
-- ================================

-- 1) User Roles Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin','driver','customer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS für user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2) is_admin Funktion erstellen
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = user_uuid AND ur.role = 'admin'
  );
$$;

-- 3) Admin-User hinzufügen (guenter.killer@t-online.de)
INSERT INTO public.user_roles (user_id, role)
VALUES ('484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid, 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4) Storage Bucket erstellen (falls nicht vorhanden)
INSERT INTO storage.buckets (id, name, public)
VALUES ('fahrer-dokumente', 'fahrer-dokumente', false)
ON CONFLICT (id) DO NOTHING;

-- 5) Storage Policies - alte löschen und neue erstellen
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

-- Admin: Vollzugriff auf alle Dateien im Bucket
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

-- 6) User Roles Policies
CREATE POLICY "ur_sel" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "ur_admin" ON public.user_roles
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));