-- Fix driver registration form by allowing public INSERTs while keeping SELECTs restricted
-- This fixes the 404 error in driver registration

-- 1. Allow public driver profile creation (INSERT only)
DROP POLICY IF EXISTS "Anyone can submit driver applications" ON public.fahrer_profile;
CREATE POLICY "Public can submit driver applications"
ON public.fahrer_profile
FOR INSERT
WITH CHECK (true);

-- 2. Allow public job alert subscriptions (INSERT only)  
DROP POLICY IF EXISTS "Anyone can subscribe to job alerts" ON public.jobalarm_fahrer;
CREATE POLICY "Public can subscribe to job alerts"
ON public.jobalarm_fahrer
FOR INSERT
WITH CHECK (true);

-- 3. Allow public driver responses (INSERT only)
DROP POLICY IF EXISTS "Anyone can insert driver responses" ON public.jobalarm_antworten;
CREATE POLICY "Public can submit driver responses"
ON public.jobalarm_antworten
FOR INSERT
WITH CHECK (true);

-- 4. Allow public job requests (INSERT only)
DROP POLICY IF EXISTS "Anyone can insert job requests" ON public.job_requests;
CREATE POLICY "Public can submit job requests"
ON public.job_requests
FOR INSERT
WITH CHECK (true);

-- 5. Allow document uploads via edge function (INSERT only)
DROP POLICY IF EXISTS "System darf Dokumente einfügen" ON public.fahrer_dokumente;
CREATE POLICY "System can upload documents"
ON public.fahrer_dokumente
FOR INSERT
WITH CHECK (true);