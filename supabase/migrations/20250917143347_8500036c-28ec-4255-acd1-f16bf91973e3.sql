-- Partielle DB-Sicherung: Adresse muss vollständig sein bei assigned/confirmed
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