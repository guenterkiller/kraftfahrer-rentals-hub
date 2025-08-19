// Supabase Edge Function: create or get driver profile by email
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();

    const email: string = (body?.email || "").trim();
    if (!email) {
      return new Response(JSON.stringify({ success: false, error: "E-Mail fehlt" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if a driver already exists for this email
    const { data: existing, error: checkErr } = await supabase
      .from("fahrer_profile")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (checkErr) {
      console.error("Lookup error:", checkErr);
      return new Response(JSON.stringify({ success: false, error: "Lookup fehlgeschlagen" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (existing?.id) {
      console.log("Driver already exists for", email, existing.id);
      return new Response(JSON.stringify({ success: true, id: existing.id, existed: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Prepare insert data
    const cleanedRate = typeof body?.stundensatz === "string"
      ? body.stundensatz.replace(/[^\d.,]/g, "").replace(",", ".")
      : body?.stundensatz;
    const parsedRate = cleanedRate ? parseFloat(cleanedRate) : null;

    const insertData: Record<string, unknown> = {
      vorname: body?.vorname || "",
      nachname: body?.nachname || "",
      email,
      telefon: body?.telefon || "",
      adresse: body?.adresse || null,
      plz: body?.plz || null,
      ort: body?.ort || null,
      beschreibung: body?.beschreibung || null,
      fuehrerscheinklassen: Array.isArray(body?.fuehrerscheinklassen) ? body.fuehrerscheinklassen : [],
      erfahrung_jahre: body?.erfahrung_jahre ? parseInt(String(body.erfahrung_jahre)) : null,
      spezialisierungen: Array.isArray(body?.spezialisierungen) ? body.spezialisierungen : [],
      verfuegbare_regionen: Array.isArray(body?.verfuegbare_regionen) ? body.verfuegbare_regionen : [],
      stundensatz: isNaN(Number(parsedRate)) ? null : parsedRate,
      verfuegbarkeit: body?.verfuegbarkeit || null,
      status: "pending",
    };

    const { data: inserted, error: insErr } = await supabase
      .from("fahrer_profile")
      .insert([insertData])
      .select("id")
      .single();

    if (insErr) {
      console.error("Insert error:", insErr);
      const status = (insErr as any)?.code === "23505" ? 409 : 500;
      return new Response(JSON.stringify({ success: false, error: "Erstellen fehlgeschlagen" }), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true, id: inserted.id, existed: false }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error("create-or-get-fahrer unexpected error:", e);
    return new Response(JSON.stringify({ success: false, error: "Unerwarteter Fehler" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
