-- Drop the old constraint and add a new one with 'approved' and other statuses
ALTER TABLE public.job_requests 
DROP CONSTRAINT IF EXISTS job_requests_status_check;

ALTER TABLE public.job_requests 
ADD CONSTRAINT job_requests_status_check 
CHECK (status IN ('pending', 'open', 'approved', 'sent', 'assigned', 'completed', 'cancelled', 'rejected'));