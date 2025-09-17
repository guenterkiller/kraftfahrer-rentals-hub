-- Zuerst die neuen customer_* Spalten hinzufügen (rückwärtskompatibel)
ALTER TABLE public.job_requests 
ADD COLUMN IF NOT EXISTS customer_street TEXT,
ADD COLUMN IF NOT EXISTS customer_house_number TEXT,  
ADD COLUMN IF NOT EXISTS customer_postal_code TEXT,
ADD COLUMN IF NOT EXISTS customer_city TEXT;