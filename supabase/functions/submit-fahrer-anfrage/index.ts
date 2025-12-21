import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { AdminBookingNotification } from '../_shared/email-templates/admin-booking-notification.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonCors = { ...corsHeaders, 'Content-Type': 'application/json' };

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
  
  // Customer address fields
  customer_street?: string;
  customer_house_number?: string;
  customer_postal_code?: string;
  customer_city?: string;
  
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
  billing_model?: string;
  
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
      headers: jsonCors
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: jsonCors
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Safely parse JSON body
    const requestData: FahrerAnfrageRequest = await req.json().catch(() => ({} as any));
    
    console.log('Received booking request');
    
    // Extract data directly from the flat structure sent by SimpleBookingForm
    const vorname = String(requestData.vorname || '').trim();
    const nachname = String(requestData.nachname || '').trim();
    const email = String(requestData.email || '').trim().toLowerCase();
    const phone = String(requestData.phone || '').trim();
    const company = String(requestData.company || '').trim();
    
    // Customer address data
    const customer_street = String(requestData.customer_street || '').trim();
    const customer_house_number = String(requestData.customer_house_number || '').trim();
    const customer_postal_code = String(requestData.customer_postal_code || '').trim();
    const customer_city = String(requestData.customer_city || '').trim();
    
    // Job data
    const fahrzeugtyp = String(requestData.fahrzeugtyp || 'lkw').trim();
    const nachricht = String(requestData.nachricht || '').trim();
    const anforderungen = Array.isArray(requestData.anforderungen) ? requestData.anforderungen : [];
    
    // Consent data
    const datenschutz = Boolean(requestData.datenschutz);
    const newsletter = Boolean(requestData.newsletter);
    const billing_model = String(requestData.billing_model || 'agency');
    
    // Validate required fields
    const required = [
      { field: 'vorname', value: vorname },
      { field: 'nachname', value: nachname },
      { field: 'email', value: email },
      { field: 'phone', value: phone },
      { field: 'customer_street', value: customer_street },
      { field: 'customer_house_number', value: customer_house_number },
      { field: 'customer_postal_code', value: customer_postal_code },
      { field: 'customer_city', value: customer_city },
      { field: 'nachricht', value: nachricht }
    ];
    
    const missing = required.filter(r => !r.value);
    if (missing.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Pflichtfelder fehlen',
        details: `Missing required fields: ${missing.map(m => m.field).join(', ')}`
      }), {
        status: 400,
        headers: jsonCors
      });
    }
    
    // Validate email format
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      return new Response(JSON.stringify({ 
        error: 'Ungültige E-Mail-Adresse',
        details: 'Invalid email format'
      }), {
        status: 400,
        headers: jsonCors
      });
    }
    
    // Validate PLZ format
    if (!/^\d{5}$/.test(customer_postal_code)) {
      return new Response(JSON.stringify({ 
        error: 'PLZ muss 5-stellig sein',
        details: 'customer_postal_code must be exactly 5 digits'
      }), {
        status: 400,
        headers: jsonCors
      });
    }
    
    if (!datenschutz) {
      return new Response(JSON.stringify({ 
        error: 'Datenschutz-Zustimmung erforderlich',
        details: 'DSGVO consent is required'
      }), {
        status: 400,
        headers: jsonCors
      });
    }

    // Format zeitraum from einsatzbeginn and einsatzdauer
    let zeitraumFormatted = "Nach Absprache";
    const einsatzbeginn = requestData.einsatzbeginn;
    const einsatzdauer = requestData.einsatzdauer;
    
    if (einsatzbeginn) {
      try {
        const date = new Date(einsatzbeginn + "T08:00:00");
        if (!isNaN(date.getTime())) {
          const formattedDate = date.toLocaleDateString('de-DE');
          zeitraumFormatted = einsatzdauer 
            ? `Ab ${formattedDate} für ${einsatzdauer} Tag(e)`
            : `Ab ${formattedDate}`;
        }
      } catch (dateError) {
        console.error("Date conversion error:", dateError);
        zeitraumFormatted = einsatzbeginn + (einsatzdauer ? ` für ${einsatzdauer} Tag(e)` : "");
      }
    } else if (einsatzdauer) {
      zeitraumFormatted = `Dauer: ${einsatzdauer} Tag(e)`;
    }
    
    // Create einsatzort from address
    const einsatzort = `${customer_city}, ${customer_postal_code}`;

    // Prepare data for database insert
    const jobRequestData = {
      customer_name: `${vorname} ${nachname}`.trim(),
      customer_email: email,
      customer_phone: phone,
      company: company || null,
      customer_street: customer_street,
      customer_house_number: customer_house_number,
      customer_postal_code: customer_postal_code,
      customer_city: customer_city,
      einsatzort: einsatzort,
      zeitraum: zeitraumFormatted,
      fahrzeugtyp: fahrzeugtyp,
      fuehrerscheinklasse: 'C+E',
      besonderheiten: anforderungen.length > 0 ? anforderungen.join(", ") : null,
      nachricht: nachricht,
      status: 'open', // Anfragen starten als 'open' (erlaubte Werte: open, assigned, completed, cancelled)
      billing_model: billing_model
    };

    console.log('Inserting job request for:', customer_city);

    // Save job request to database
    const { data: jobRequest, error: jobError } = await supabase
      .from('job_requests')
      .insert([jobRequestData])
      .select()
      .single();

    if (jobError) {
      console.error("Error saving job request:", jobError);
      return new Response(JSON.stringify({ 
        error: 'Failed to save job request', 
        details: jobError.message || jobError 
      }), {
        status: 400,
        headers: jsonCors
      });
    }

    console.log("Job request saved with status 'open'");

    // WICHTIG: Kein sofortiger Broadcast an Fahrer mehr!
    // Der Versand erfolgt erst nach Admin-Freigabe über admin-approve-job

    // Send customer notification email
    try {
      const customerResponse = await supabase.functions.invoke('send-fahrer-anfrage-email', {
        body: {
          vorname: vorname,
          nachname: nachname,
          email: email,
          phone: phone,
          company: company,
          message: nachricht,
          einsatzbeginn: einsatzbeginn || '',
          einsatzdauer: einsatzdauer || '',
          fahrzeugtyp: fahrzeugtyp,
          anforderungen: anforderungen,
          customer_street: customer_street,
          customer_house_number: customer_house_number,
          customer_postal_code: customer_postal_code,
          customer_city: customer_city,
          einsatzort: einsatzort
        }
      });

      if (customerResponse.error) {
        console.error("Error sending customer email:", customerResponse.error);
      }
    } catch (emailError) {
      console.error("Error with customer email:", emailError);
    }

    // Send admin notification email
    try {
      const { data: adminSettings } = await supabase
        .from('admin_settings')
        .select('admin_email')
        .single();

      if (adminSettings?.admin_email) {
        // Determine driver type for display
        let driverTypeDisplay = "LKW CE Fahrer";
        if (fahrzeugtyp.toLowerCase().includes('baumaschine') || 
            fahrzeugtyp.toLowerCase().includes('bagger') ||
            fahrzeugtyp.toLowerCase().includes('radlader')) {
          driverTypeDisplay = "Baumaschinenführer";
        }

        const adminEmailHtml = await renderAsync(
          React.createElement(AdminBookingNotification, {
            customerName: `${vorname} ${nachname}`,
            companyName: company || undefined,
            email: email,
            phone: phone,
            address: `${customer_street} ${customer_house_number}, ${customer_postal_code} ${customer_city}`,
            timeframe: zeitraumFormatted,
            driverType: driverTypeDisplay,
            requirements: anforderungen,
            message: nachricht,
            billingModel: billing_model,
            jobId: jobRequest.id,
          })
        );

        const { Resend } = await import("npm:resend@2.0.0");
        const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

        const adminEmailResponse = await resend.emails.send({
          from: "Fahrerexpress System <info@kraftfahrer-mieten.com>",
          to: [adminSettings.admin_email],
          subject: `Neue Buchungsanfrage: ${driverTypeDisplay} in ${customer_city}`,
          html: adminEmailHtml,
        });

        // Log admin email
        if (adminEmailResponse.error) {
          console.error("Failed to send admin notification:", adminEmailResponse.error);
          
          await supabase.from('email_log').insert({
            recipient: adminSettings.admin_email,
            subject: `Neue Buchungsanfrage: ${driverTypeDisplay} in ${customer_city}`,
            template: 'admin_booking_notification',
            status: 'failed',
            job_id: jobRequest.id,
            error_message: adminEmailResponse.error.message || String(adminEmailResponse.error),
          });
        } else {
          console.log("Admin notification sent successfully:", adminEmailResponse);
          
          await supabase.from('email_log').insert({
            recipient: adminSettings.admin_email,
            subject: `Neue Buchungsanfrage: ${driverTypeDisplay} in ${customer_city}`,
            template: 'admin_booking_notification',
            status: 'sent',
            job_id: jobRequest.id,
            sent_at: new Date().toISOString(),
            message_id: adminEmailResponse.data?.id,
          });
        }
      }
    } catch (adminEmailError) {
      console.error("Error sending admin notification:", adminEmailError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Anfrage erfolgreich gesendet',
      job_id: jobRequest.id 
    }), {
      status: 200,
      headers: jsonCors
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message || String(error)
    }), {
      status: 500,
      headers: jsonCors
    });
  }
};

serve(handler);