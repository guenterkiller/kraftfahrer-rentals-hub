-- Eindeutigkeit sicherstellen (für ON CONFLICT)
create unique index if not exists user_roles_user_id_key
  on public.user_roles(user_id);

-- Admin-Rolle für den bestehenden Account setzen (per E-Mail auflösen)
insert into public.user_roles (user_id, role)
select u.id, 'admin'
from auth.users u
where u.email = 'guenter.killer@t-online.de'
on conflict (user_id) do update set role = excluded.role;

-- RLS aktiv lassen; Leserechte für eigenen Datensatz (falls nicht vorhanden)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='user_roles' and policyname='read own role'
  ) then
    create policy "read own role"
    on public.user_roles
    for select
    using (auth.uid() = user_id);
  end if;
end $$;