-- Sicheres Löschen des alten Storage-Buckets "driver-documents"
-- Keine Änderungen an Policies oder anderen Buckets

-- 1. Alle Dateien im Bucket löschen
DELETE FROM storage.objects 
WHERE bucket_id = 'driver-documents';

-- 2. Bucket selbst löschen
DELETE FROM storage.buckets 
WHERE id = 'driver-documents';