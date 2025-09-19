-- Set admin context and cancel assignment using service role
SELECT set_config('request.jwt.claims', '{"sub": "' || (SELECT admin_email FROM admin_settings LIMIT 1) || '", "role": "service_role"}', true);

-- Cancel assignment directly with proper status
UPDATE public.job_assignments
SET status = 'declined', 
    cancelled_at = now(),
    cancelled_reason = 'Test cleanup'
WHERE id = 'd8bc32b1-1632-4a7d-bd42-ce085938db67';