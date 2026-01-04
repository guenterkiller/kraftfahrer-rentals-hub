import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      console.log("Unsubscribe attempt without token");
      return new Response(
        JSON.stringify({ success: false, error: "Token fehlt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing unsubscribe for token: ${token.substring(0, 8)}...`);

    // Find token in database
    const { data: tokenData, error: tokenError } = await supabase
      .from('customer_newsletter_tokens')
      .select('email, used_at')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.log(`Token not found: ${token.substring(0, 8)}...`);
      return new Response(
        JSON.stringify({ success: false, error: "Ungültiger oder abgelaufener Token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const email = tokenData.email.toLowerCase().trim();
    console.log(`Token valid for email: ${email}`);

    // Check if already used
    if (tokenData.used_at) {
      console.log(`Token already used at ${tokenData.used_at}`);
      // Still return success - the user is already unsubscribed
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Sie wurden bereits abgemeldet",
          email: email
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert into opt-out table (only affects customer newsletter!)
    const { error: optOutError } = await supabase
      .from('customer_newsletter_optout')
      .upsert(
        { email: email, opted_out_at: new Date().toISOString() },
        { onConflict: 'email' }
      );

    if (optOutError) {
      console.error("Opt-out upsert error:", optOutError);
      return new Response(
        JSON.stringify({ success: false, error: "Datenbankfehler" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark token as used
    await supabase
      .from('customer_newsletter_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    console.log(`Successfully unsubscribed: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Erfolgreich abgemeldet",
        email: email
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
