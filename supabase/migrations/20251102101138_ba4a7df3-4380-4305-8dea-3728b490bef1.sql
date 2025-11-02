-- Tabelle für Token-basierte Einladungen
CREATE TABLE IF NOT EXISTS assignment_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES fahrer_profile(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','expired')),
  token TEXT NOT NULL UNIQUE,
  token_expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  user_agent TEXT,
  ip INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_assignment_invites_job ON assignment_invites(job_id);
CREATE INDEX IF NOT EXISTS idx_assignment_invites_driver ON assignment_invites(driver_id);
CREATE INDEX IF NOT EXISTS idx_assignment_invites_status ON assignment_invites(status);
CREATE INDEX IF NOT EXISTS idx_assignment_invites_token ON assignment_invites(token);

-- RLS für assignment_invites (Admin-only)
ALTER TABLE assignment_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invites"
ON assignment_invites
FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Idempotente RPC-Funktion für job_assignments
CREATE OR REPLACE FUNCTION ensure_job_assignment(p_job_id UUID, p_driver_id UUID)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prüfe ob Assignment bereits existiert
  IF EXISTS (
    SELECT 1 FROM job_assignments ja
    WHERE ja.job_id = p_job_id AND ja.driver_id = p_driver_id
  ) THEN
    -- Update bestehende Assignment auf accepted
    UPDATE job_assignments
    SET status = 'assigned',
        updated_at = now()
    WHERE job_id = p_job_id 
      AND driver_id = p_driver_id;
  ELSE
    -- Erstelle neues Assignment
    INSERT INTO job_assignments (
      id, 
      job_id, 
      driver_id, 
      status, 
      assigned_at,
      rate_type,
      rate_value,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(), 
      p_job_id, 
      p_driver_id, 
      'assigned', 
      now(),
      'daily',
      399,
      now(),
      now()
    );
  END IF;
  
  -- Update Job-Status falls noch open
  UPDATE job_requests
  SET status = 'assigned',
      updated_at = now()
  WHERE id = p_job_id
    AND status = 'open';
END $$;