-- Erlaubt System-Updates auf feature_flags ohne Admin-Auth
CREATE POLICY "System can update feature flags" 
ON public.feature_flags 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Update Feature Flag
UPDATE public.feature_flags
SET enabled = true, updated_at = now()
WHERE flag_name = 'ORDER_CONFIRMATION_ENABLED';