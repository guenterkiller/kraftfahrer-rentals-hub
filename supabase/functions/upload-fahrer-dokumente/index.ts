import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png', 
  'application/pdf'
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Document upload request received");
    
    const formData = await req.formData();
    const fahrer_id = formData.get("fahrer_id") as string;
    const dokument_typ = formData.get("dokument_typ") as string;
    const file = formData.get("file") as File;

    // Validation
    if (!fahrer_id || !dokument_typ || !file) {
      return new Response(
        JSON.stringify({ 
          error: "Fahrer-ID, Dokumenttyp und Datei sind erforderlich" 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return new Response(
        JSON.stringify({ 
          error: `Dateityp nicht erlaubt: ${file.type}. Nur JPG, PNG, PDF erlaubt.` 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ 
          error: `Datei zu groß: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum 10MB erlaubt.` 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log(`Uploading file for fahrer_id: ${fahrer_id}, type: ${dokument_typ}, size: ${file.size}, mime: ${file.type}`);

    // Generate unique filename with UUID
    const uuid = crypto.randomUUID();
    const fileExtension = file.name.split('.').pop() || (file.type === 'application/pdf' ? 'pdf' : 'jpg');
    const fileName = `${fahrer_id}/${dokument_typ}/${uuid}.${fileExtension}`;
    
    console.log(`Generated path: ${fileName}`);

    // Upload to Supabase Storage bucket 'fahrer-dokumente'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fahrer-dokumente')
      .upload(fileName, file, { 
        upsert: false, // No overwrite, each file gets unique name
        contentType: file.type 
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return new Response(
        JSON.stringify({ 
          error: `Fehler beim Hochladen: ${uploadError.message}` 
        }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log("File uploaded successfully to storage:", uploadData.path);

    // Insert metadata into fahrer_dokumente table
    const { data: dbData, error: dbError } = await supabase
      .from('fahrer_dokumente')
      .insert({
        fahrer_id,
        bucket: 'fahrer-dokumente',
        filepath: uploadData.path,
        filename: file.name,
        type: dokument_typ,
        url: uploadData.path, // We'll generate signed URLs on-demand
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Try to clean up uploaded file
      await supabase.storage
        .from('fahrer-dokumente')
        .remove([uploadData.path]);
      
      return new Response(
        JSON.stringify({ 
          error: `Fehler beim Speichern der Metadaten: ${dbError.message}` 
        }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log("Metadata saved successfully:", dbData);

    // Generate signed URL for immediate preview (60 seconds)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('fahrer-dokumente')
      .createSignedUrl(uploadData.path, 60);

    let signedUrl = null;
    if (!signedUrlError && signedUrlData) {
      signedUrl = signedUrlData.signedUrl;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: signedUrl,
        filename: file.name,
        path: uploadData.path,
        type: dokument_typ
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in upload-fahrer-dokumente function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unbekannter Fehler beim Upload" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);