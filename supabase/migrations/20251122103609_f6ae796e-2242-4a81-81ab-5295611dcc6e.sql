-- 1) Alte Insert-Policy entfernen und neue für authentifizierte Nutzer
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON public.trucker_chat_messages;

CREATE POLICY "Authenticated users can insert chat messages"
  ON public.trucker_chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4) Neue Tabelle für Meldungen
CREATE TABLE IF NOT EXISTS public.trucker_chat_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.trucker_chat_messages(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trucker_chat_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can report"
  ON public.trucker_chat_reports
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins können Reports sehen
CREATE POLICY "Admins can view reports"
  ON public.trucker_chat_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );

-- 5) Admin kann Nachrichten löschen
CREATE POLICY "Admins can delete chat messages"
  ON public.trucker_chat_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = 'admin'
    )
  );