-- Bestehende assigned/confirmed Jobs mit Platzhalter-Adressen versorgen
UPDATE public.job_requests 
SET 
  customer_street = COALESCE(customer_street, 'Nachzutragen'),
  customer_house_number = COALESCE(customer_house_number, '0'),
  customer_postal_code = COALESCE(customer_postal_code, '00000'),
  customer_city = COALESCE(customer_city, 'Nachzutragen')
WHERE status IN ('assigned', 'confirmed')
  AND (customer_street IS NULL OR customer_street = '' OR 
       customer_house_number IS NULL OR customer_house_number = '' OR
       customer_postal_code IS NULL OR customer_postal_code = '' OR
       customer_city IS NULL OR customer_city = '');

-- Jetzt die Constraint hinzufügen
ALTER TABLE public.job_requests
ADD CONSTRAINT chk_addr_when_assigned
CHECK (
  status NOT IN ('assigned','confirmed')
  OR (
    customer_street IS NOT NULL AND customer_street <> '' AND
    customer_house_number IS NOT NULL AND customer_house_number <> '' AND
    customer_postal_code ~ '^\d{5}$' AND
    customer_city IS NOT NULL AND customer_city <> ''
  )
);