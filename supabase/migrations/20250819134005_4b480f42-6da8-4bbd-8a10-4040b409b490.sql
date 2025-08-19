-- Fix RLS policy for job_requests to allow anonymous submissions
DROP POLICY IF EXISTS "Public can submit job requests" ON public.job_requests;

-- Create new policy that explicitly allows both anonymous and authenticated users to insert
CREATE POLICY "Public can submit job requests" 
ON public.job_requests 
FOR INSERT 
WITH CHECK (true);

-- Ensure the policy allows anonymous users by being completely permissive for inserts
-- This is safe because job requests don't contain sensitive data and should be publicly submittable