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
  "https://hxnabnsoffzevqhruvar.supabase.co",
]);

// Magic byte signatures for file validation
const FILE_SIGNATURES = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  jpeg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
};

// Validate file content by checking magic bytes
function validateMagicBytes(bytes: Uint8Array, ext: string): boolean {
  if (ext === 'pdf') {
    return FILE_SIGNATURES.pdf.every((byte, i) => bytes[i] === byte);
  } else if (ext === 'jpg' || ext === 'jpeg') {
    return FILE_SIGNATURES.jpeg.every((byte, i) => bytes[i] === byte);
  } else if (ext === 'png') {
    return FILE_SIGNATURES.png.every((byte, i) => bytes[i] === byte);
  }
  return false;
}

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

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
    // Create client for auth check
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization") || "";
    const { data: { user }, error: userErr } = await authClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userErr || !user) {
      console.error('Unauthorized: No valid user');
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const form = await req.formData();
    const fahrer_id = String(form.get("fahrer_id") ?? "");
    const dokument_typ = String(form.get("dokument_typ") ?? "");
    const file = form.get("file") as File | null;

    console.log(`Processing upload - fahrer_id: ${fahrer_id}, type: ${dokument_typ}, file: ${file?.name}`);

    if (!fahrer_id || !dokument_typ || !file) {
      throw new Error("Pflichtfelder fehlen (fahrer_id, dokument_typ, file).");
    }

    // Ownership check - user can only upload for themselves
    if (fahrer_id !== user.id) {
      console.error('Forbidden: User cannot upload for another driver');
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Create service role client for actual upload
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

    // Validate file content via magic bytes
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    if (bytes.length < 8) {
      throw new Error("Datei ungültig oder leer.");
    }
    
    if (!validateMagicBytes(bytes, ext)) {
      throw new Error(`Dateiinhalt stimmt nicht mit Dateityp überein: ${ext}`);
    }

    // Sanitize document type for path
    const safeDocType = sanitizeFilename(dokument_typ);
    const uuid = crypto.randomUUID();
    const path = `${fahrer_id}/${safeDocType}/${uuid}.${ext}`;

    console.log(`Uploading to path: ${path} (content validated)`);

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
      const errMsg = upErr instanceof Error ? upErr.message : (() => { try { return JSON.stringify(upErr); } catch { return String(upErr); } })();
      throw new Error(errMsg);
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
    const msg = e instanceof Error ? e.message : (() => { try { return JSON.stringify(e); } catch { return String(e); } })();
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