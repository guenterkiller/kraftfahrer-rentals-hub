-- Security Fix: Restrict public access to customer and driver data
-- Only admins should be able to read sensitive data

-- 1. Fix job_requests table policies
-- Drop existing public policies
DROP POLICY IF EXISTS "Anyone can update job request status" ON public.job_requests;
DROP POLICY IF EXISTS "Anyone can view job requests" ON public.job_requests;

-- Create admin-only policies for job_requests
CREATE POLICY "Admin can view all job requests"
ON public.job_requests
FOR SELECT
USING (auth.uid() = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid);

CREATE POLICY "Admin can update job requests"
ON public.job_requests  
FOR UPDATE
USING (auth.uid() = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid);

-- 2. Fix jobalarm_fahrer table policies
-- Drop existing public policies
DROP POLICY IF EXISTS "Users can view job alert subscriptions" ON public.jobalarm_fahrer;

-- Create admin-only policy for jobalarm_fahrer
CREATE POLICY "Admin can view job alert subscriptions"
ON public.jobalarm_fahrer
FOR SELECT
USING (auth.uid() = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid);

-- 3. Fix jobalarm_antworten table policies  
-- Drop existing public policies
DROP POLICY IF EXISTS "Anyone can view driver responses" ON public.jobalarm_antworten;

-- Create admin-only policy for jobalarm_antworten
CREATE POLICY "Admin can view driver responses"
ON public.jobalarm_antworten
FOR SELECT
USING (auth.uid() = '484619ca-9411-4c71-bab2-2ba666b1ea1b'::uuid);

-- 4. Fix function search paths
-- Update update_updated_at_column function with fixed search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$function$;

-- Update is_admin function with fixed search path
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = user_uuid AND ur.role = 'admin'
  );
$function$;