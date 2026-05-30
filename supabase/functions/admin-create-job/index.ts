import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateJobRequest {
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
  tarifType?: string;
  tarifLabel?: string;
  tarifNetto?: number | null;
  tarifUnit?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📝 Admin create job request received');

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from the JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const { data: roleData } = await supabase
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

    const body: CreateJobRequest = await req.json();
    console.log('📝 Job creation by admin:', user.id);

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
        status: 'pending',
        tarif_type: body.tarifType || null,
        tarif_label: body.tarifLabel || null,
        tarif_netto: body.tarifNetto ?? null,
        tarif_unit: body.tarifUnit || null,
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
        action: 'create_job_pending',
        job_id: job.id,
        admin_email: user.id,
        note: `Job (pending, kein Auto-Versand): ${body.customerName} - ${body.einsatzort} - Tarif: ${body.tarifLabel || 'n/a'}`
      });

    console.log('✅ Job created successfully:', job.id);

    // WICHTIG: KEIN automatischer Broadcast.
    // Versand erfolgt bewusst über den Admin-Button "Freigeben & an Fahrer senden"
    // (admin-approve-job), erst nachdem Anhänge geprüft wurden.
    console.log("ℹ️ Job created as 'pending'. No auto-broadcast.");

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