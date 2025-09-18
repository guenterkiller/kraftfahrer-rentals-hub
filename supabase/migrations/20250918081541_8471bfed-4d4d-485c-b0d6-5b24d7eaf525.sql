-- Fix the log_driver_profile_access function to use the correct table (admin_actions)
-- instead of the admin_log view which was causing the security scanner to flag it

CREATE OR REPLACE FUNCTION public.log_driver_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Log admin access to sensitive driver data
  -- Fixed: Use admin_actions table instead of admin_log view
  IF is_admin_user() AND TG_OP = 'SELECT' THEN
    INSERT INTO public.admin_actions (action, admin_email, note)
    VALUES (
      'ACCESSED_DRIVER_PROFILE',
      (SELECT admin_email FROM public.admin_settings LIMIT 1),
      'Driver profile ID: ' || COALESCE(NEW.id::text, OLD.id::text)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;