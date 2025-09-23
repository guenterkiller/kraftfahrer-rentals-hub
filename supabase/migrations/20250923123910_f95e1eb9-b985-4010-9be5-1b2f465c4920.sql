-- Add dedicated columns for BF2/BF3 permissions to fahrer_profile table
ALTER TABLE public.fahrer_profile 
ADD COLUMN bf2_erlaubnis boolean DEFAULT false,
ADD COLUMN bf3_erlaubnis boolean DEFAULT false,
ADD COLUMN spezialanforderungen text[] DEFAULT '{}';

-- Add comment to describe the new columns
COMMENT ON COLUMN public.fahrer_profile.bf2_erlaubnis IS 'BF2-Erlaubnis (Rundumkennleuchte) vorhanden';
COMMENT ON COLUMN public.fahrer_profile.bf3_erlaubnis IS 'BF3/BF4-Erlaubnis (Wechselverkehrszeichenanlage) vorhanden';  
COMMENT ON COLUMN public.fahrer_profile.spezialanforderungen IS 'Spezialanforderungen des Fahrers (was er hat/kann)';