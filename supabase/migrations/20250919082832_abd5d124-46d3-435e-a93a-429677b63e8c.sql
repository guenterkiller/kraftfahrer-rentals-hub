-- Cancel the active assignment for test job
UPDATE public.job_assignments
SET status = 'cancelled', cancelled_at = now()
WHERE id = 'd8bc32b1-1632-4a7d-bd42-ce085938db67';