import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateContactRequest {
  email: string;
  jobId: string;
  cName: string;
  contact: string;
  street: string;
  house: string;
  postal: string;
  city: string;
  phone: string;
  contactEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
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
    const body: UpdateContactRequest = await req.json();
    const { email, jobId, cName, contact, street, house, postal, city, phone, contactEmail } = body;

    console.log('📝 Admin update contact request:', {
      email,
      jobId,
      cName,
      contact
    });

    // Validate admin access
    if (email !== 'guenter.killer@t-online.de') {
      throw new Error('Unauthorized');
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update job contact data
    const { error } = await supabase
      .from('job_requests')
      .update({
        customer_name: cName,
        company: cName,
        customer_street: street,
        customer_house_number: house,
        customer_postal_code: postal,
        customer_city: city,
        customer_phone: phone,
        customer_email: contactEmail,
        updated_at: new Date().toISOString()
      })
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