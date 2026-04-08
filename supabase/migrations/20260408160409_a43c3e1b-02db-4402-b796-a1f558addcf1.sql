-- Fix: fahrer_dokumente INSERT policy - restrict to service_role only
-- Edge Function upload-fahrer-dokumente uses service_role, which bypasses RLS

DROP POLICY IF EXISTS "System can upload documents" ON public.fahrer_dokumente;