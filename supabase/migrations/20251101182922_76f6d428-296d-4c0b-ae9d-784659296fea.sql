-- Migrate all drivers with status 'active' to 'approved'
-- This unifies the driver approval system to use only 'approved' status

UPDATE fahrer_profile 
SET status = 'approved' 
WHERE status = 'active';

-- Add comment for documentation
COMMENT ON COLUMN fahrer_profile.status IS 'Driver status: pending (awaiting approval), approved (ready to receive jobs), rejected (not qualified)';