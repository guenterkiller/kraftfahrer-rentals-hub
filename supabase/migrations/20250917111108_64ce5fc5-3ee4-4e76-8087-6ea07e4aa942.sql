-- Setze Günter Killers Anfrage zurück auf "open" für Tests
UPDATE job_requests 
SET status = 'open', updated_at = now() 
WHERE id = '55ff1240-9f67-4b0c-8ff3-c8994fea36fb' 
  AND customer_name = 'Günter Killer';

-- Entferne auch eventuell zugehörige Assignments für saubere Tests
DELETE FROM job_assignments 
WHERE job_id = '55ff1240-9f67-4b0c-8ff3-c8994fea36fb';