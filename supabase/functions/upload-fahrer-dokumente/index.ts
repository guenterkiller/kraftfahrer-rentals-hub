// Deno Edge Function for secure document upload
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ALLOWED = new Set(["image/jpeg", "image/png", "application/pdf"]);
const MAX = 10 * 1024 * 1024; // 10 MB
const BUCKET = "fahrer-dokumente";
const ORIGINS = new Set([
  "https://www.kraftfahrer-mieten.com",
  "http://localhost:5173",
  "https://wyovmwbtniqcomqpppkk.supabase.co",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allow = origin && ORIGINS.has(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };
}

serve(async (req) => {
  console.log(`Upload request received: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    return new Response("", { headers: corsHeaders(req) });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // Service Role für Server-seitigen Upload
    );

    const form = await req.formData();
    const fahrer_id = String(form.get("fahrer_id") ?? "");
    const dokument_typ = String(form.get("dokument_typ") ?? "");
    const file = form.get("file") as File | null;

    console.log(`Processing upload - fahrer_id: ${fahrer_id}, type: ${dokument_typ}, file: ${file?.name}`);

    if (!fahrer_id || !dokument_typ || !file) {
      throw new Error("Pflichtfelder fehlen (fahrer_id, dokument_typ, file).");
    }

    if (!ALLOWED.has(file.type)) {
      throw new Error("Nur JPG/PNG/PDF erlaubt.");
    }
    
    if (file.size > MAX) {
      throw new Error("Datei größer als 10 MB.");
    }

    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!["jpg", "jpeg", "png", "pdf"].includes(ext)) {
      throw new Error("Unzulässige Dateiendung.");
    }

    const uuid = crypto.randomUUID();
    const path = `${fahrer_id}/${dokument_typ}/${uuid}.${ext}`;

    console.log(`Uploading to path: ${path}`);

    // Upload in privaten Bucket
    const { error: upErr } = await supabase
      .storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
        cacheControl: "3600",
      });
      
    if (upErr) {
      console.error("Storage upload error:", upErr);
      throw upErr;
    }

    console.log("File uploaded successfully, calculating checksum...");

    // Checksumme berechnen (optional, aber nützlich)
    const buf = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    const checksum = Array.from(new Uint8Array(digest))
      .map(b => b.toString(16).padStart(2, "0")).join("");

    console.log("Saving metadata to database...");

    // Metadaten in die Tabelle schreiben
    const { error: dbErr } = await supabase
      .from("fahrer_dokumente")
      .insert([{
        fahrer_id,
        bucket: BUCKET,
        filepath: path,
        filename: file.name,
        type: dokument_typ,
        url: path, // We store the path, not the full URL
        uploaded_at: new Date().toISOString(),
      }]);
      
    if (dbErr) {
      console.error("Database insert error:", dbErr);
      // Try to clean up uploaded file
      await supabase.storage.from(BUCKET).remove([path]);
      throw dbErr;
    }

    console.log("Metadata saved, creating signed URL...");

    // Kurzlebige Vorschau-URL für direkte Anzeige
    const { data: signed } = await supabase
      .storage.from(BUCKET)
      .createSignedUrl(path, 60);

    console.log("Upload completed successfully");

    return new Response(JSON.stringify({
      success: true,
      path,
      url: signed?.signedUrl ?? null,
      filename: file.name,
      type: dokument_typ
    }), { 
      headers: { 
        ...corsHeaders(req), 
        "Content-Type": "application/json" 
      } 
    });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("Upload error:", msg);
    return new Response(JSON.stringify({ 
      success: false, 
      error: msg 
    }), {
      status: 400, 
      headers: { 
        ...corsHeaders(req), 
        "Content-Type": "application/json" 
      }
    });
  }
});