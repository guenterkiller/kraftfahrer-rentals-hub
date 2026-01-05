import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  verifyAdminAuth, 
  createCorsHeaders, 
  handleCorsPreflightRequest,
  createErrorResponse 
} from "../_shared/admin-auth.ts";

interface CompleteOldJobsRequest {
  daysOld?: number;
}

serve(async (req) => {
  const corsHeaders = createCorsHeaders();
  
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(corsHeaders);
  }

  try {
    console.log('admin-complete-old-jobs v3.0-shared-auth called');
    
    // Verify admin authentication using shared helper
    const authResult = await verifyAdminAuth(req);
    if (!authResult.success) {
      return authResult.response;
    }
    const { user, supabase } = authResult;

    // Parse request body
    const { daysOld = 30 }: CompleteOldJobsRequest = await req.json();
    console.log('Request to complete jobs older than:', daysOld, 'days');

    // Call the database function using service role
    const { data, error } = await supabase.rpc('admin_mark_old_jobs_completed', {
      _days_old: daysOld
    });

    if (error) {
      console.error('Error calling admin_mark_old_jobs_completed:', error);
      throw error;
    }

    console.log('Complete old jobs response:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        message: data?.message || `${data?.updated_count || 0} alte Aufträge wurden als erledigt markiert.`
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('Error in admin-complete-old-jobs function:', error);
    return createErrorResponse('Fehler beim Abschließen alter Jobs', 500, corsHeaders);
  }
});
