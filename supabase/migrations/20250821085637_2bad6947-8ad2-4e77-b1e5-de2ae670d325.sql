-- Secure the admin summary view so only admins can access any rows
-- and ensure underlying table RLS is enforced via SECURITY INVOKER.

create or replace view public.fahrer_profile_admin_summary
with (security_invoker = true, security_barrier = true)
as
select
  fp.id,
  fp.vorname,
  fp.nachname,
  fp.email as email_display,
  fp.telefon as telefon_display,
  fp.ort,
  fp.fuehrerscheinklassen,
  fp.spezialisierungen,
  fp.verfuegbare_regionen,
  fp.erfahrung_jahre,
  fp.stundensatz,
  fp.status,
  fp.created_at,
  fp.updated_at
from public.fahrer_profile fp
where public.is_admin_user();

comment on view public.fahrer_profile_admin_summary is
  'Admin-only summary. SECURITY INVOKER + SECURITY BARRIER; rows restricted by WHERE is_admin_user() and underlying fahrer_profile RLS.';