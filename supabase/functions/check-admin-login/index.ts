import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Admin login attempt received');

    // Get the admin password from Supabase secrets
    const adminPassword = Deno.env.get('ADMIN_SECRET_PASSWORD');
    if (!adminPassword) {
      console.error('ADMIN_SECRET_PASSWORD environment variable not found');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { email, password } = await req.json();
    console.log('Login attempt for email:', email);

    // Validate required fields
    if (!email || !password) {
      console.log('Missing email or password');
      return new Response(
        JSON.stringify({ error: 'E-Mail und Passwort sind erforderlich' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if email matches exactly
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
    if (!ADMIN_EMAIL || email !== ADMIN_EMAIL) {
      console.log('Email does not match admin email');
      return new Response(
        JSON.stringify({ error: 'Zugriff verweigert - ungültige Anmeldedaten' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if password matches
    if (password !== adminPassword) {
      console.log('Password does not match');
      return new Response(
        JSON.stringify({ error: 'Zugriff verweigert - ungültige Anmeldedaten' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Successful login
    console.log('Admin login successful');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Login erfolgreich',
        user: { email: ADMIN_EMAIL }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in admin login:', error);
    return new Response(
      JSON.stringify({ error: 'Interner Serverfehler' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});