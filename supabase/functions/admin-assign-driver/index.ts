import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AssignDriverRequest {
  email: string;
  jobId: string;
  driverId: string;
  rateType: string;
  rateValue: number;
  startDate?: string;
  endDate?: string;
  note?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Admin assign driver request received');

    const { email, jobId, driverId, rateType, rateValue, startDate, endDate, note }: AssignDriverRequest = await req.json();
    console.log('Assignment request:', { jobId, driverId, rateType, rateValue, by: email });

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

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('job_requests')
      .select('id, status')
      .eq('id', jobId)
      .single();
    
    if (jobError || !job) {
      console.error('Job not found:', jobId, jobError);
      return new Response(
        JSON.stringify({ error: 'Job nicht gefunden' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if driver exists
    const { data: driver, error: driverError } = await supabase
      .from('fahrer_profile')
      .select('id, status')
      .eq('id', driverId)
      .single();
    
    if (driverError || !driver) {
      console.error('Driver not found:', driverId, driverError);
      return new Response(
        JSON.stringify({ error: 'Fahrer nicht gefunden' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for existing active assignment
    const { data: existingAssignment } = await supabase
      .from('job_assignments')
      .select('id, status')
      .eq('job_id', jobId)
      .in('status', ['assigned', 'confirmed'])
      .maybeSingle();

    if (existingAssignment) {
      console.error('Job already has active assignment:', existingAssignment);
      return new Response(
        JSON.stringify({ error: 'Job bereits zugewiesen. Erst vorherige Zuweisung stornieren.' }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create assignment
    const assignmentId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('job_assignments')
      .insert({
        id: assignmentId,
        job_id: jobId,
        driver_id: driverId,
        status: 'assigned',
        rate_type: rateType,
        rate_value: rateValue,
        start_date: startDate || null,
        end_date: endDate || null,
        admin_note: note || null,
        assigned_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Failed to create assignment:', insertError);
      return new Response(
        JSON.stringify({ error: `Zuweisung fehlgeschlagen: ${insertError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update job status
    const { error: updateError } = await supabase
      .from('job_requests')
      .update({ status: 'assigned' })
      .eq('id', jobId);

    if (updateError) {
      console.error('Failed to update job status:', updateError);
      // Assignment was created, but job status update failed - log but continue
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        action: 'assign_driver_via_function',
        job_id: jobId,
        assignment_id: assignmentId,
        admin_email: email,
        note: `Driver ${driverId} assigned with ${rateType} rate ${rateValue}`
      });

    console.log('✅ Assignment successful:', assignmentId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        assignmentId: assignmentId,
        message: 'Fahrer erfolgreich zugewiesen'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in admin-assign-driver function:', error);
    return new Response(
      JSON.stringify({ error: 'Server error: ' + error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});