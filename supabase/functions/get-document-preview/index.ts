import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { 
  verifyAdminAuth, 
  createCorsHeaders, 
  handleCorsPreflightRequest,
  createErrorResponse,
  logAdminAction 
} from "../_shared/admin-auth.ts";

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
    // Expected format: {uuid}/{doctype}/{uuid}.{ext}
    const validPathPattern = /^[a-f0-9-]+\/[a-z_-]+\/[a-f0-9-]+\.(jpg|jpeg|png|pdf|webp)$/i;
    if (!validPathPattern.test(filepath)) {
      console.error('Invalid filepath format:', filepath);
      return createErrorResponse('Invalid filepath format', 400, corsHeaders);
    }

    // Create signed URL with correct bucket priority
    let signedData: { signedUrl: string } | null = null;

    // Try 'driver-documents' bucket first
    const primary = await supabase.storage
      .from('driver-documents')
      .createSignedUrl(filepath, ttl);

    if (primary.error) {
      console.error('Primary bucket error, trying fallback:', primary.error);
      const fallback = await supabase.storage
        .from('fahrer-dokumente')
        .createSignedUrl(filepath, ttl);
      
      if (fallback.error) {
        console.error('Fallback bucket error:', fallback.error);
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
