import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { contactUpdate } from './contact-data.ts';

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
    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Serverkonfiguration fehlt');
    
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

    const body: UpdateContactRequest = await req.json();
    if (typeof body.cName !== 'string' || typeof body.contact !== 'string' || !body.cName.trim() || !body.contact.trim()) {
      return new Response(JSON.stringify({ error: 'Firma und Ansprechpartner sind getrennt erforderlich' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { jobId, cName, contact, street, house, postal, city, phone, contactEmail, einsatzort } = body;

    console.log('📝 Admin update contact by:', user.id);

    // Update job contact data and location
    const updateData = contactUpdate(body);

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