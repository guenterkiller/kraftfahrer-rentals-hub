-- Feature flags to disable old flows
INSERT INTO public.feature_flags (flag_name, enabled, description)
VALUES 
  ('DRIVER_RESPONSE_ENABLED', false, 'Disable legacy driver self-response flow'),
  ('JOB_BROADCAST_ENABLED', false, 'Disable broadcasting jobs to drivers')
ON CONFLICT (flag_name) DO UPDATE SET 
  enabled = EXCLUDED.enabled, 
  description = EXCLUDED.description;