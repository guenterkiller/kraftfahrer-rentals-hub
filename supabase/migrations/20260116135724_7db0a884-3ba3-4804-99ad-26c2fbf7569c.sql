-- =============================================
-- HARDEN email_log RLS POLICIES
-- =============================================

-- Drop existing permissive INSERT policy
DROP POLICY IF EXISTS "System can insert email logs" ON public.email_log;

-- Create strict service-role-only policies for all write operations
CREATE POLICY "Service role can insert email logs"
ON public.email_log
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update email logs"
ON public.email_log
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can delete email logs"
ON public.email_log
FOR DELETE
TO service_role
USING (true);

-- =============================================
-- HARDEN fahrer_profile RLS POLICIES
-- =============================================

-- Drop existing permissive public INSERT policy
DROP POLICY IF EXISTS "Public can submit driver applications" ON public.fahrer_profile;

-- Create strict service-role-only INSERT policy
-- Driver registration must go through the fahrerwerden Edge Function
CREATE POLICY "Service role can insert driver profiles"
ON public.fahrer_profile
FOR INSERT
TO service_role
WITH CHECK (
  vorname IS NOT NULL 
  AND nachname IS NOT NULL 
  AND email IS NOT NULL 
  AND telefon IS NOT NULL
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);