import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { CustomerBookingConfirmation } from '../_shared/email-templates/customer-booking-confirmation.tsx';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FahrerAnfrageEmailRequest {
  vorname: string;
  nachname: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  einsatzbeginn?: string;
  einsatzdauer?: string;
  fahrzeugtyp: string;
  anforderungen?: string[];
  customer_street?: string;
  customer_house_number?: string;
  customer_postal_code?: string;
  customer_city?: string;
  einsatzort?: string;
  isFernfahrerTarif?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: FahrerAnfrageEmailRequest = await req.json();
    
    const {
      vorname,
      nachname,
      email,
      phone,
      company,
      message,
      einsatzbeginn,
      einsatzdauer,
      fahrzeugtyp,
      anforderungen = [],
      customer_street,
      customer_house_number,
      customer_postal_code,
      customer_city,
      einsatzort,
      isFernfahrerTarif = false
    } = requestData;

    const kundenname = `${vorname} ${nachname}`.trim();
    const firmaOderName = company ? `${company} (${kundenname})` : kundenname;
    
    // Format date range
    let zeitraumText = "Nach Absprache";
    if (einsatzbeginn) {
      try {
        const date = new Date(einsatzbeginn + "T08:00:00");
        if (!isNaN(date.getTime())) {
          const formattedDate = date.toLocaleDateString('de-DE');
          zeitraumText = einsatzdauer 
            ? `Ab ${formattedDate} für ${einsatzdauer} Tag(e)`
            : `Ab ${formattedDate}`;
        }
      } catch (dateError) {
        console.error("Date conversion error:", dateError);
        zeitraumText = einsatzbeginn + (einsatzdauer ? ` für ${einsatzdauer} Tag(e)` : "");
      }
    } else if (einsatzdauer) {
      zeitraumText = `Dauer: ${einsatzdauer} Tag(e)`;
    }

    // Format address
    let adresseText = "";
    if (customer_street && customer_house_number && customer_postal_code && customer_city) {
      adresseText = `${customer_street} ${customer_house_number}, ${customer_postal_code} ${customer_city}`;
    } else if (customer_city && customer_postal_code) {
      adresseText = `${customer_postal_code} ${customer_city}`;
    }

    // Determine driver type
    let fahrerTyp = "LKW CE Fahrer";
    if (fahrzeugtyp.toLowerCase().includes('baumaschine') || 
        fahrzeugtyp.toLowerCase().includes('bagger') ||
        fahrzeugtyp.toLowerCase().includes('radlader')) {
      fahrerTyp = "Baumaschinenführer";
    }

    // Render React Email template
    const emailHtml = await renderAsync(
      React.createElement(CustomerBookingConfirmation, {
        customerName: kundenname,
        companyName: company || undefined,
        driverType: fahrerTyp,
        requirements: anforderungen,
        timeframe: zeitraumText,
        location: adresseText || einsatzort || 'Nicht angegeben',
        message: message,
        isFernfahrerTarif: isFernfahrerTarif,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>",
      to: [email],
      subject: "Ihre Fahrerbuchung bei der Fahrerexpress-Agentur",
      html: emailHtml,
    });

    // Create Supabase client for logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.52.0");
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Log email sending
      if (emailResponse.error) {
        console.error("Failed to send customer confirmation:", emailResponse.error);
        
        await supabase.from('email_log').insert({
          recipient: email,
          subject: "Ihre Fahrerbuchung bei der Fahrerexpress-Agentur",
          template: 'customer_booking_confirmation',
          status: 'failed',
          error_message: emailResponse.error.message || String(emailResponse.error),
        });
      } else {
        console.log("Customer confirmation email sent successfully:", emailResponse);
        
        await supabase.from('email_log').insert({
          recipient: email,
          subject: "Ihre Fahrerbuchung bei der Fahrerexpress-Agentur",
          template: 'customer_booking_confirmation',
          status: 'sent',
          sent_at: new Date().toISOString(),
          message_id: emailResponse.data?.id,
        });
      }
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-fahrer-anfrage-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
