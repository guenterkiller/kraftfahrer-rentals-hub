import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateContactRequest {
  jobId: string;
  cName: string;
  contact: string;
  street: string;
  house: string;
  postal: string;
  city: string;
  phone: string;
  contactEmail: string;
  einsatzort?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // JWT is already validated by Supabase (verify_jwt = true in config.toml)
    // Just decode it to get the user ID
    const token = authHeader.replace('Bearer ', '');
    let userId: string;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid token format' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: UpdateContactRequest = await req.json();
    const { jobId, cName, contact, street, house, postal, city, phone, contactEmail, einsatzort } = body;

    console.log('📝 Admin update contact by:', userId);

    // Update job contact data and location
    const updateData: any = {
      customer_name: cName,
      company: cName,
      customer_street: street,
      customer_house_number: house,
      customer_postal_code: postal,
      customer_city: city,
      customer_phone: phone,
      customer_email: contactEmail,
      updated_at: new Date().toISOString()
    };

    // Add einsatzort if provided
    if (einsatzort) {
      updateData.einsatzort = einsatzort;
    }

    const { error } = await supabase
      .from('job_requests')
      .update(updateData)
      .eq('id', jobId);

    if (error) {
      console.error('❌ Error updating contact data:', error);
      throw error;
    }

    console.log('✅ Contact data updated successfully');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error in admin-update-contact:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});