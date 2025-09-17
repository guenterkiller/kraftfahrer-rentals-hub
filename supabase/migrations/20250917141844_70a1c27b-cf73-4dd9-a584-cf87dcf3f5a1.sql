-- Korrigiere Günter Killers Job-Request: Entferne Platzhalter
UPDATE job_requests 
SET company = NULL, updated_at = now()
WHERE id = '55ff1240-9f67-4b0c-8ff3-c8994fea36fb' 
  AND company = 'Bitte wählen';

-- Log die Korrektur
INSERT INTO admin_actions (action, job_id, admin_email, note)
VALUES ('fix_placeholder_company', '55ff1240-9f67-4b0c-8ff3-c8994fea36fb', 'guenter.killer@t-online.de', 'Entfernt Platzhalter "Bitte wählen" aus company Feld');