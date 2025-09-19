-- Use 'cancelled' status which should be valid according to the function
UPDATE public.job_assignments
SET status = 'cancelled', 
    cancelled_at = now(),
    cancelled_reason = 'Test cleanup'
WHERE id = 'd8bc32b1-1632-4a7d-bd42-ce085938db67';