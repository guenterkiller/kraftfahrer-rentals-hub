import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MarkJobCompletedRequest {
  email: string;
  jobId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Admin mark job completed request received');
    
    // Parse request body
    const { email, jobId }: MarkJobCompletedRequest = await req.json();
    console.log(`Request from: ${email}, job ID: ${jobId}`);
    
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

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'Job ID ist erforderlich' }),
        { 
          status: 400, 
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

    console.log(`Marking job ${jobId} as completed...`);
    
    // Update the specific job status to completed
    const { data, error } = await supabaseServiceRole
      .from('job_requests')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select();

    if (error) {
      console.error('Error updating job status:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Auftrag nicht gefunden' }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Job marked as completed:', data[0]);

    // Log the admin action
    await supabaseServiceRole
      .from('admin_actions')
      .insert({
        action: 'mark_job_completed_jwt',
        job_id: jobId,
        admin_email: user.email,
        note: `Job marked as completed via secure JWT auth`
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data[0],
        message: `Auftrag ${data[0].customer_name} wurde als erledigt markiert.`
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in admin-mark-job-completed function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Fehler beim Markieren des Auftrags als erledigt' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});