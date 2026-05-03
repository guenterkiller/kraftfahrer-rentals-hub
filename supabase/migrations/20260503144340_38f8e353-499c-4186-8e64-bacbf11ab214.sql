
-- 1) assignment_invites: redundante "true"-Policies entfernen
-- service_role umgeht RLS standardmäßig, daher sind die Policies nicht nötig.
DROP POLICY IF EXISTS assignment_invites_service_insert ON public.assignment_invites;
DROP POLICY IF EXISTS assignment_invites_service_update ON public.assignment_invites;

-- 2) Ungenutzte Debug-Funktion entfernen
DROP FUNCTION IF EXISTS public.debug_echo_ids(uuid, uuid);

-- 3) EXECUTE-Rechte entziehen für interne Funktionen
REVOKE EXECUTE ON FUNCTION public.ensure_job_assignment(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.log_job_mail(uuid, uuid, text, text, text, text, text, text, jsonb, jsonb) FROM anon, authenticated, public;

-- 4) EXECUTE-Rechte entziehen für admin_* Funktionen (interne is_admin_user-Checks bleiben)
REVOKE EXECUTE ON FUNCTION public.admin_assign_driver(uuid, uuid, text, numeric, date, date, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_confirm_assignment(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_cancel_assignment(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_mark_no_show(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_mark_no_show(uuid, text, numeric) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_get_job(uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_update_job_contact(uuid, text, text, text, text, text, text, text, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_reset_jobs_by_email(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.admin_mark_old_jobs_completed(integer) FROM anon, authenticated, public;
