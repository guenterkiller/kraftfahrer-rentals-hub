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

interface FahrerAnfrageRequest {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message?: string;
  description?: string;
  license_classes?: string[];
  experience?: string;
  specializations?: string[];
  regions?: string[];
  hourly_rate?: string;
  // File uploads are handled separately and not part of this interface
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fahrer-Anfrage submission received");
    
    const requestData: FahrerAnfrageRequest = await req.json();

    // Validation - only name, email, and phone are required
    if (!requestData.name || !requestData.email || !requestData.phone) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Name, E-Mail und Telefon sind Pflichtfelder." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Processing fahrer request from ${requestData.name}`);

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "Kraftfahrer-Mieten <info@kraftfahrer-mieten.com>",
      to: ["info@kraftfahrer-mieten.com"],
      subject: `Neue Fahreranfrage von ${requestData.name}`,
      html: `
        <h2>Neue Fahreranfrage</h2>
        <p><strong>Name:</strong> ${requestData.name}</p>
        <p><strong>E-Mail:</strong> ${requestData.email}</p>
        <p><strong>Telefon:</strong> ${requestData.phone}</p>
        <p><strong>Unternehmen:</strong> ${requestData.company || 'nicht angegeben'}</p>
        <p><strong>Nachricht:</strong> ${requestData.message || 'nicht angegeben'}</p>
        <p><strong>Beschreibung:</strong> ${requestData.description || 'nicht angegeben'}</p>
        <p><strong>Führerscheinklassen:</strong> ${requestData.license_classes?.length ? requestData.license_classes.join(', ') : 'nicht angegeben'}</p>
        <p><strong>Erfahrung:</strong> ${requestData.experience || 'nicht angegeben'}</p>
        <p><strong>Spezialisierungen:</strong> ${requestData.specializations?.length ? requestData.specializations.join(', ') : 'nicht angegeben'}</p>
        <p><strong>Verfügbare Regionen:</strong> ${requestData.regions?.length ? requestData.regions.join(', ') : 'nicht angegeben'}</p>
        <p><strong>Stundensatz:</strong> ${requestData.hourly_rate || 'nicht angegeben'}</p>
        <p><em>Gesendet am ${new Date().toLocaleString('de-DE')}</em></p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
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
      JSON.stringify({ error: error.message || "Fehler beim Senden der Anfrage" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);