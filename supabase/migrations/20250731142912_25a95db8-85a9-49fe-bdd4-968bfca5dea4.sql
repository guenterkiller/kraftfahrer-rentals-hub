-- Tabelle für Fahrerdokumente erstellen
CREATE TABLE public.fahrer_dokumente (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fahrer_id UUID NOT NULL REFERENCES public.fahrer_profile(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL, -- PDF, JPG, PNG etc.
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS aktivieren
ALTER TABLE public.fahrer_dokumente ENABLE ROW LEVEL SECURITY;

-- Policy für Admin-Zugriff
CREATE POLICY "Admin darf alle Dokumente sehen"
ON public.fahrer_dokumente
FOR SELECT
TO authenticated
USING (auth.uid() = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid);

-- Policy für Einfügen (für Edge Functions)
CREATE POLICY "System darf Dokumente einfügen"
ON public.fahrer_dokumente
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Index für bessere Performance
CREATE INDEX idx_fahrer_dokumente_fahrer_id ON public.fahrer_dokumente(fahrer_id);
CREATE INDEX idx_fahrer_dokumente_uploaded_at ON public.fahrer_dokumente(uploaded_at DESC);