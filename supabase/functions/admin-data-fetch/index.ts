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
    console.log('Admin data fetch request received');

    // 1) Extract JWT token from Authorization header
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      console.log('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2) Create Supabase Admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    // 3) Verify the token and get user
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData?.user) {
      console.log('Failed to get user from token:', userError?.message || 'No user returned');
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = userData.user;
    console.log('User ID from JWT:', user.id);

    // 4) Verify admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.log('User is not an admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden - admin role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin verified:', user.id);

    // 5) Parse request body
    const { dataType, fahrerId, fahrerIds } = await req.json();
    console.log('Request for dataType:', dataType);

    let data = null;
    let error = null;

    switch (dataType) {
      case 'fahrer':
        console.log('Fetching driver data...');
        const result = await supabaseAdmin
          .from("fahrer_profile")
          .select("*")
          .order('created_at', { ascending: false });
        data = result.data;
        error = result.error;
        break;

      case 'jobs':
        console.log('Fetching job requests...');
        const jobResult = await supabaseAdmin
          .from("job_requests")
          .select("*")
          .order('created_at', { ascending: false });
        data = jobResult.data;
        error = jobResult.error;
        break;

      case 'documents':
        console.log('Fetching driver documents...');
        if (!fahrerId) {
          return new Response(
            JSON.stringify({ error: 'Fahrer ID erforderlich' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const docResult = await supabaseAdmin
          .from("fahrer_dokumente")
          .select("*")
          .eq('fahrer_id', fahrerId)
          .order('uploaded_at', { ascending: false });
        data = docResult.data;
        error = docResult.error;
        break;

      case 'document-counts':
        console.log('Fetching document counts...');
        if (!fahrerIds || !Array.isArray(fahrerIds)) {
          return new Response(
            JSON.stringify({ error: 'Fahrer IDs erforderlich' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const counts = {};
        for (const fahrerId of fahrerIds) {
          const countResult = await supabaseAdmin
            .from("fahrer_dokumente")
            .select("id", { count: 'exact' })
            .eq('fahrer_id', fahrerId);
          counts[fahrerId] = countResult.count || 0;
        }
        data = counts;
        break;

      case 'emails':
        console.log('Fetching email logs...');
        const emailResult = await supabaseAdmin
          .from("email_log")
          .select("*")
          .order('created_at', { ascending: false })
          .limit(50);
        data = emailResult.data;
        error = emailResult.error;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Ungültiger Datentyp' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (error) {
      console.error('Database error:', error.message, error.code);
      return new Response(
        JSON.stringify({ error: 'Fehler beim Laden der Daten' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully fetched ${data?.length || 0} records for ${dataType}`);
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin data fetch:', error);
    return new Response(
      JSON.stringify({ error: 'Interner Serverfehler' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
