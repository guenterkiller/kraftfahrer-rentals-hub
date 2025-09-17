-- ================================
-- SECURITY HOTFIX (RLS & Policies)
-- ================================

-- Hilfsfunktion für Admin-Erkennung (falls noch nicht vorhanden)
create or replace function public.is_admin_user()
returns boolean
language sql stable
as $$
  select (coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::json->>'role') = 'admin';
$$;

-- 1) job_assignments absichern
alter table public.job_assignments enable row level security;

-- alte/unsichere Policies entfernen (so viele Namen wie möglich abdecken)
drop policy if exists "Public can create job responses"     on public.job_assignments;
drop policy if exists "Public can update job responses"     on public.job_assignments;
drop policy if exists "Public can view specific assignments" on public.job_assignments;
drop policy if exists "Restricted assignment updates"       on public.job_assignments;
drop policy if exists "Admin and service can create assignments" on public.job_assignments;
drop policy if exists "Admin can view all assignments"      on public.job_assignments;
drop policy if exists "Admin can delete assignments"        on public.job_assignments;
drop policy if exists "job_assignments_insert_service"      on public.job_assignments;
drop policy if exists "job_assignments_select_admin"        on public.job_assignments;
drop policy if exists "job_assignments_update_restricted"   on public.job_assignments;
drop policy if exists "job_assignments_delete_admin"        on public.job_assignments;

-- sichere Policies neu setzen
-- SELECT: nur Admin (Edge Functions mit service_role umgehen RLS ohnehin)
create policy job_assignments_admin_select
  on public.job_assignments
  for select
  using ( public.is_admin_user() );

-- INSERT: Admin oder service_role (für Systemanlage über Edge Functions)
create policy job_assignments_admin_service_insert
  on public.job_assignments
  for insert
  with check ( public.is_admin_user() or current_setting('role', true) = 'service_role' );

-- UPDATE: Admin oder service_role (für Status-Update durch Edge Function)
create policy job_assignments_admin_service_update
  on public.job_assignments
  for update
  using ( public.is_admin_user() or current_setting('role', true) = 'service_role' )
  with check ( public.is_admin_user() or current_setting('role', true) = 'service_role' );

-- DELETE: nur Admin
create policy job_assignments_admin_delete
  on public.job_assignments
  for delete
  using ( public.is_admin_user() );

-- 2) feature_flags absichern
alter table public.feature_flags enable row level security;

-- evtl. vorhandene unsichere Policies entfernen
drop policy if exists "Public can update feature flags" on public.feature_flags;
drop policy if exists "System can update feature flags" on public.feature_flags;
drop policy if exists "Anyone can update feature flags" on public.feature_flags;
drop policy if exists "Feature flags public update"     on public.feature_flags;
drop policy if exists "Admins can manage feature flags" on public.feature_flags;

-- sichere Policies setzen: Änderungen nur durch Admin
create policy feature_flags_admin_select
  on public.feature_flags
  for select
  using ( public.is_admin_user() );

create policy feature_flags_admin_insert
  on public.feature_flags
  for insert
  with check ( public.is_admin_user() );

create policy feature_flags_admin_update
  on public.feature_flags
  for update
  using ( public.is_admin_user() )
  with check ( public.is_admin_user() );

create policy feature_flags_admin_delete
  on public.feature_flags
  for delete
  using ( public.is_admin_user() );