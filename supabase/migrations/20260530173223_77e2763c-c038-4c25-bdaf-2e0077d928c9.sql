-- 1) Tarif-Spalten an job_requests
ALTER TABLE public.job_requests
  ADD COLUMN IF NOT EXISTS tarif_type text,
  ADD COLUMN IF NOT EXISTS tarif_label text,
  ADD COLUMN IF NOT EXISTS tarif_netto numeric,
  ADD COLUMN IF NOT EXISTS tarif_unit text;

-- 2) Tabelle job_attachments
CREATE TABLE IF NOT EXISTS public.job_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  filename text NOT NULL,
  filepath text NOT NULL,
  mime_type text,
  size_bytes integer,
  uploaded_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_attachments_job_id ON public.job_attachments(job_id);

GRANT SELECT, INSERT, DELETE ON public.job_attachments TO authenticated;
GRANT ALL ON public.job_attachments TO service_role;

ALTER TABLE public.job_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_attachments_admin_select"
  ON public.job_attachments FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "job_attachments_admin_insert"
  ON public.job_attachments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "job_attachments_admin_delete"
  ON public.job_attachments FOR DELETE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- 3) Privater Storage-Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-attachments', 'job-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS-Policies: nur Admins
CREATE POLICY "job_attachments_storage_admin_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'job-attachments' AND public.is_admin_user(auth.uid()));

CREATE POLICY "job_attachments_storage_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'job-attachments' AND public.is_admin_user(auth.uid()));

CREATE POLICY "job_attachments_storage_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'job-attachments' AND public.is_admin_user(auth.uid()));