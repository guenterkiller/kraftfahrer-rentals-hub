-- Fix inconsistent job status for LOHMANN job
-- Job has active assignment but status is still 'open' instead of 'assigned'

UPDATE job_requests 
SET status = 'assigned', updated_at = now()
WHERE id = '35519b25-af86-4e76-9379-572261f38669' 
AND EXISTS (
  SELECT 1 FROM job_assignments 
  WHERE job_id = '35519b25-af86-4e76-9379-572261f38669' 
  AND status = 'assigned'
);

-- Add a check to prevent future inconsistencies
-- Create a function to maintain job status consistency
CREATE OR REPLACE FUNCTION public.maintain_job_status_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- When an assignment is created or updated, update the job status accordingly
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.status = 'assigned' THEN
      UPDATE job_requests 
      SET status = 'assigned', updated_at = now()
      WHERE id = NEW.job_id AND status = 'open';
    ELSIF NEW.status = 'confirmed' THEN
      UPDATE job_requests 
      SET status = 'confirmed', updated_at = now()
      WHERE id = NEW.job_id;
    ELSIF NEW.status IN ('cancelled', 'no_show') THEN
      -- When assignment is cancelled/no-show, check if job should go back to open
      UPDATE job_requests 
      SET status = 'open', updated_at = now()
      WHERE id = NEW.job_id 
      AND NOT EXISTS (
        SELECT 1 FROM job_assignments 
        WHERE job_id = NEW.job_id 
        AND status IN ('assigned', 'confirmed')
        AND id != NEW.id
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;