import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FahreranfrageRequest {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  unternehmen?: string;
  nachricht: string;
  datenschutz: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fahreranfrage submission received");
    
    const requestData: FahreranfrageRequest = await req.json();

    // Validation
    if (!requestData.vorname || !requestData.nachname || !requestData.email || 
        !requestData.telefon || !requestData.nachricht || !requestData.datenschutz) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Bitte alle Pflichtfelder ausfüllen und Datenschutz bestätigen." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending email for fahreranfrage from ${requestData.vorname} ${requestData.nachname}`);

    // Send email to business owner
    const emailResponse = await resend.emails.send({
      from: "Fahrerexpress <onboarding@resend.dev>",
      to: ["info@kraftfahrer-mieten.com"],
      subject: `Neue Fahreranfrage von ${requestData.vorname} ${requestData.nachname}`,
      html: `
        <h1>Neue Fahreranfrage eingegangen</h1>
        <h2>Kontaktdaten:</h2>
        <p><strong>Name:</strong> ${requestData.vorname} ${requestData.nachname}</p>
        <p><strong>E-Mail:</strong> ${requestData.email}</p>
        <p><strong>Telefon:</strong> ${requestData.telefon}</p>
        ${requestData.unternehmen ? `<p><strong>Unternehmen:</strong> ${requestData.unternehmen}</p>` : ''}
        
        <h2>Fahrbedarf:</h2>
        <p>${requestData.nachricht}</p>
        
        <p><em>Gesendet am ${new Date().toLocaleString('de-DE')}</em></p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Send confirmation email to customer
    const confirmationResponse = await resend.emails.send({
      from: "Fahrerexpress <onboarding@resend.dev>",
      to: [requestData.email],
      subject: "Bestätigung Ihrer Fahreranfrage",
      html: `
        <h1>Vielen Dank für Ihre Anfrage!</h1>
        <p>Hallo ${requestData.vorname},</p>
        <p>wir haben Ihre Fahreranfrage erfolgreich erhalten und werden uns zeitnah bei Ihnen melden.</p>
        <p>Ihre Anfrage wird von unserem Team geprüft und wir suchen den passenden Fahrer für Ihren Bedarf.</p>
        <p>Mit freundlichen Grüßen<br>Ihr Fahrerexpress-Team</p>
      `,
    });

    console.log("Confirmation email sent:", confirmationResponse);

    return new Response(
      JSON.stringify({ message: "Fahreranfrage erfolgreich gesendet" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-fahreranfrage function:", error);
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