-- Add billing model field to job_requests table
ALTER TABLE public.job_requests 
ADD COLUMN billing_model text NOT NULL DEFAULT 'direct' 
CHECK (billing_model IN ('direct', 'agency'));

-- Add comment to explain the billing models
COMMENT ON COLUMN public.job_requests.billing_model IS 'Billing model: direct = client bills driver directly, agency = Fahrerexpress bills client and driver bills Fahrerexpress as subcontractor';