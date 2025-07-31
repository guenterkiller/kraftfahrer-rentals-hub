-- Add dokumente column to fahrer_profile table to store uploaded file paths
ALTER TABLE public.fahrer_profile 
ADD COLUMN dokumente JSONB DEFAULT '{}';

-- Add comment to explain the column
COMMENT ON COLUMN public.fahrer_profile.dokumente IS 'Stores uploaded document file paths as JSON object with keys like fuehrerschein, fahrerkarte, zertifikate';