-- Set default billing_model to 'agency' for all new job requests
ALTER TABLE public.job_requests 
  ALTER COLUMN billing_model SET DEFAULT 'agency'::billing_model_enum;

-- Update existing NULL or 'direct' billing_model entries to 'agency'
UPDATE public.job_requests 
SET billing_model = 'agency'::billing_model_enum
WHERE billing_model IS NULL OR billing_model = 'direct'::billing_model_enum;

-- Add comment for documentation
COMMENT ON COLUMN public.job_requests.billing_model IS 
  'Billing model for the job request. Default: agency. All jobs use agency model where driver invoices Fahrerexpress, and Fahrerexpress invoices the customer.';