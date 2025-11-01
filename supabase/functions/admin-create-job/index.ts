import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateJobRequest {
  email: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  customerStreet?: string;
  customerHouseNumber?: string;
  customerPostalCode?: string;
  customerCity?: string;
  einsatzort: string;
  zeitraum: string;
  fahrzeugtyp: string;
  fuehrerscheinklasse: string;
  besonderheiten?: string;
  nachricht: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📝 Admin create job request received');

    const body: CreateJobRequest = await req.json();
    console.log('📝 Admin create job request:', {
      email: body.email,
      customerName: body.customerName,
      einsatzort: body.einsatzort,
      fahrzeugtyp: body.fahrzeugtyp
    });

    // Validate admin email
    if (body.email !== 'guenter.killer@t-online.de') {
      console.error('❌ Unauthorized email:', body.email);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate required fields
    if (!body.customerName || !body.customerEmail || !body.customerPhone || 
        !body.einsatzort || !body.zeitraum || !body.fahrzeugtyp || 
        !body.fuehrerscheinklasse || !body.nachricht) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create job request
    const { data: job, error: insertError } = await supabase
      .from('job_requests')
      .insert({
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        customer_phone: body.customerPhone,
        company: body.company || null,
        customer_street: body.customerStreet || null,
        customer_house_number: body.customerHouseNumber || null,
        customer_postal_code: body.customerPostalCode || null,
        customer_city: body.customerCity || null,
        einsatzort: body.einsatzort,
        zeitraum: body.zeitraum,
        fahrzeugtyp: body.fahrzeugtyp,
        fuehrerscheinklasse: body.fuehrerscheinklasse,
        besonderheiten: body.besonderheiten || null,
        nachricht: body.nachricht,
        status: 'open'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating job:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create job', details: insertError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        action: 'create_job',
        job_id: job.id,
        admin_email: body.email,
        note: `Job created via admin interface: ${body.customerName} - ${body.einsatzort}`
      });

    console.log('✅ Job created successfully:', job.id);

    // Broadcast job to all approved drivers
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/broadcast-job-to-drivers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-fn": Deno.env.get("INTERNAL_FN_SECRET")!,
        },
        body: JSON.stringify({
          jobRequestId: job.id,
          job: {
            fahrzeugtyp: job.fahrzeugtyp,
            fuehrerscheinklasse: job.fuehrerscheinklasse,
          },
          customer: {
            name: job.customer_name,
            email: job.customer_email,
            phone: job.customer_phone,
          },
        }),
      });
      console.log("📧 Driver broadcast initiated for manually created job");
    } catch (broadcastError) {
      console.error("⚠️ Error broadcasting to drivers:", broadcastError);
      // Don't fail the job creation if broadcast fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        job: job,
        jobId: job.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});