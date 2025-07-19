import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface FahrerAnfrage {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  adresse?: string;
  plz?: string;
  ort?: string;
  fuehrerscheinklassen: string[];
  erfahrung_jahre?: number;
  stundensatz?: number;
  spezialisierungen: string[];
  verfuegbare_regionen: string[];
  verfuegbarkeit?: string;
  beschreibung?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fahrer-Anfrage submission received");
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const fahrerData: FahrerAnfrage = await req.json();

    // Validation
    if (!fahrerData.vorname || !fahrerData.nachname || !fahrerData.email || !fahrerData.telefon) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Alle Pflichtfelder müssen ausgefüllt werden." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Saving fahrer application from ${fahrerData.vorname} ${fahrerData.nachname}`);

    // Insert into fahrer_profile table
    const { data, error } = await supabase
      .from('fahrer_profile')
      .insert([{
        vorname: fahrerData.vorname,
        nachname: fahrerData.nachname,
        email: fahrerData.email,
        telefon: fahrerData.telefon,
        adresse: fahrerData.adresse || null,
        plz: fahrerData.plz || null,
        ort: fahrerData.ort || null,
        fuehrerscheinklassen: fahrerData.fuehrerscheinklassen || [],
        erfahrung_jahre: fahrerData.erfahrung_jahre || null,
        stundensatz: fahrerData.stundensatz || null,
        spezialisierungen: fahrerData.spezialisierungen || [],
        verfuegbare_regionen: fahrerData.verfuegbare_regionen || [],
        verfuegbarkeit: fahrerData.verfuegbarkeit || null,
        beschreibung: fahrerData.beschreibung || null,
        status: 'pending'
      }])
      .select();

    if (error) {
      console.error("Database error:", error);
      
      // Bessere Fehlerbehandlung für häufige Probleme
      if (error.code === '23505' && error.message.includes('email_key')) {
        throw new Error("Diese E-Mail-Adresse ist bereits registriert. Bitte verwenden Sie eine andere E-Mail-Adresse.");
      }
      
      throw new Error(error.message || "Fehler beim Speichern der Bewerbung");
    }

    console.log("Fahrer application saved successfully:", data);

    // Send email notification
    try {
      console.log(`Sending email notification for fahrer application from ${fahrerData.vorname} ${fahrerData.nachname}`);
      
      const emailResponse = await resend.emails.send({
        from: "Fahrerexpress <onboarding@resend.dev>",
        to: ["guenter.killer@t-online.de"],
        subject: `Neue Fahrer-Bewerbung von ${fahrerData.vorname} ${fahrerData.nachname}`,
        html: `
          <h1>Neue Fahrer-Bewerbung eingegangen</h1>
          <h2>Persönliche Daten:</h2>
          <p><strong>Name:</strong> ${fahrerData.vorname} ${fahrerData.nachname}</p>
          <p><strong>E-Mail:</strong> ${fahrerData.email}</p>
          <p><strong>Telefon:</strong> ${fahrerData.telefon}</p>
          ${fahrerData.adresse ? `<p><strong>Adresse:</strong> ${fahrerData.adresse}</p>` : ''}
          ${fahrerData.plz ? `<p><strong>PLZ:</strong> ${fahrerData.plz}</p>` : ''}
          ${fahrerData.ort ? `<p><strong>Ort:</strong> ${fahrerData.ort}</p>` : ''}
          
          <h2>Berufliche Angaben:</h2>
          ${fahrerData.fuehrerscheinklassen?.length ? `<p><strong>Führerscheinklassen:</strong> ${fahrerData.fuehrerscheinklassen.join(', ')}</p>` : ''}
          ${fahrerData.erfahrung_jahre ? `<p><strong>Erfahrung:</strong> ${fahrerData.erfahrung_jahre} Jahre</p>` : ''}
          ${fahrerData.stundensatz ? `<p><strong>Stundensatz:</strong> ${fahrerData.stundensatz} €</p>` : ''}
          ${fahrerData.spezialisierungen?.length ? `<p><strong>Spezialisierungen:</strong> ${fahrerData.spezialisierungen.join(', ')}</p>` : ''}
          ${fahrerData.verfuegbare_regionen?.length ? `<p><strong>Verfügbare Regionen:</strong> ${fahrerData.verfuegbare_regionen.join(', ')}</p>` : ''}
          ${fahrerData.verfuegbarkeit ? `<p><strong>Verfügbarkeit:</strong> ${fahrerData.verfuegbarkeit}</p>` : ''}
          
          ${fahrerData.beschreibung ? `<h2>Beschreibung:</h2><p>${fahrerData.beschreibung}</p>` : ''}
          
          <p><em>Gesendet am ${new Date().toLocaleString('de-DE')}</em></p>
        `,
      });

      console.log("Email sent successfully:", emailResponse);

      // Send confirmation email to applicant
      const confirmationResponse = await resend.emails.send({
        from: "Fahrerexpress <onboarding@resend.dev>",
        to: [fahrerData.email],
        subject: "Bestätigung Ihrer Fahrer-Bewerbung",
        html: `
          <h1>Vielen Dank für Ihre Bewerbung!</h1>
          <p>Hallo ${fahrerData.vorname},</p>
          <p>wir haben Ihre Bewerbung als Fahrer erfolgreich erhalten und werden diese zeitnah prüfen.</p>
          <p>Sie erhalten in Kürze eine Rückmeldung von uns.</p>
          <p>Mit freundlichen Grüßen<br>Ihr Fahrerexpress-Team</p>
        `,
      });

      console.log("Confirmation email sent:", confirmationResponse);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Continue execution even if email fails
    }

    return new Response(
      JSON.stringify({ 
        message: "Fahrer-Bewerbung erfolgreich eingereicht",
        data: data 
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
    console.error("Error in submit-fahrer-anfrage function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unbekannter Fehler beim Speichern der Bewerbung" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);