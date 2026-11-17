import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { dispatchReleasedJobToContractDrivers, type ReleasedJobOfferSummary } from "../_shared/driver-job-offers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fahrer mit angenommener aktueller Vertragsfassung erhalten bei Freigabe das bestehende
// Interessenangebot MIT Nettovergütung (dedupliziert); die Sammel-Rundmail schließt sie aus.
async function offerToContractDrivers(supabase: any, jobId: string, adminEmail: string): Promise<ReleasedJobOfferSummary | { error: string }> {
  try {
    const { data: job, error } = await supabase.from("job_requests").select("*").eq("id", jobId).single();
    if (error || !job) throw new Error("Auftrag konnte nach Freigabe nicht gelesen werden");
    const summary = await dispatchReleasedJobToContractDrivers({
      supabase,
      resend: new Resend(Deno.env.get("RESEND_API_KEY")),
      job,
      mailFrom: Deno.env.get("MAIL_FROM") ?? "info@kraftfahrer-mieten.com",
      mailReplyTo: Deno.env.get("MAIL_REPLY_TO") || "info@kraftfahrer-mieten.com",
      tokenSecret: Deno.env.get("INTERNAL_FN_SECRET") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      siteBase: Deno.env.get("SITE_URL") || "https://www.kraftfahrer-mieten.com",
    });
    await supabase.from("admin_actions").insert({
      action: "job_contract_driver_offers",
      job_id: jobId,
      admin_email: adminEmail,
      note: `Angebote mit Nettovergütung: gesendet=${summary.invitesSent}, bereits vorhanden=${summary.skippedDuplicate}, unpassend=${summary.skippedNoMatch}, ` +
        `vergeben=${summary.skippedAssigned}, fehlgeschlagen=${summary.failed}, Vertragsfahrer=${summary.contractDrivers}, Testfahrer ausgeschlossen=${summary.excludedTestDrivers}` +
        (summary.skipped ? `, übersprungen=${summary.skipped}` : ""),
    });
    return summary;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Angebote an Vertragsfahrer fehlgeschlagen:", message);
    return { error: message };
  }
}

interface ApproveJobRequest {
  jobId: string;
  action: 'approve' | 'reject';
  adminEmail?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Verify JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.error("Not an admin:", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: ApproveJobRequest = await req.json();
    const { jobId, action } = body;
    const adminEmail = user.email || body.adminEmail || "unknown";

    if (!jobId || !action) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: jobId, action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${adminEmail} is ${action}ing job ${jobId}`);

    // Fetch the job first to check current status
    const { data: job, error: fetchError } = await supabase
      .from("job_requests")
      .select("*")
      .eq("id", jobId)
      .single();

    if (fetchError || !job) {
      console.error("Job not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Idempotenz-Check: Bereits versendet?
    if (job.status === 'sent') {
      console.log("Job already sent, skipping duplicate broadcast");
      // Keine zweite Sammel-Rundmail; nur der deduplizierte Abgleich für Vertragsfahrer (Nachholversand).
      const contractOffers = action === 'approve' ? await offerToContractDrivers(supabase, jobId, adminEmail) : null;
      const offered = contractOffers && "invitesSent" in contractOffers ? contractOffers.invitesSent : 0;
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Job wurde bereits an Fahrer gesendet; neue Angebote mit Vergütung: ${offered}`,
          alreadySent: true,
          sentAt: job.sent_at,
          contractOffers,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'reject') {
      // Ablehnen: Status auf 'rejected' setzen
      const { error: updateError } = await supabase
        .from("job_requests")
        .update({
          status: 'rejected',
          approved_at: new Date().toISOString(),
          approved_by: adminEmail,
        })
        .eq("id", jobId);

      if (updateError) {
        console.error("Error updating job status:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to reject job" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Log admin action
      await supabase.from("admin_actions").insert({
        action: "job_rejected",
        job_id: jobId,
        admin_email: adminEmail,
        note: "Anfrage abgelehnt - keine Fahrer-E-Mails versendet",
      });

      console.log(`Job ${jobId} rejected by ${adminEmail}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Anfrage wurde abgelehnt",
          status: 'rejected'
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'approve') {
      // Schritt 1: Status auf 'approved' setzen
      const { error: approveError } = await supabase
        .from("job_requests")
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: adminEmail,
        })
        .eq("id", jobId);

      if (approveError) {
        console.error("Error approving job:", approveError);
        return new Response(
          JSON.stringify({ error: "Failed to approve job" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Job ${jobId} approved by ${adminEmail}, now broadcasting...`);

      // Schritt 1b: Vertragsfahrer erhalten das Interessenangebot mit Nettovergütung
      const contractOffers = await offerToContractDrivers(supabase, jobId, adminEmail);
      const offered = "invitesSent" in contractOffers ? contractOffers.invitesSent : 0;

      // Schritt 2: Broadcast an Fahrer auslösen
      const broadcastResponse = await fetch(`${supabaseUrl}/functions/v1/broadcast-job-to-drivers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          jobRequestId: jobId,
        }),
      });

      const broadcastResult = await broadcastResponse.json();
      console.log("Broadcast result:", broadcastResult);

      // Schritt 3: Status auf 'sent' setzen nach erfolgreichem Versand
      if (broadcastResult.success) {
        const { error: sentError } = await supabase
          .from("job_requests")
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        if (sentError) {
          console.error("Error updating sent status:", sentError);
        }

        // Log admin action
        await supabase.from("admin_actions").insert({
          action: "job_approved_and_sent",
          job_id: jobId,
          admin_email: adminEmail,
          note: `Freigegeben und an ${broadcastResult.sentToCount || 0} Fahrer (Rundmail) sowie ${offered} Vertragsfahrer (Angebot mit Vergütung) gesendet`,
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Anfrage freigegeben und an ${broadcastResult.sentToCount || 0} Fahrer sowie ${offered} Vertragsfahrer mit Vergütung gesendet`,
            status: 'sent',
            sentToCount: broadcastResult.sentToCount || 0,
            contractOffers,
            sent: broadcastResult.sent || 0,
            failed: broadcastResult.failed || 0,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Broadcast fehlgeschlagen, aber Freigabe bleibt bestehen
        console.error("Broadcast failed:", broadcastResult.error);
        
        await supabase.from("admin_actions").insert({
          action: "job_approved_broadcast_failed",
          job_id: jobId,
          admin_email: adminEmail,
          note: `Freigegeben, aber Versand fehlgeschlagen: ${broadcastResult.error}`,
        });

        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Freigabe erfolgt, aber Versand fehlgeschlagen",
            error: broadcastResult.error,
            status: 'approved',
            contractOffers,
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'approve' or 'reject'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Unexpected error in admin-approve-job:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
