-- Remove the permissive INSERT policy that allows anyone to insert
DROP POLICY IF EXISTS "job_driver_acceptances_system_insert" ON public.job_driver_acceptances;

-- The admin policy already covers all operations for admins
-- Edge functions use service_role which bypasses RLS entirely
-- So no new policy needed - service_role can still insert