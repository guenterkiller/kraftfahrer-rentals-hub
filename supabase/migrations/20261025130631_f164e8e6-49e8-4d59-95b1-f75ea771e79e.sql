CREATE TABLE public.driver_contract_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.fahrer_profile(id),
  token text NOT NULL UNIQUE,
  contract_version text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.driver_contract_invites(driver_id);
GRANT SELECT ON public.driver_contract_invites TO authenticated;
GRANT ALL ON public.driver_contract_invites TO service_role;
ALTER TABLE public.driver_contract_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read contract invites" ON public.driver_contract_invites
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

CREATE TABLE public.driver_contract_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.fahrer_profile(id),
  invite_id uuid REFERENCES public.driver_contract_invites(id),
  decision text NOT NULL CHECK (decision IN ('accept','reject')),
  contract_version text NOT NULL,
  contract_text text NOT NULL,
  consent_text text NOT NULL,
  content_hash text NOT NULL,
  ip inet,
  user_agent text,
  decided_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (driver_id, contract_version)
);
GRANT SELECT ON public.driver_contract_decisions TO authenticated;
GRANT ALL ON public.driver_contract_decisions TO service_role;
ALTER TABLE public.driver_contract_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read contract decisions" ON public.driver_contract_decisions
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));

CREATE OR REPLACE FUNCTION public.protect_contract_decisions()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Vertragsentscheidungen sind unveränderlich';
END;
$$;
CREATE TRIGGER protect_contract_decisions_trg
  BEFORE UPDATE OR DELETE ON public.driver_contract_decisions
  FOR EACH ROW EXECUTE FUNCTION public.protect_contract_decisions();

INSERT INTO public.feature_flags (flag_name, enabled, description)
SELECT 'driver_contract_required', false, 'Angebote/Freischaltung nur nach angenommenem Vermittlungsvertrag (Stichtagsschalter)'
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags WHERE flag_name = 'driver_contract_required');