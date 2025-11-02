-- Optional: One-Shot-Schutz für assignment_invites
-- Verhindert doppelte Admin-Mails bei mehrfachem Klick

ALTER TABLE assignment_invites 
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

COMMENT ON COLUMN assignment_invites.responded_at IS 'Zeitstempel der ersten Antwort - verhindert Doppel-Klicks';