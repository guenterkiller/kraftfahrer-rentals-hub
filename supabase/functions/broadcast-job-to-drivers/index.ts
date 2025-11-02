import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { JobNotificationEmail } from "./_templates/job-notification.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-fn",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface BroadcastRequest {
  jobRequestId: string;
  job?: {
    fahrzeugtyp: string;
    fuehrerscheinklasse?: string;
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
}

// Token-Generierung (48 Zeichen)
function randomToken(len = 48): string {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => ("0" + b.toString(16)).slice(-2)).join("").slice(0, len);
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    const { email, jobId } = body;
    const jobRequestId = jobId;

    // Validate admin email
    const ADMIN_EMAIL = "guenter.killer@t-online.de";
    if (email !== ADMIN_EMAIL) {
      console.error("Unauthorized access attempt by:", email);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobRequestId) {
      return new Response(
        JSON.stringify({ error: "jobRequestId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Broadcasting job to drivers:", jobRequestId);

    // Fetch full job details
    const { data: job, error: jobError } = await supabase
      .from("job_requests")
      .select("*")
      .eq("id", jobRequestId)
      .single();

    if (jobError || !job) {
      console.error("Job not found:", jobError);
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all approved drivers with email addresses
    const { data: drivers, error: driversError } = await supabase
      .from("fahrer_profile")
      .select("id, vorname, nachname, email")
      .eq("status", "approved")
      .not("email", "is", null);

    if (driversError) {
      console.error("Error fetching drivers:", driversError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch drivers" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!drivers || drivers.length === 0) {
      console.log("No approved drivers found");
      return new Response(
        JSON.stringify({ success: true, message: "No approved drivers to notify", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${drivers.length} approved drivers to notify`);

    // Send email to each driver
    let successCount = 0;
    let errorCount = 0;

    for (const driver of drivers) {
      try {
        // Generate unique token and store invitation
        const token = randomToken(48);
        const tokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48 Stunden

        const { error: inviteError } = await supabase
          .from('assignment_invites')
          .insert({
            job_id: jobRequestId,
            driver_id: driver.id,
            token: token,
            token_expires_at: tokenExpiresAt.toISOString(),
            status: 'pending'
          });

        if (inviteError) {
          console.error(`Failed to create invite for driver ${driver.id}:`, inviteError);
          errorCount++;
          continue;
        }

        // Generate URLs with custom domain (user-friendly)
        const baseUrl = `https://kraftfahrer-mieten.com/functions/v1/handle-driver-job-response`;
        const acceptUrl = `${baseUrl}?a=accept&t=${encodeURIComponent(token)}`;
        const declineUrl = `${baseUrl}?a=decline&t=${encodeURIComponent(token)}`;

        const html = await renderAsync(
          React.createElement(JobNotificationEmail, {
            driverName: `${driver.vorname} ${driver.nachname}`,
            driverId: driver.id,
            jobId: jobRequestId,
            customerName: job.customer_name || "Unbekannt",
            company: job.company,
            einsatzort: job.einsatzort || "Keine Angabe",
            zeitraum: job.zeitraum || "Nach Absprache",
            fahrzeugtyp: job.fahrzeugtyp || "LKW",
            fuehrerscheinklasse: job.fuehrerscheinklasse || "C+E",
            nachricht: job.nachricht || "Keine weiteren Informationen",
            besonderheiten: job.besonderheiten,
            acceptUrl: acceptUrl,
            declineUrl: declineUrl,
          })
        );

        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: Deno.env.get("MAIL_FROM") || "Kraftfahrer-Mieten <noreply@kraftfahrer-mieten.com>",
          to: [driver.email],
          subject: `Neuer Auftrag: ${job.fahrzeugtyp} in ${job.einsatzort}`,
          html,
        });

        if (emailError) {
          console.error(`Failed to send email to ${driver.email}:`, emailError);
          errorCount++;

          // Log failed email
          const { error: logError } = await supabase.from("email_log").insert({
            recipient: driver.email,
            subject: `Neuer Auftrag: ${job.fahrzeugtyp} in ${job.einsatzort}`,
            template: "job-broadcast",
            status: "failed",
            error_message: emailError.message || String(emailError),
            job_id: jobRequestId,
          });
          
          if (logError) {
            console.error(`❌ Failed to log failed email for ${driver.email}:`, logError);
          } else {
            console.log(`✅ Failed email log saved for ${driver.email}`);
          }
        } else {
          console.log(`Email sent successfully to ${driver.email}`);
          successCount++;

          // Log successful email
          const { error: logError } = await supabase.from("email_log").insert({
            recipient: driver.email,
            subject: `Neuer Auftrag: ${job.fahrzeugtyp} in ${job.einsatzort}`,
            template: "job-broadcast",
            status: "sent",
            sent_at: new Date().toISOString(),
            job_id: jobRequestId,
            message_id: emailResult?.id || null,
          });
          
          if (logError) {
            console.error(`❌ Failed to log successful email for ${driver.email}:`, logError);
          } else {
            console.log(`✅ Email log saved for ${driver.email}`);
          }

          // Log to job_mail_log
          await supabase.rpc("log_job_mail", {
            p_job_request_id: jobRequestId,
            p_fahrer_id: driver.id,
            p_email: driver.email,
            p_status: "sent",
            p_subject: `Neuer Auftrag: ${job.fahrzeugtyp} in ${job.einsatzort}`,
            p_mail_template: "job-broadcast",
            p_driver_snapshot: {
              vorname: driver.vorname,
              nachname: driver.nachname,
              email: driver.email,
            },
            p_meta: { resend_id: emailResult?.id },
          });
        }

        // Rate limit protection: Wait 1000ms between emails (1 email/second, safely under Resend's 2/second limit)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error processing driver ${driver.id}:`, error);
        errorCount++;
      }
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      action: "job_broadcast_completed",
      job_id: jobRequestId,
      admin_email: Deno.env.get("ADMIN_EMAIL") || "info@kraftfahrer-mieten.com",
      note: `Broadcast sent to ${successCount} drivers, ${errorCount} failed`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Job broadcast completed",
        sentToCount: successCount,
        total: drivers.length,
        sent: successCount,
        failed: errorCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Unexpected error in broadcast-job-to-drivers:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
