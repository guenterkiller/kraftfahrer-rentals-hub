-- Temporäre Policy entfernen und auf Admin-UID beschränken
DROP POLICY IF EXISTS "Alle dürfen lesen" ON public.fahrer_profile;

CREATE POLICY "Admin darf Fahrer sehen"
ON public.fahrer_profile
FOR SELECT
TO authenticated
USING (auth.uid() = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid);