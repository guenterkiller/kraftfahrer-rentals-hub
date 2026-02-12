-- Fix: Set existing assignment to 'confirmed' since email was already sent
UPDATE public.job_assignments 
SET status = 'confirmed', confirmed_by_admin = true, confirmed_at = now()
WHERE id = 'c6dcc763-ac42-4941-9ae7-a9ac37dcf90f' 
  AND status = 'assigned';