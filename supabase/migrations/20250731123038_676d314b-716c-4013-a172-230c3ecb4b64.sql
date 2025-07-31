-- Create storage bucket for driver documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('driver-documents', 'driver-documents', false);

-- Create policy for authenticated users to upload files
CREATE POLICY "Authenticated users can upload driver documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'driver-documents' 
  AND auth.uid() IS NOT NULL
);

-- Create policy for authenticated users to view their own files
CREATE POLICY "Users can view their own driver documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'driver-documents' 
  AND auth.uid() IS NOT NULL
);

-- Create policy for authenticated users to update their own files
CREATE POLICY "Users can update their own driver documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'driver-documents' 
  AND auth.uid() IS NOT NULL
);

-- Create policy for authenticated users to delete their own files
CREATE POLICY "Users can delete their own driver documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'driver-documents' 
  AND auth.uid() IS NOT NULL
);