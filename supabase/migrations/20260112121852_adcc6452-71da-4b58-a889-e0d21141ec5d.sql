
-- ============================================================
-- Storage Bucket Hardening: fahrer-dokumente
-- Limit file types to pdf, jpg, jpeg, png and max 5MB
-- ============================================================

UPDATE storage.buckets
SET 
  file_size_limit = 5242880,  -- 5 MB in bytes
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]
WHERE id = 'fahrer-dokumente';

-- Also update driver-documents bucket if used
UPDATE storage.buckets
SET 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]
WHERE id = 'driver-documents';

-- Confirmations bucket: only PDFs needed
UPDATE storage.buckets
SET 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf']::text[]
WHERE id = 'confirmations';
