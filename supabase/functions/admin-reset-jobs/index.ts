import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ResetJobsRequest {
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Admin reset jobs request received');
    
    // Parse request body
    const { email }: ResetJobsRequest = await req.json();
    console.log('Request for reset by:', email);
    
    // Validate admin email
    const ADMIN_EMAIL = "guenter.killer@t-online.de";
    if (email !== ADMIN_EMAIL) {
      console.log('Unauthorized access attempt by:', email);
      return new Response(
        JSON.stringify({ error: 'Zugriff verweigert' }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Calling admin_reset_jobs_by_email function...');
    
    // Call the database function using service role
    const { data, error } = await supabaseServiceRole.rpc('admin_reset_jobs_by_email', {
      _email: ADMIN_EMAIL
    });

    if (error) {
      console.error('Error calling admin_reset_jobs_by_email:', error);
      throw error;
    }

    console.log('Reset jobs response:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: `${data?.jobs_updated || 0} Jobs zurückgesetzt und ${data?.assignments_deleted || 0} Zuweisungen gelöscht.`
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in admin-reset-jobs function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Fehler beim Zurücksetzen der Jobs' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});