-- Fehlerkorrektur: Alle Parameter nach DEFAULT-Parametern müssen auch DEFAULT haben

-- Korrigiere submit_job_request Funktion mit korrekter Parameter-Reihenfolge
CREATE OR REPLACE FUNCTION public.submit_job_request(
  _customer_name text,
  _customer_email text,
  _customer_phone text,
  _einsatzort text,
  _zeitraum text,
  _fahrzeugtyp text,
  _nachricht text,
  _company text DEFAULT NULL,
  _fuehrerscheinklasse text DEFAULT 'C+E',
  _besonderheiten text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  _job_id uuid;
BEGIN
  -- Validierung der Pflichtfelder
  IF _customer_name IS NULL OR LENGTH(TRIM(_customer_name)) = 0 THEN
    RAISE EXCEPTION 'Kundenname ist erforderlich';
  END IF;
  
  IF _customer_email IS NULL OR NOT (_customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN
    RAISE EXCEPTION 'Gültige E-Mail-Adresse ist erforderlich';
  END IF;
  
  IF _customer_phone IS NULL OR LENGTH(TRIM(_customer_phone)) = 0 THEN
    RAISE EXCEPTION 'Telefonnummer ist erforderlich';
  END IF;
  
  IF _einsatzort IS NULL OR LENGTH(TRIM(_einsatzort)) = 0 THEN
    RAISE EXCEPTION 'Einsatzort ist erforderlich';
  END IF;
  
  IF _zeitraum IS NULL OR LENGTH(TRIM(_zeitraum)) = 0 THEN
    RAISE EXCEPTION 'Zeitraum ist erforderlich';
  END IF;
  
  IF _fahrzeugtyp IS NULL OR LENGTH(TRIM(_fahrzeugtyp)) = 0 THEN
    RAISE EXCEPTION 'Fahrzeugtyp ist erforderlich';
  END IF;
  
  IF _nachricht IS NULL OR LENGTH(TRIM(_nachricht)) = 0 THEN
    RAISE EXCEPTION 'Nachricht ist erforderlich';
  END IF;

  -- Sichere Einfügung mit kontrollierten Daten
  INSERT INTO public.job_requests (
    customer_name, customer_email, customer_phone, company,
    einsatzort, zeitraum, fahrzeugtyp, fuehrerscheinklasse,
    besonderheiten, nachricht, status, created_at, updated_at
  ) VALUES (
    TRIM(_customer_name), LOWER(TRIM(_customer_email)), TRIM(_customer_phone),
    NULLIF(TRIM(_company), ''), TRIM(_einsatzort), TRIM(_zeitraum),
    TRIM(_fahrzeugtyp), COALESCE(TRIM(_fuehrerscheinklasse), 'C+E'),
    NULLIF(TRIM(_besonderheiten), ''), TRIM(_nachricht),
    'open', now(), now()
  ) RETURNING id INTO _job_id;

  RETURN _job_id;
END $function$;