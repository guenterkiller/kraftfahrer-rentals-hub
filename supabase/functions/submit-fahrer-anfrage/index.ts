import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
      throw new Error(error.message);
    }

    console.log("Fahrer application saved successfully:", data);

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