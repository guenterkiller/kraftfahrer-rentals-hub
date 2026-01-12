-- Temporär 10 MB Limit für fahrer-dokumente setzen (für Migration der großen Datei)
UPDATE storage.buckets
SET file_size_limit = 10485760  -- 10 MB
WHERE id = 'fahrer-dokumente';