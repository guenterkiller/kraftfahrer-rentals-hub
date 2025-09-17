-- Reset Günter Killers Fahreranfrage zurück auf "open"
UPDATE job_requests 
SET status = 'open', updated_at = now() 
WHERE id = '55ff1240-9f67-4b0c-8ff3-c8994fea36fb';

-- Entferne zugehörige Job-Assignments falls vorhanden
DELETE FROM job_assignments 
WHERE job_id = '55ff1240-9f67-4b0c-8ff3-c8994fea36fb';

-- Log die Admin-Aktion
INSERT INTO admin_actions (action, job_id, admin_email, note)
VALUES ('reset_job_to_open', '55ff1240-9f67-4b0c-8ff3-c8994fea36fb', 'guenter.killer@t-online.de', 'Fahreranfrage von Günter Killer wieder auf offen geschaltet für erneute Prüfung');