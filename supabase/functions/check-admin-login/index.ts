import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * DEPRECATED: This function is deprecated and should not be used.
 * Admin authentication should be done via Supabase Auth + user_roles table.
 * 
 * This endpoint is kept for backward compatibility but always returns an error
 * directing users to use the proper authentication flow.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('⚠️ check-admin-login called - this endpoint is deprecated');

  // Log deprecation warning
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: 'Diese Authentifizierungsmethode ist veraltet. Bitte verwenden Sie die Supabase-Authentifizierung über /admin/login.',
      deprecated: true
    }),
    { 
      status: 410, // Gone - resource no longer available
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    }
  );
});
