CREATE TABLE public.customer_email_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES public.job_requests(id),
  assignment_id uuid REFERENCES public.job_assignments(id),
  template text NOT NULL,
  recipient text NOT NULL,
  from_address text NOT NULL,
  bcc text[],
  reply_to text,
  subject text NOT NULL,
  html text,
  text_body text,
  content_sha256 text NOT NULL,
  provider text NOT NULL DEFAULT 'resend',
  provider_message_id text,
  status text NOT NULL CHECK (status IN ('sent','failed')),
  error_message text,
  sent_at timestamptz,
  retention_until timestamptz NOT NULL DEFAULT (now() + interval '6 years'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
GRANT SELECT ON public.customer_email_snapshots TO authenticated;
GRANT ALL ON public.customer_email_snapshots TO service_role;
ALTER TABLE public.customer_email_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins lesen Kunden-Versandkopien" ON public.customer_email_snapshots
  FOR SELECT TO authenticated USING (public.is_admin_user(auth.uid()));
CREATE INDEX customer_email_snapshots_job_idx ON public.customer_email_snapshots(job_id, created_at);

CREATE OR REPLACE FUNCTION public.guard_customer_email_snapshot()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public','pg_temp' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF coalesce(auth.role(),'') <> 'service_role' AND current_user <> 'postgres' THEN
      RAISE EXCEPTION 'Versandkopien werden ausschließlich serverseitig angelegt' USING ERRCODE='42501';
    END IF;
    NEW.created_at := clock_timestamp();
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' AND OLD.retention_until < now() THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'Versandkopien sind unveränderlich' USING ERRCODE='42501';
END $$;
CREATE TRIGGER guard_customer_email_snapshot BEFORE INSERT OR UPDATE OR DELETE ON public.customer_email_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.guard_customer_email_snapshot();

CREATE OR REPLACE FUNCTION public.admin_job_customer_mails(_job_id uuid)
RETURNS TABLE(source text, id uuid, template text, recipient text, subject text, status text,
  sent_at timestamptz, provider_message_id text, html text, text_body text, content_sha256 text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
DECLARE j public.job_requests;
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN RAISE EXCEPTION 'forbidden' USING ERRCODE='42501'; END IF;
  SELECT * INTO j FROM public.job_requests WHERE job_requests.id = _job_id;
  IF NOT FOUND THEN RETURN; END IF;
  RETURN QUERY
    SELECT 'snapshot'::text, s.id, s.template, s.recipient, s.subject, s.status, s.sent_at,
           s.provider_message_id, s.html, s.text_body, s.content_sha256
      FROM public.customer_email_snapshots s WHERE s.job_id = _job_id
    UNION ALL
    SELECT 'log_ohne_inhalt'::text, e.id, e.template, e.recipient, e.subject, e.status, coalesce(e.sent_at, e.created_at),
           e.message_id, NULL::text, NULL::text, NULL::text
      FROM public.email_log e
     WHERE lower(e.recipient) = lower(j.customer_email)
       AND e.template IN ('customer_booking_confirmation','customer_assignment_notice','no_show_notice')
       AND (e.job_id = _job_id OR (e.job_id IS NULL AND e.template = 'customer_booking_confirmation'
            AND e.created_at BETWEEN j.created_at AND j.created_at + interval '10 minutes'))
       AND NOT EXISTS (SELECT 1 FROM public.customer_email_snapshots s
                        WHERE s.provider_message_id IS NOT NULL AND s.provider_message_id = e.message_id)
    ORDER BY 7;
END $$;
REVOKE ALL ON FUNCTION public.admin_job_customer_mails(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_job_customer_mails(uuid) TO authenticated;