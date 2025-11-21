import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('ensure-admin-user: request received');

    const { email, password } = await req.json();
    const ADMIN_EMAIL = 'guenter.killer@t-online.de';

    if (!email || !password) {
      console.log('ensure-admin-user: missing email or password');
      return new Response(
        JSON.stringify({ success: false, error: 'E-Mail und Passwort sind erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (email.toLowerCase() !== ADMIN_EMAIL) {
      console.log('ensure-admin-user: email does not match admin email');
      return new Response(
        JSON.stringify({ success: false, error: 'Ungültige Anmeldedaten' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('ensure-admin-user: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
      return new Response(
        JSON.stringify({ success: false, error: 'Serverkonfiguration fehlt' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Versuche User anzulegen - falls er existiert, ist das OK
    console.log('ensure-admin-user: attempting to create admin user');
    const { data: createdUserData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password,
      email_confirm: true,
    });

    let userId: string | undefined;

    if (createUserError) {
      // User könnte bereits existieren - versuche ihn via listUsers zu finden
      console.log('ensure-admin-user: create failed (user may exist), error:', createUserError.message);
      
      const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('ensure-admin-user: error listing users:', listError.message);
        return new Response(
          JSON.stringify({ success: false, error: 'Benutzersuche fehlgeschlagen' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === ADMIN_EMAIL);
      if (existingUser) {
        userId = existingUser.id;
        console.log('ensure-admin-user: found existing user with id', userId);
      } else {
        console.error('ensure-admin-user: user creation failed and user not found');
        return new Response(
          JSON.stringify({ success: false, error: 'Admin-Benutzer konnte nicht erstellt oder gefunden werden' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (createdUserData?.user) {
      userId = createdUserData.user.id;
      console.log('ensure-admin-user: admin user created with id', userId);
    }

    if (!userId) {
      console.error('ensure-admin-user: userId is missing after create/find');
      return new Response(
        JSON.stringify({ success: false, error: 'Admin-Benutzer-ID fehlt' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error('ensure-admin-user: error checking user_roles:', roleError.message);
    }

    if (!roleData) {
      console.log('ensure-admin-user: inserting admin role into user_roles');
      const { error: insertRoleError } = await supabaseAdmin.from('user_roles').insert({
        user_id: userId,
        role: 'admin',
      });

      if (insertRoleError) {
        console.error('ensure-admin-user: error inserting admin role:', insertRoleError.message);
        return new Response(
          JSON.stringify({ success: false, error: 'Admin-Rolle konnte nicht gesetzt werden' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('ensure-admin-user: admin user and role ensured successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('ensure-admin-user: unexpected error', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Interner Serverfehler' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
