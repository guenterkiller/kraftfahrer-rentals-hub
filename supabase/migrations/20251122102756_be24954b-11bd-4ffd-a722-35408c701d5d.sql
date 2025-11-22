-- Erstelle Tabelle für Trucker Ladies Chat-Nachrichten
CREATE TABLE IF NOT EXISTS public.trucker_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index für bessere Performance beim Abrufen der neuesten Nachrichten
CREATE INDEX IF NOT EXISTS idx_trucker_chat_created_at ON public.trucker_chat_messages(created_at DESC);

-- RLS aktivieren
ALTER TABLE public.trucker_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Jeder kann Nachrichten lesen
CREATE POLICY "Anyone can read chat messages"
  ON public.trucker_chat_messages
  FOR SELECT
  USING (true);

-- Policy: Jeder kann Nachrichten schreiben (mit Validierung)
CREATE POLICY "Anyone can insert chat messages"
  ON public.trucker_chat_messages
  FOR INSERT
  WITH CHECK (
    user_name IS NOT NULL 
    AND LENGTH(TRIM(user_name)) >= 2 
    AND LENGTH(TRIM(user_name)) <= 50
    AND message IS NOT NULL 
    AND LENGTH(TRIM(message)) >= 1 
    AND LENGTH(TRIM(message)) <= 500
  );

-- Realtime für die Tabelle aktivieren
ALTER TABLE public.trucker_chat_messages REPLICA IDENTITY FULL;

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION public.update_trucker_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_trucker_chat_messages_updated_at
  BEFORE UPDATE ON public.trucker_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trucker_chat_updated_at();

-- Füge die Tabelle zur Realtime-Publikation hinzu
ALTER PUBLICATION supabase_realtime ADD TABLE public.trucker_chat_messages;