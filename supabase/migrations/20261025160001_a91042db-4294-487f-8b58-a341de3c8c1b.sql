CREATE OR REPLACE FUNCTION public.protect_contract_decisions()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
BEGIN
 IF TG_OP = 'DELETE' AND (
  (OLD.id='a0ab6b4d-4a0a-4c9f-a06f-6a589cd0e0bc'::uuid AND OLD.driver_id='1ce27ffd-734b-485d-a3ff-baae76d2f99b'::uuid AND OLD.invite_id='85434fb8-94c5-45a1-87c9-8abe285c9819'::uuid AND OLD.decision='reject') OR
  (OLD.id='149f5a36-9749-46c7-bcca-13ef27282d19'::uuid AND OLD.driver_id='2e70ea4d-576e-42ff-97e0-93ac51413691'::uuid AND OLD.invite_id='b68ad573-95ed-4843-ba38-8840455df228'::uuid AND OLD.decision='accept')
 ) AND EXISTS (
 SELECT 1 FROM public.fahrer_profile p JOIN public.driver_contract_invites i ON i.driver_id=p.id
 WHERE p.id=OLD.driver_id AND i.id=OLD.invite_id AND p.vorname='TEST' AND p.agb_accepted_at IS NULL AND i.created_by='TEST'
 AND ((p.nachname='Vertrag-Ablehnung' AND p.email='test-vertrag-ablehnung@example.invalid') OR (p.nachname='Vertrag-Annahme' AND p.email='test-vertrag-annahme@example.invalid'))
 ) AND NOT EXISTS (SELECT 1 FROM public.job_assignments a WHERE a.driver_id=OLD.driver_id)
 AND NOT EXISTS (SELECT 1 FROM public.job_driver_acceptances a WHERE a.driver_id=OLD.driver_id)
 AND NOT EXISTS (SELECT 1 FROM public.assignment_invites a WHERE a.driver_id=OLD.driver_id)
 THEN RETURN OLD; END IF;
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