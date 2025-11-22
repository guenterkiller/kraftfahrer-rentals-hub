-- A) Blockieren / Stummschalten-Funktion
CREATE TABLE IF NOT EXISTS public.trucker_chat_blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL,
  blocked_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trucker_chat_blocklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can block"
ON public.trucker_chat_blocklist
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own blocklist"
ON public.trucker_chat_blocklist
FOR SELECT
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can remove from own blocklist"
ON public.trucker_chat_blocklist
FOR DELETE
USING (auth.uid() = blocker_id);