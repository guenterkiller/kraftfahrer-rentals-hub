-- Remove the public viewing policy
DROP POLICY IF EXISTS "Public can view approved driver profiles" ON public.fahrer_profile;

-- Keep only the insert policy for new applications
-- All viewing/editing should require authentication (to be implemented later)

-- Note: Now the table is secure - only new applications can be submitted
-- All other operations (SELECT, UPDATE, DELETE) are blocked until admin authentication is implemented