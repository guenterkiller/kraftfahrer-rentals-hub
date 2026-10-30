ALTER TABLE public.assignment_invites ADD COLUMN offer_snapshot jsonb;

CREATE FUNCTION public.binding_offer_source(_job_id uuid, _assignment_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT jsonb_build_object('version',1,'job',to_jsonb(j) - ARRAY['customer_confirmation_given','customer_confirmation_at','customer_terms_version','customer_confirmation_text','customer_terms_text','customer_invoice_id','subcontractor_invoice_id','customer_invoice_status','subcontractor_invoice_status','payout_status'], 'assignment', jsonb_build_object('id',a.id,'job_id',a.job_id,'driver_id',a.driver_id,'rate_type',a.rate_type,'rate_value',a.rate_value,'start_date',a.start_date,'end_date',a.end_date,'times_entered',a.times_entered,'commission_pct',a.commission_pct)) FROM public.job_requests j JOIN public.job_assignments a ON a.job_id=j.id WHERE j.id=_job_id AND a.id=_assignment_id
$$;
REVOKE ALL ON FUNCTION public.binding_offer_source(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.binding_offer_source(uuid,uuid) TO service_role;

UPDATE public.assignment_invites SET offer_snapshot=public.binding_offer_source(job_id,assignment_id) WHERE purpose='binding' AND assignment_id IS NOT NULL;

CREATE FUNCTION public.guard_binding_offer_snapshot() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW.offer_snapshot IS DISTINCT FROM OLD.offer_snapshot THEN RAISE EXCEPTION 'Die Angebotskopie darf nicht geändert oder nachgetragen werden'; END IF;
  IF OLD.offer_snapshot IS NOT NULL AND (NEW.job_id IS DISTINCT FROM OLD.job_id OR NEW.driver_id IS DISTINCT FROM OLD.driver_id OR NEW.purpose IS DISTINCT FROM OLD.purpose) THEN RAISE EXCEPTION 'Die Zuordnung der Angebotskopie ist unveränderlich'; END IF;
  RETURN NEW;
 END IF;
 IF NEW.purpose='binding' AND NEW.assignment_id IS NOT NULL THEN
  IF NEW.offer_snapshot IS NULL THEN NEW.offer_snapshot:=public.binding_offer_source(NEW.job_id,NEW.assignment_id);
  ELSIF coalesce(auth.role(),'') <> 'service_role' THEN RAISE EXCEPTION 'Angebotskopien werden ausschließlich serverseitig angelegt'; END IF;
 ELSIF NEW.offer_snapshot IS NOT NULL THEN RAISE EXCEPTION 'Angebotskopie nur für verbindliche Angebote';
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_binding_offer_snapshot() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_binding_offer_snapshot BEFORE INSERT OR UPDATE ON public.assignment_invites FOR EACH ROW EXECUTE FUNCTION public.guard_binding_offer_snapshot();