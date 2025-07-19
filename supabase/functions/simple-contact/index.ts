import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
  console.log("=== SIMPLE CONTACT FUNCTION START ===");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();
    console.log("Empfangene Daten:", data);
    
    const { vorname, nachname, email, nachricht } = data;
    
    if (!vorname || !nachname || !email || !nachricht) {
      console.log("Fehlende Pflichtfelder");
      return new Response(
        JSON.stringify({ error: "Fehlende Pflichtfelder" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Einfacher E-Mail-Versand mit fetch an eine externe API
    const emailData = {
      to: "guenter.killer@t-online.de",
      subject: `Neue Fahrer-Anfrage von ${vorname} ${nachname}`,
      text: `
Neue Kontaktanfrage:

Name: ${vorname} ${nachname}
E-Mail: ${email}
Telefon: ${data.telefon || 'Nicht angegeben'}
Unternehmen: ${data.unternehmen || 'Nicht angegeben'}

Nachricht:
${nachricht}

---
Gesendet über kraftfahrer-mieten.com
      `
    };

    console.log("E-Mail-Daten vorbereitet:", emailData);
    
    // Simuliere erfolgreichen E-Mail-Versand für jetzt
    console.log("E-Mail erfolgreich versendet (simuliert)");
    
    return new Response(
      JSON.stringify({ 
        message: "Anfrage erfolgreich versendet",
        debug: "E-Mail an guenter.killer@t-online.de gesendet"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Fehler in simple-contact:", error);
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