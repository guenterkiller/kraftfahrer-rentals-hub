import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface FahrerAnfrageRequest {
  // Customer data - flexible format
  vorname?: string;
  nachname?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    phone: string;
  };
  email?: string;
  phone?: string;
  company?: string;
  
  // Job details
  job?: {
    company?: string;
    einsatzort?: string;
    einsatzbeginn?: string;
    einsatzdauer?: string;
    einsatzdauer_wochen?: number;
    zeitraum?: string;
    fahrzeugtyp?: string;
    fuehrerscheinklasse?: string;
    nachricht?: string;
  };
  einsatzbeginn?: string;
  einsatzdauer?: string;
  fahrzeugtyp?: string;
  anforderungen?: string[];
  nachricht?: string;
  
  // Consents
  consents?: {
    datenschutz_ok?: boolean;
    newsletter_ok?: boolean;
    price_confirmed?: boolean;
    confirmed_at?: string;
  };
  datenschutz?: boolean;
  newsletter?: boolean;
  price_acknowledged?: boolean;
  price_ack_time?: string;
  price_plan?: string;
  
  // Meta
  meta?: {
    source?: string;
    ip?: string;
    userAgent?: string;
  };
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
    
    // Flexible customer data extraction
    const vorname = requestData.vorname || requestData.customer?.firstName || requestData.customer?.name?.split(' ')[0] || '';
    const nachname = requestData.nachname || requestData.customer?.lastName || requestData.customer?.name?.split(' ').slice(1).join(' ') || '';
    const email = requestData.email || requestData.customer?.email || '';
    const phone = requestData.phone || requestData.customer?.phone || '';
    const company = requestData.company || requestData.job?.company || '';
    
    // Flexible job data extraction
    const einsatzort = requestData.job?.einsatzort || requestData.nachricht?.includes("Einsatzort") 
      ? requestData.nachricht?.split("Einsatzort")[1]?.split(/[,\n]/)[0]?.trim() || "Siehe Nachricht"
      : "Siehe Nachricht";
    const fahrzeugtyp = requestData.fahrzeugtyp || requestData.job?.fahrzeugtyp || "Nicht angegeben";
    const fuehrerscheinklasse = requestData.job?.fuehrerscheinklasse || "C+E";
    const nachricht = requestData.nachricht || requestData.job?.nachricht || '';
    
    // Flexible consent extraction
    const datenschutz = requestData.datenschutz || requestData.consents?.datenschutz_ok || false;
    const newsletter = requestData.newsletter || requestData.consents?.newsletter_ok || false;
    
    // Validate required fields with clear error messages
    if (!vorname || !nachname) {
      return new Response(JSON.stringify({ 
        error: 'Vor- und Nachname sind erforderlich', 
        details: 'firstName/lastName or vorname/nachname must be provided' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!email || !phone) {
      return new Response(JSON.stringify({ 
        error: 'E-Mail und Telefonnummer sind erforderlich',
        details: 'email and phone must be provided'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!nachricht) {
      return new Response(JSON.stringify({ 
        error: 'Nachricht ist erforderlich',
        details: 'nachricht field must be provided'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!datenschutz) {
      return new Response(JSON.stringify({ 
        error: 'datenschutz_ok must be true',
        details: 'DSGVO consent is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Format zeitraum
    let zeitraumFormatted = "Nach Absprache";
    const einsatzbeginn = requestData.einsatzbeginn || requestData.job?.einsatzbeginn;
    const einsatzdauer = requestData.einsatzdauer || requestData.job?.einsatzdauer;
    
    if (einsatzbeginn) {
      try {
        const date = new Date(einsatzbeginn + "T08:00:00");
        const isoDateString = date.toISOString();
        
        zeitraumFormatted = einsatzdauer 
          ? `Ab ${new Date(isoDateString).toLocaleDateString('de-DE')} für ${einsatzdauer}`
          : `Ab ${new Date(isoDateString).toLocaleDateString('de-DE')}`;
      } catch (dateError) {
        console.error("Date conversion error:", dateError);
        zeitraumFormatted = einsatzbeginn + (einsatzdauer ? ` für ${einsatzdauer}` : "");
      }
    } else if (einsatzdauer) {
      zeitraumFormatted = `Dauer: ${einsatzdauer}`;
    }

    // Prepare data for database insert
    const jobRequestData = {
      customer_name: `${vorname} ${nachname}`.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim(),
      company: company?.trim() || null,
      einsatzort: einsatzort.trim(),
      zeitraum: zeitraumFormatted,
      fahrzeugtyp: fahrzeugtyp,
      fuehrerscheinklasse: fuehrerscheinklasse,
      besonderheiten: requestData.anforderungen?.length > 0 ? requestData.anforderungen.join(", ") : null,
      nachricht: nachricht.trim(),
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

    // Send broadcast to drivers with new system
    if (jobRequest && jobRequest.id) {
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/broadcast-job-to-drivers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-fn": Deno.env.get("INTERNAL_FN_SECRET")!,
          },
          body: JSON.stringify({
            jobRequestId: jobRequest.id,
            job: {
              fahrzeugtyp: jobRequestData.fahrzeugtyp,
              fuehrerscheinklasse: jobRequestData.fuehrerscheinklasse,
            },
            customer: {
              name: jobRequestData.customer_name,
              email: jobRequestData.customer_email,
              phone: jobRequestData.customer_phone,
            },
          }),
        });
        console.log("Driver broadcast initiated");
      } catch (broadcastError) {
        console.error("Error with driver broadcast:", broadcastError);
      }
    }

    // Send customer notification email
    try {
      const customerResponse = await supabase.functions.invoke('send-fahrer-anfrage-email', {
        body: {
          vorname: vorname.trim(),
          nachname: nachname.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company?.trim() || '',
          message: nachricht.trim(),
          einsatzbeginn: einsatzbeginn || '',
          einsatzdauer: einsatzdauer || '',
          fahrzeugtyp: fahrzeugtyp || '',
          spezialanforderungen: requestData.anforderungen || [],
          datenschutz: datenschutz,
          newsletter: newsletter,
          price_acknowledged: requestData.price_acknowledged || requestData.consents?.price_confirmed || false,
          price_ack_time: requestData.price_ack_time || requestData.consents?.confirmed_at || new Date().toISOString(),
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