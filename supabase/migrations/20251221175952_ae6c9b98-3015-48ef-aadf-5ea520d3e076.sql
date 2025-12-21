-- Fix sent_at for Moritt job (was already sent to 15 drivers)
UPDATE job_requests 
SET sent_at = (SELECT MIN(created_at) FROM assignment_invites WHERE job_id = job_requests.id)
WHERE id = '9a5142c1-575a-41be-b105-af7ca2810315' 
  AND sent_at IS NULL;