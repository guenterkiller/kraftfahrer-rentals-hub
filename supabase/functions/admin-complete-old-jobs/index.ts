import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CompleteOldJobsRequest {
  email: string;
  daysOld?: number; // Default 30 days
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Admin complete old jobs request received');
    
    // Parse request body
    const { email, daysOld = 30 }: CompleteOldJobsRequest = await req.json();
    console.log(`Request from: ${email}, days old: ${daysOld}`);
    
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

    console.log(`Calling admin_mark_old_jobs_completed with ${daysOld} days...`);
    
    // Call the database function using service role
    const { data, error } = await supabaseServiceRole.rpc('admin_mark_old_jobs_completed', {
      _days_old: daysOld
    });

    if (error) {
      console.error('Error calling admin_mark_old_jobs_completed:', error);
      throw error;
    }

    console.log('Complete old jobs response:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: data?.message || `${data?.updated_count || 0} alte Aufträge als erledigt markiert.`
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in admin-complete-old-jobs function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Fehler beim Abschließen alter Aufträge' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});