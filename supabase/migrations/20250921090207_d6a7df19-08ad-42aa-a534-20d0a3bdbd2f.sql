-- Behebe nur KRITISCHE Sicherheitslücken ohne Systemschäden

-- 1. Sichere Customer Contact Information (Job Requests)
-- Entferne die zu offene Policy und ersetze durch restriktivere
DROP POLICY IF EXISTS "Admins can update job contact data via frontend" ON public.job_requests;

-- Erstelle restriktivere Policy nur für echte Admin-Updates
CREATE POLICY "Admins can update job contact data securely" 
ON public.job_requests 
FOR UPDATE 
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- 2. Sichere Driver Personal Information (Fahrer Profile)
-- Bereits vorhandene Policy ist sicher, aber stelle sicher dass keine Lecks existieren
-- Keine Änderungen nötig - die bestehenden Policies sind bereits restriktiv

-- 3. Behebe letzte Function Search Path Probleme
-- Prüfe und korrigiere alle verbleibenden Funktionen ohne SET search_path

-- Aktualisiere enforce_assignment_transitions trigger function
CREATE OR REPLACE FUNCTION public.enforce_assignment_transitions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status NOT IN ('assigned','confirmed','cancelled','no_show') THEN
      RAISE EXCEPTION 'invalid status %', NEW.status;
    END IF;

    IF NEW.status = 'confirmed' AND OLD.status <> 'assigned' THEN
      RAISE EXCEPTION 'confirm allowed only from status=assigned';
    END IF;
    IF NEW.status = 'confirmed' AND NEW.confirmed_by_admin IS NOT TRUE THEN
      RAISE EXCEPTION 'confirmed_by_admin must be true';
    END IF;
    IF NEW.status = 'confirmed' AND NEW.confirmed_at IS NULL THEN
      NEW.confirmed_at := now();
    END IF;

    IF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
      NEW.cancelled_at := now();
    END IF;

    IF NEW.status = 'no_show' AND NEW.no_show_at IS NULL THEN
      NEW.no_show_at := now();
    END IF;
  END IF;
  RETURN NEW;
END $function$;