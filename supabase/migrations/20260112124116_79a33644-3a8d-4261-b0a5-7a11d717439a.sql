-- Bucket-Limit zurück auf 5 MB setzen
UPDATE storage.buckets
SET file_size_limit = 5242880  -- 5 MB
WHERE id = 'fahrer-dokumente';