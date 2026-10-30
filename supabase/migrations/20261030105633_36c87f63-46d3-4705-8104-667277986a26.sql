DO $$ DECLARE definition text; BEGIN
 SELECT pg_get_functiondef('public.admin_update_job_contact(uuid,text,text,text,text,text,text,text,text)'::regprocedure) INTO definition;
 IF position('customer_name        = NULLIF(_firma_oder_name' in definition)=0 THEN RAISE EXCEPTION 'Unerwartete Kontaktfunktion'; END IF;
 definition:=replace(definition,'customer_name        = NULLIF(_firma_oder_name','customer_name        = NULLIF(_ansprechpartner');
 EXECUTE definition;
END $$;