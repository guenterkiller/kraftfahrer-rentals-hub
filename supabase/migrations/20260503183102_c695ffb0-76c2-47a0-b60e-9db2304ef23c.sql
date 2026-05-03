UPDATE public.job_assignments
SET status = 'cancelled',
    cancelled_at = COALESCE(cancelled_at, now()),
    cancelled_reason = COALESCE(cancelled_reason, 'Automatisch durch früheren respond-invite Flow erstellt – manuell aufgelöst.'),
    updated_at = now()
WHERE id = 'a29593c6-0615-4589-a255-7e96b5e9e3e2';

UPDATE public.job_requests
SET status = 'open',
    updated_at = now()
WHERE id = (SELECT job_id FROM public.job_assignments WHERE id = 'a29593c6-0615-4589-a255-7e96b5e9e3e2')
  AND status IN ('assigned','confirmed','no_show');

INSERT INTO public.admin_actions (action, job_id, assignment_id, admin_email, note)
SELECT 'auto_assignment_cancelled',
       ja.job_id,
       ja.id,
       'system',
       'Zuweisung aufgelöst: war automatisch durch früheren respond-invite Flow entstanden. Job wieder auf open gesetzt.'
FROM public.job_assignments ja
WHERE ja.id = 'a29593c6-0615-4589-a255-7e96b5e9e3e2';