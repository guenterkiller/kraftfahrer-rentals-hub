-- Fix sent_at for jobs that were already sent to drivers (based on email_log or assignment_invites)
UPDATE job_requests 
SET sent_at = COALESCE(
  (SELECT MIN(created_at) FROM assignment_invites WHERE job_id = job_requests.id),
  (SELECT MIN(created_at) FROM email_log WHERE job_id = job_requests.id AND template LIKE '%job%'),
  created_at
)
WHERE sent_at IS NULL 
  AND status NOT IN ('open', 'pending')
  AND id IN (
    SELECT DISTINCT job_id FROM assignment_invites
    UNION
    SELECT DISTINCT job_id FROM email_log WHERE template LIKE '%job%'
  );

-- Also fix Jakubin jobs specifically (known to be sent)
UPDATE job_requests 
SET sent_at = created_at 
WHERE customer_email = 'andreas.jakubin@jost-world.com' 
  AND sent_at IS NULL;