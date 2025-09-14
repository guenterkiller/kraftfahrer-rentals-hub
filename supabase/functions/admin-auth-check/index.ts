// admin-auth-check: verifies JWT + admin role
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Admin auth check request received');
    
    const auth = req.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    
    if (!token) {
      console.log('No token provided');
      return new Response(JSON.stringify({ error: 'missing token' }), {
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Get user from token
    const { data: userData, error: userErr } = await sb.auth.getUser(token);
    if (userErr || !userData?.user) {
      console.log('Invalid token:', userErr?.message);
      return new Response(JSON.stringify({ error: 'invalid token' }), {
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User authenticated:', userData.user.email);

    // Check role using service role key to bypass RLS
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: roleRows, error: roleErr } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .limit(1);

    if (roleErr) {
      console.error('Role check error:', roleErr.message);
      return new Response(JSON.stringify({ error: 'role check failed' }), {
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!roleRows || roleRows.length === 0 || roleRows[0].role !== 'admin') {
      console.log('User not admin or no role found');
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Admin access granted for:', userData.user.email);
    return new Response(JSON.stringify({ 
      success: true, 
      user: { 
        id: userData.user.id, 
        email: userData.user.email 
      } 
    }), {
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Admin auth check error:', e);
    return new Response(JSON.stringify({ error: 'server error' }), {
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});