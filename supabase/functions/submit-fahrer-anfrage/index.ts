import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface FahrerAnfrageRequest {
  vorname: string;
  nachname: string;
  email: string;
  phone: string;
  company?: string;
  einsatzbeginn?: string;
  einsatzdauer?: string;
  fahrzeugtyp?: string;
  anforderungen: string[];
  nachricht: string;
  datenschutz: boolean;
  newsletter?: boolean;
  price_acknowledged: boolean;
  price_ack_time?: string;
  price_plan?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const requestData: FahrerAnfrageRequest = await req.json();
    
    // Validate required fields
    if (!requestData.vorname || !requestData.nachname || !requestData.email || 
        !requestData.phone || !requestData.nachricht || !requestData.datenschutz) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Format zeitraum
    let zeitraumFormatted = "Nach Absprache";
    if (requestData.einsatzbeginn) {
      try {
        const date = new Date(requestData.einsatzbeginn + "T08:00:00");
        const isoDateString = date.toISOString();
        
        zeitraumFormatted = requestData.einsatzdauer 
          ? `Ab ${new Date(isoDateString).toLocaleDateString('de-DE')} für ${requestData.einsatzdauer}`
          : `Ab ${new Date(isoDateString).toLocaleDateString('de-DE')}`;
      } catch (dateError) {
        console.error("Date conversion error:", dateError);
        zeitraumFormatted = requestData.einsatzbeginn + (requestData.einsatzdauer ? ` für ${requestData.einsatzdauer}` : "");
      }
    } else if (requestData.einsatzdauer) {
      zeitraumFormatted = `Dauer: ${requestData.einsatzdauer}`;
    }

    // Extract location from message or use default
    const einsatzort = requestData.nachricht.includes("Einsatzort") 
      ? requestData.nachricht.split("Einsatzort")[1]?.split(/[,\n]/)[0]?.trim() || "Siehe Nachricht"
      : "Siehe Nachricht";

    // Prepare data for database insert
    const jobRequestData = {
      customer_name: `${requestData.vorname} ${requestData.nachname}`.trim(),
      customer_email: requestData.email.trim(),
      customer_phone: requestData.phone.trim(),
      company: requestData.company?.trim() || null,
      einsatzort: einsatzort.trim(),
      zeitraum: zeitraumFormatted,
      fahrzeugtyp: requestData.fahrzeugtyp || "Nicht angegeben",
      fuehrerscheinklasse: "C+E",
      besonderheiten: requestData.anforderungen.length > 0 ? requestData.anforderungen.join(", ") : null,
      nachricht: requestData.nachricht.trim(),
      status: 'open'
    };

    console.log('Inserting job request:', jobRequestData);

    // Save job request to database
    const { data: jobRequest, error: jobError } = await supabase
      .from('job_requests')
      .insert([jobRequestData])
      .select()
      .single();

    if (jobError) {
      console.error("Error saving job request:", jobError);
      return new Response(JSON.stringify({ error: 'Failed to save job request', details: jobError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("Job request saved:", jobRequest);

    // Send job alert emails to all drivers
    if (jobRequest && jobRequest.id) {
      try {
        const alertResponse = await supabase.functions.invoke('send-job-alert-emails', {
          body: {
            job_id: jobRequest.id,
            einsatzort: jobRequestData.einsatzort,
            zeitraum: jobRequestData.zeitraum,
            fahrzeugtyp: jobRequestData.fahrzeugtyp,
            fuehrerscheinklasse: jobRequestData.fuehrerscheinklasse,
            besonderheiten: jobRequestData.besonderheiten,
            customer_name: jobRequestData.customer_name,
            customer_email: jobRequestData.customer_email
          }
        });

        if (alertResponse.error) {
          console.error("Error sending job alert emails:", alertResponse.error);
        }
      } catch (emailError) {
        console.error("Error with job alert emails:", emailError);
      }
    }

    // Send customer notification email
    try {
      const customerResponse = await supabase.functions.invoke('send-fahrer-anfrage-email', {
        body: {
          vorname: requestData.vorname.trim(),
          nachname: requestData.nachname.trim(),
          email: requestData.email.trim(),
          phone: requestData.phone.trim(),
          company: requestData.company?.trim() || '',
          message: requestData.nachricht.trim(),
          einsatzbeginn: requestData.einsatzbeginn || '',
          einsatzdauer: requestData.einsatzdauer || '',
          fahrzeugtyp: requestData.fahrzeugtyp || '',
          spezialanforderungen: requestData.anforderungen,
          datenschutz: requestData.datenschutz,
          newsletter: requestData.newsletter || false,
          price_acknowledged: requestData.price_acknowledged,
          price_ack_time: requestData.price_ack_time || new Date().toISOString(),
          price_plan: requestData.price_plan || 'Standard LKW-Fahrer'
        }
      });

      if (customerResponse.error) {
        console.error("Error sending customer email:", customerResponse.error);
      }
    } catch (emailError) {
      console.error("Error with customer email:", emailError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Anfrage erfolgreich gesendet',
      job_id: jobRequest.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);