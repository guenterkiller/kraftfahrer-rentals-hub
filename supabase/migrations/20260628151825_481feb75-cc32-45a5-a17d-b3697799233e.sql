-- Fix: Mehrdeutiger Aufruf von is_admin_user() in admin_cancel_assignment
-- Es existieren zwei Varianten:
--   public.is_admin_user()           -- ohne Parameter
--   public.is_admin_user(uuid DEFAULT auth.uid())  -- mit Default
-- Ein parameterloser Aufruf is_admin_user() ist daher mehrdeutig.
-- Lösung: Aufruf eindeutig mit auth.uid() qualifizieren.
-- Sicherheit bleibt vollständig erhalten (interne Admin-Prüfung aktiv).

CREATE OR REPLACE FUNCTION public.admin_cancel_assignment(_assignment_id uuid, _reason text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.job_assignments
     SET status = 'cancelled',
         cancelled_at = now(),
         cancelled_reason = _reason
   WHERE id = _assignment_id;

  RETURN FOUND;
END
$function$;