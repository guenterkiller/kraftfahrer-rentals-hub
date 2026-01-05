import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  verifyAdminAuth, 
  createCorsHeaders, 
  handleCorsPreflightRequest,
  createErrorResponse,
  logAdminAction 
} from "../_shared/admin-auth.ts";

serve(async (req) => {
  const corsHeaders = createCorsHeaders();
  
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(corsHeaders);
  }

  try {
    console.log('admin-reset-jobs v3.0-shared-auth called');
    
    // Verify admin authentication using shared helper
    const authResult = await verifyAdminAuth(req);
    if (!authResult.success) {
      return authResult.response;
    }
    const { user, supabase } = authResult;

    // Call the database function using service role
    const { data, error } = await supabase.rpc('admin_reset_jobs_by_email', {
      _email: user.email
    });

    if (error) {
      console.error('Error calling admin_reset_jobs_by_email:', error);
      throw error;
    }

    console.log('Reset jobs response:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: `${data?.jobs_updated || 0} Jobs zurückgesetzt und ${data?.assignments_deleted || 0} Zuweisungen gelöscht.`
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in admin-reset-jobs function:', error);
    return createErrorResponse('Fehler beim Zurücksetzen der Jobs', 500, corsHeaders);
  }
});
