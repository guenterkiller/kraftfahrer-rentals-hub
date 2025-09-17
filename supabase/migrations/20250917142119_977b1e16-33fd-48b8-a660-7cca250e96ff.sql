-- 1) Kanonische Adress-View (nur lesen)
CREATE OR REPLACE VIEW public.job_requests_addr_v AS
SELECT
  jr.id,
  COALESCE(NULLIF(jr.customer_street,        ''), jr.strasse)  AS street,
  COALESCE(NULLIF(jr.customer_house_number,  ''), jr.hausnr)   AS house_number,
  COALESCE(NULLIF(jr.customer_postal_code,   ''), jr.plz)      AS postal_code,
  COALESCE(NULLIF(jr.customer_city,          ''), jr.ort)      AS city
FROM public.job_requests jr;

-- 2) Helper: Adresse vollständig?
CREATE OR REPLACE FUNCTION public.address_is_complete(_job_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT street IS NOT NULL AND street <> ''
     AND house_number IS NOT NULL AND house_number <> ''
     AND postal_code  IS NOT NULL AND postal_code  <> ''
     AND city         IS NOT NULL AND city         <> ''
  FROM public.job_requests_addr_v
  WHERE id = _job_id;
$$;

-- 3) Schnellfilter für fehlende Adressen (für Admin)
CREATE INDEX IF NOT EXISTS idx_job_requests_addr_missing
ON public.job_requests (created_at DESC)
WHERE (customer_street IS NULL OR customer_house_number IS NULL
    OR customer_postal_code IS NULL OR customer_city IS NULL)
  AND (strasse IS NULL OR hausnr IS NULL OR plz IS NULL OR ort IS NULL);

-- 4) Test der Helper-Function mit Günter Killers Anfrage
SELECT 
  jr.id,
  jr.customer_name,
  public.address_is_complete(jr.id) as address_complete,
  av.street, av.house_number, av.postal_code, av.city
FROM public.job_requests jr
LEFT JOIN public.job_requests_addr_v av ON av.id = jr.id
WHERE jr.customer_email = 'guenter.killer@t-online.de'
ORDER BY jr.created_at DESC
LIMIT 1;