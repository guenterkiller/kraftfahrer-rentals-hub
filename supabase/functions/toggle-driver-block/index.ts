import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlockDriverRequest {
  driverId: string;
  isBlocked: boolean;
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { driverId, isBlocked, reason }: BlockDriverRequest = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`🔄 ${isBlocked ? 'Blocking' : 'Unblocking'} driver ${driverId}`);

    const updateData: any = {
      is_blocked: isBlocked,
      updated_at: new Date().toISOString()
    };

    if (isBlocked) {
      updateData.blocked_at = new Date().toISOString();
      updateData.blocked_reason = reason || 'Keine Begründung angegeben';
    } else {
      updateData.blocked_at = null;
      updateData.blocked_reason = null;
    }

    const { error: updateError } = await supabase
      .from('fahrer_profile')
      .update(updateData)
      .eq('id', driverId);

    if (updateError) {
      console.error('❌ Failed to update driver block status:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update driver status' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`✅ Driver ${isBlocked ? 'blocked' : 'unblocked'} successfully`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Fahrer wurde ${isBlocked ? 'gesperrt' : 'entsperrt'}` 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error in toggle-driver-block function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
