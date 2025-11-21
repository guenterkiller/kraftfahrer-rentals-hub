-- =====================================================
-- KRITISCHE SICHERHEITS-FIXES FÜR ADMIN-SYSTEM
-- =====================================================

-- 1. ENTFERNE ÖFFENTLICHEN LESEZUGRIFF AUF ADMIN_ACTIONS
DROP POLICY IF EXISTS "Allow public read admin actions" ON admin_actions;

-- 2. ENTFERNE HARDCODIERTE EMAIL-CHECKS UND NUTZE is_admin_user()
DROP POLICY IF EXISTS "Allow admin email to insert actions" ON admin_actions;
DROP POLICY IF EXISTS "Allow admin email to select actions" ON admin_actions;

-- Stelle sicher dass nur die is_admin_user() Policies aktiv sind
-- (diese existieren bereits: admin_actions_admin_insert, admin_actions_admin_select)

-- 3. FIXE ADMIN_SESSIONS: Füge DELETE-Policy hinzu
CREATE POLICY "Users can delete own sessions"
ON admin_sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any session"
ON admin_sessions
FOR DELETE
TO authenticated
USING (is_admin_user());

-- 4. SCHÜTZE BACKUP-TABELLEN (falls sie Daten erhalten)
-- Diese Policies existieren bereits, aber wir stellen sicher dass sie aktiv sind
ALTER TABLE _backup_admin_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE _backup_job_mail_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE _backup_mail_log ENABLE ROW LEVEL SECURITY;

-- 5. FÜGE RATE-LIMITING-VORBEREITUNG FÜR JOB-ALARM HINZU
-- Erstelle Policy die nur Inserts mit gültigen Emails erlaubt
DROP POLICY IF EXISTS "Anyone can subscribe to job alerts" ON jobalarm_fahrer;

CREATE POLICY "Valid emails can subscribe to job alerts"
ON jobalarm_fahrer
FOR INSERT
WITH CHECK (
  email IS NOT NULL 
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND LENGTH(email) <= 255
);

-- 6. SCHÜTZE JOB-ANTWORTEN
CREATE POLICY "Public can submit job responses"
ON jobalarm_antworten
FOR INSERT
WITH CHECK (
  fahrer_email IS NOT NULL
  AND fahrer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND antwort IS NOT NULL
  AND LENGTH(antwort) <= 5000
);

-- Log die Security-Verbesserungen
INSERT INTO admin_actions (action, admin_email, note)
VALUES (
  'security_hardening',
  (SELECT admin_email FROM admin_settings LIMIT 1),
  'Entfernt: Öffentliche Admin-Logs, Hardcodierte Emails. Hinzugefügt: Session-Löschung, Email-Validierung'
);