import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { verifyAdminAuth, createCorsHeaders, handleCorsPreflightRequest } from '../_shared/admin-auth.ts';

const corsHeaders = createCorsHeaders();

interface ResetDriverRequest {
  driverId: string;
  newStatus: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(corsHeaders);
  }

  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.success) return authResult.response;
    const supabase = authResult.supabase;

    const { driverId, newStatus }: ResetDriverRequest = await req.json();

    console.log(`🔄 Resetting driver ${driverId} status to ${newStatus}`);

    // Update driver status
    const { error: updateError } = await supabase
      .from('fahrer_profile')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', driverId);

    if (updateError) {
      console.error('❌ Failed to update driver status:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update driver status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Driver status updated to ${newStatus}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Driver status updated to ${newStatus}` 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error in reset-driver-status function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);