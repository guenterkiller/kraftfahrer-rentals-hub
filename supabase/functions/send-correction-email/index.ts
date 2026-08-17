import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const provided = req.headers.get("x-internal-secret");
  const expected = Deno.env.get("INTERNAL_FN_SECRET");
  if (!expected || provided !== expected) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
  const { to, subject, html } = await req.json();
  if (!to || !subject || !html) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
  const res = await resend.emails.send({
    from: "Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>",
    to: [to],
    subject,
    html,
  });
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (supabaseUrl && supabaseKey) {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.52.0");
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("email_log").insert({
      recipient: to,
      subject,
      template: "customer_tariff_correction",
      status: res.error ? "failed" : "sent",
      sent_at: res.error ? null : new Date().toISOString(),
      message_id: res.data?.id ?? null,
      error_message: res.error ? String(res.error.message ?? res.error) : null,
    });
  }
  return new Response(JSON.stringify(res), { status: res.error ? 500 : 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
});
