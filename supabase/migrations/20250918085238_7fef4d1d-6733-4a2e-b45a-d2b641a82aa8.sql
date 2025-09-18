-- Update test job with proper address data for validation
UPDATE public.job_requests
SET customer_street = 'Walther-von-Cronberg-Platz',
    customer_house_number = '12',
    customer_postal_code = '60594',
    customer_city = 'Frankfurt am Main'
WHERE id = '55ff1240-9f67-4b0c-8ff3-c8994fea36fb';