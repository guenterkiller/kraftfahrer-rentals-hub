-- Admin-Rolle sicherstellen für guenter.killer@t-online.de
WITH u AS (
  SELECT id FROM auth.users WHERE lower(email)=lower('guenter.killer@t-online.de')
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM u
ON CONFLICT DO NOTHING;