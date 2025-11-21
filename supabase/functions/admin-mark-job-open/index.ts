import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface MarkJobOpenRequest {
  jobId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Admin mark job open request received');
    
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // JWT is already validated by Supabase (verify_jwt = true in config.toml)
    const token = authHeader.replace('Bearer ', '');
    
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from the JWT
    const { data: { user }, error: userError } = await supabaseServiceRole.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const { data: roleData } = await supabaseServiceRole
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { jobId }: MarkJobOpenRequest = await req.json();
    console.log(`Admin ${user.id} marking job ${jobId} as open`);

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'Job ID ist erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Marking job ${jobId} as open...`);
    
    // Update the specific job status to open
    const { data, error } = await supabaseServiceRole
      .from('job_requests')
      .update({ 
        status: 'open', 
        completed_at: null,
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

    console.log('Job marked as open:', data[0]);

    // Log the admin action
    await supabaseServiceRole
      .from('admin_actions')
      .insert({
        action: 'mark_job_open_jwt',
        job_id: jobId,
        admin_email: user.id,
        note: `Job marked as open via secure JWT auth`
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data[0],
        message: `Auftrag ${data[0].customer_name} wurde als offen markiert.`
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in admin-mark-job-open function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Fehler beim Markieren des Auftrags als offen' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});