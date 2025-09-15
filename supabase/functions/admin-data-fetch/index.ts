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
    console.log('Admin data fetch request received');

    // Parse request body once
    const requestBody = await req.json();
    const { email, dataType, fahrerId, fahrerIds } = requestBody;
    console.log('Request for dataType:', dataType, 'by:', email);

    // Validate admin email
    const ADMIN_EMAIL = "guenter.killer@t-online.de";
    if (email !== ADMIN_EMAIL) {
      console.log('Unauthorized access attempt by:', email);
      return new Response(
        JSON.stringify({ error: 'Zugriff verweigert' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let data = null;
    let error = null;

    switch (dataType) {
      case 'fahrer':
        console.log('Fetching driver data...');
        const result = await supabase
          .from("fahrer_profile")
          .select("*")
          .order('created_at', { ascending: false });
        data = result.data;
        error = result.error;
        break;

      case 'jobs':
        console.log('Fetching job requests...');
        const jobResult = await supabase
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
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        const docResult = await supabase
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
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        const counts = {};
        for (const fahrerId of fahrerIds) {
          const countResult = await supabase
            .from("fahrer_dokumente")
            .select("id", { count: 'exact' })
            .eq('fahrer_id', fahrerId);
          counts[fahrerId] = countResult.count || 0;
        }
        data = counts;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Ungültiger Datentyp' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: `Datenbankfehler: ${error.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Successfully fetched ${data?.length || 0} records for ${dataType}`);
    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in admin data fetch:', error);
    return new Response(
      JSON.stringify({ error: 'Interner Serverfehler' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});