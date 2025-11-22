-- Tabelle für Standort-Daten (keine exakten GPS-Daten speichern!)
CREATE TABLE IF NOT EXISTS public.trucker_locations (
  user_id UUID PRIMARY KEY,
  cluster_lat NUMERIC(9,6) NOT NULL,
  cluster_lng NUMERIC(9,6) NOT NULL,
  place_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trucker_locations ENABLE ROW LEVEL SECURITY;

-- Nur eingeloggte Nutzer dürfen ihren Standort setzen
CREATE POLICY "Authenticated users can upsert location"
ON public.trucker_locations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own location"
ON public.trucker_locations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Jeder darf Standort-Cluster lesen (anonym, kein exakter Punkt)
CREATE POLICY "Anyone can read location clusters"
ON public.trucker_locations
FOR SELECT
USING (true);