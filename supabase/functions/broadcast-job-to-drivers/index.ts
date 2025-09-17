import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false }}
);

const FN = "broadcast-job-to-drivers";

serve(async (req) => {
  try {
    // Optional: Flag hard check
    const { data: ff } = await sb
      .from("feature_flags")
      .select("enabled")
      .eq("flag_name", "JOB_BROADCAST_ENABLED")
      .maybeSingle();
    
    // Log every call
    await sb.from("admin_actions").insert({
      action: `DEPRECATED_${FN}_CALL`,
      job_id: null,
      assignment_id: null,
      admin_email: (await sb.from("admin_settings").select("admin_email").maybeSingle()).data?.admin_email ?? "info@kraftfahrer-mieten.com",
      note: await req.text().catch(() => "")
    });
  } catch {}
  
  return new Response(
    JSON.stringify({ error: "Deprecated endpoint. Use admin-only workflow." }), 
    { 
      status: 410, 
      headers: { "content-type": "application/json" }
    }
  );
});