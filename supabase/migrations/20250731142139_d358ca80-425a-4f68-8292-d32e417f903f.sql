-- Temporäre Policy: Alle authentifizierten Benutzer dürfen fahrer_profile lesen
CREATE POLICY "Alle dürfen lesen" 
ON public.fahrer_profile 
FOR SELECT 
TO authenticated 
USING (true);