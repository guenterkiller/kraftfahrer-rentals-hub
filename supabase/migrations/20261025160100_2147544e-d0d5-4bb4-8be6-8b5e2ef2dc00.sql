CREATE OR REPLACE FUNCTION public.protect_contract_decisions()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
BEGIN
 RAISE EXCEPTION 'Vertragsentscheidungen sind unveränderlich';
END;
$function$;
DO $test$
DECLARE blocked boolean := false;
BEGIN
 BEGIN
  DELETE FROM public.driver_contract_decisions WHERE id='375014f2-6665-4437-9123-ba6a9d43f573';
  RAISE EXCEPTION USING ERRCODE='ZX001', MESSAGE='Schutztest fehlgeschlagen';
 EXCEPTION WHEN SQLSTATE 'P0001' THEN
  IF SQLERRM <> 'Vertragsentscheidungen sind unveränderlich' THEN RAISE; END IF;
  blocked := true;
 END;
 IF NOT blocked THEN RAISE EXCEPTION 'Schutztest fehlgeschlagen'; END IF;
END;
$test$;