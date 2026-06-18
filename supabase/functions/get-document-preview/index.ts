import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { 
  verifyAdminAuth, 
  createCorsHeaders, 
  handleCorsPreflightRequest,
  createErrorResponse,
  logAdminAction 
} from "../_shared/admin-auth.ts";
import { 
  DRIVER_DOCS_BUCKET, 
  LEGACY_DRIVER_DOCS_BUCKET 
} from "../_shared/storage-config.ts";

serve(async (req) => {
  const corsHeaders = createCorsHeaders();
  
  console.log(`Document preview request: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(corsHeaders);
  }

  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(req);
    if (!authResult.success) {
      return authResult.response;
    }
    const { user, supabase } = authResult;

    // Parse request body
    const { filepath, ttl = 60 } = await req.json(); // Short TTL for security
    
    console.log(`Creating signed URL for: ${filepath}, TTL: ${ttl}s, Admin: ${user.id}`);

    if (!filepath) {
      return createErrorResponse('filepath is required', 400, corsHeaders);
    }

    // Validate filepath format to prevent directory traversal
    // Accepts both new format ({uuid}/{doctype}/{uuid}.{ext})
    // and legacy format (uploads/{email}/{doctype}_{n}.{ext})
    if (
      !filepath ||
      typeof filepath !== 'string' ||
      filepath.includes('..') ||
      filepath.startsWith('/') ||
      filepath.length > 500
    ) {
      console.error('Invalid filepath (traversal/format):', filepath);
      return createErrorResponse('Invalid filepath format', 400, corsHeaders);
    }
    const allowedExt = /\.(jpg|jpeg|png|pdf|webp)$/i;
    if (!allowedExt.test(filepath)) {
      console.error('Invalid file extension:', filepath);
      return createErrorResponse('Invalid filepath format', 400, corsHeaders);
    }

    // Create signed URL - try primary bucket first, then legacy bucket for backward compatibility
    let signedData: { signedUrl: string } | null = null;

    // Try primary bucket 'fahrer-dokumente' first
    const primary = await supabase.storage
      .from(DRIVER_DOCS_BUCKET)
      .createSignedUrl(filepath, ttl);

    if (primary.error) {
      console.log('Primary bucket failed:', {
        bucket: DRIVER_DOCS_BUCKET,
        storagePath: filepath,
        error: primary.error.message,
      });
      // Fallback to legacy 'driver-documents' bucket for old files
      const fallback = await supabase.storage
        .from(LEGACY_DRIVER_DOCS_BUCKET)
        .createSignedUrl(filepath, ttl);
      
      if (fallback.error) {
        console.error('Both buckets failed:', {
          primaryBucket: DRIVER_DOCS_BUCKET,
          legacyBucket: LEGACY_DRIVER_DOCS_BUCKET,
          storagePath: filepath,
          primaryError: primary.error.message,
          legacyError: fallback.error.message,
        });
        return createErrorResponse('File not found', 404, corsHeaders);
      }
      signedData = fallback.data as { signedUrl: string };
    } else {
      signedData = primary.data as { signedUrl: string };
    }

    // Log document access for audit trail
    await logAdminAction(supabase, 'document_preview_access', user.email, {
      note: `Accessed: ${filepath.substring(0, 50)}...`
    });

    console.log('Signed URL created successfully');

    return new Response(JSON.stringify({
      success: true,
      signedUrl: signedData!.signedUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Preview error:', msg);
    return createErrorResponse('Internal server error', 500, corsHeaders);
  }
});
