import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  vorname: string;
  nachname: string;
  email: string;
  telefon?: string;
  unternehmen?: string;
  nachricht: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Contact form submission received");
    
    const { vorname, nachname, email, telefon, unternehmen, nachricht }: ContactRequest = await req.json();

    // Validation
    if (!vorname || !nachname || !email || !nachricht) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Alle Pflichtfelder müssen ausgefüllt werden." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending email for contact from ${vorname} ${nachname}`);

    // Send email to business owner
    const emailResponse = await resend.emails.send({
      from: "Kraftfahrer-Mieten <onboarding@resend.dev>",
      to: ["info@kraftfahrer-mieten.com"],
      subject: `Neue Fahrer-Anfrage von ${vorname} ${nachname}`,
      html: `
        <h2>Neue Fahrer-Anfrage</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Kontaktdaten:</h3>
          <p><strong>Name:</strong> ${vorname} ${nachname}</p>
          <p><strong>E-Mail:</strong> ${email}</p>
          ${telefon ? `<p><strong>Telefon:</strong> ${telefon}</p>` : ''}
          ${unternehmen ? `<p><strong>Unternehmen:</strong> ${unternehmen}</p>` : ''}
        </div>
        
        <div style="background: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3>Nachricht:</h3>
          <p style="white-space: pre-wrap;">${nachricht}</p>
        </div>
        
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Diese Anfrage wurde über das Kontaktformular auf kraftfahrer-mieten.com gesendet.
        </p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Send confirmation email to customer
    const confirmationResponse = await resend.emails.send({
      from: "Kraftfahrer-Mieten <onboarding@resend.dev>",
      to: [email],
      subject: "Bestätigung Ihrer Fahrer-Anfrage",
      html: `
        <h2>Vielen Dank für Ihre Anfrage!</h2>
        
        <p>Lieber ${vorname} ${nachname},</p>
        
        <p>wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
        
        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Ihre Anfrage:</h3>
          <p style="white-space: pre-wrap;">${nachricht}</p>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Kontakt für Rückfragen:</h3>
          <p><strong>Günter Killer</strong><br>
          Fahrerexpress-Agentur</p>
          <p>📱 Mobil: 01577 1442285<br>
          📧 E-Mail: info@kraftfahrer-mieten.com</p>
          <p><strong>Erreichbarkeit:</strong><br>
          Mo-Fr: 8:00 - 18:00 Uhr<br>
          Sa: 9:00 - 14:00 Uhr<br>
          Notfall: 24/7 verfügbar</p>
        </div>
        
        <p>Mit freundlichen Grüßen<br>
        Ihr Kraftfahrer-Mieten Team</p>
        
        <hr>
        <p style="color: #666; font-size: 12px;">
          Fahrerexpress-Agentur<br>
          Walther-von-Cronberg-Platz 12<br>
          60594 Frankfurt<br>
          www.kraftfahrer-mieten.com
        </p>
      `,
    });

    console.log("Confirmation email sent:", confirmationResponse);

    return new Response(
      JSON.stringify({ 
        message: "E-Mails erfolgreich versendet",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unbekannter Fehler beim E-Mail-Versand" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);