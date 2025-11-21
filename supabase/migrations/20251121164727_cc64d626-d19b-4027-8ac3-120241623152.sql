-- Reset admin password to match ADMIN_SECRET_PASSWORD
UPDATE auth.users 
SET encrypted_password = crypt('{{ADMIN_SECRET_PASSWORD}}', gen_salt('bf'))
WHERE email = 'guenter.killer@t-online.de';