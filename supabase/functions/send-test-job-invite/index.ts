import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { JobNotificationEmail } from "./_templates/job-notification.tsx";
import { makeDriverUnsubscribeToken, buildDriverUnsubscribeUrl } from "../_shared/driver-unsubscribe-token.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_TEST_EMAIL = "guenter.killer@t-online.de";

function randomToken(len = 48): string {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => ("0" + b.toString(16)).slice(-2)).join("").slice(0, len);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleData } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { jobId, driverId, driverEmail } = body as { jobId?: string; driverId?: string; driverEmail?: string };

    if (!jobId) {
      return new Response(JSON.stringify({ error: "jobId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch job
    const { data: job, error: jobErr } = await supabase
      .from("job_requests").select("*").eq("id", jobId).single();
    if (jobErr || !job) {
      return new Response(JSON.stringify({ error: "Job not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve test driver
    let driver: { id: string; vorname: string; nachname: string; email: string } | null = null;

    if (driverId) {
      const { data: d } = await supabase
        .from("fahrer_profile")
        .select("id, vorname, nachname, email, status, is_blocked, email_opt_out")
        .eq("id", driverId).maybeSingle();
      if (!d) {
        return new Response(JSON.stringify({ error: "Driver not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Safety: must not be blocked or opted out
      if (d.is_blocked || d.email_opt_out) {
        return new Response(JSON.stringify({ error: "Driver is blocked or opted out – test send refused" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!d.email) {
        return new Response(JSON.stringify({ error: "Driver has no email" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      driver = { id: d.id, vorname: d.vorname, nachname: d.nachname, email: d.email };
    } else {
      const targetEmail = (driverEmail || DEFAULT_TEST_EMAIL).toLowerCase().trim();
      const { data: d } = await supabase
        .from("fahrer_profile")
        .select("id, vorname, nachname, email, is_blocked, email_opt_out")
        .ilike("email", targetEmail).maybeSingle();
      if (d) {
        if (d.is_blocked || d.email_opt_out) {
          return new Response(JSON.stringify({ error: "Test driver profile is blocked or opted out" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        driver = { id: d.id, vorname: d.vorname, nachname: d.nachname, email: d.email };
      } else {
        // No profile found: still allow send, but cannot create assignment_invite (needs driver_id)
        driver = { id: "", vorname: "Test", nachname: "Empfänger", email: targetEmail };
      }
    }

    // Fetch attachments → signed URLs (7 days)
    const { data: attachmentRows } = await supabase
      .from("job_attachments").select("filename, filepath").eq("job_id", jobId);
    const attachments: Array<{ filename: string; url: string }> = [];
    for (const a of attachmentRows || []) {
      const { data: signed } = await supabase.storage
        .from("job-attachments")
        .createSignedUrl(a.filepath, 60 * 60 * 24 * 7);
      if (signed?.signedUrl) attachments.push({ filename: a.filename, url: signed.signedUrl });
    }

    // Optional assignment_invite (only if we have a real driver profile)
    let acceptUrl: string | undefined;
    let declineUrl: string | undefined;
    if (driver.id) {
      const inviteToken = randomToken(48);
      const expires = new Date(Date.now() + 1000 * 60 * 60 * 48);
      const { error: invErr } = await supabase.from("assignment_invites").insert({
        job_id: jobId, driver_id: driver.id, token: inviteToken,
        token_expires_at: expires.toISOString(), status: "pending",
      });
      if (invErr) console.error("invite insert error:", invErr);
      const SITE_BASE = Deno.env.get("SITE_URL") || "https://www.kraftfahrer-mieten.com";
      acceptUrl = `${SITE_BASE}/fahrer-antwort-bestaetigen?action=accept&token=${encodeURIComponent(inviteToken)}`;
      declineUrl = `${SITE_BASE}/fahrer-antwort-bestaetigen?action=decline&token=${encodeURIComponent(inviteToken)}`;
    }

    const unsubSecret = Deno.env.get("INTERNAL_FN_SECRET") || "";
    const unsubscribeUrl = driver.id && unsubSecret
      ? buildDriverUnsubscribeUrl(await makeDriverUnsubscribeToken(driver.id, unsubSecret))
      : undefined;

    const html = await renderAsync(
      React.createElement(JobNotificationEmail, {
        driverName: `${driver.vorname} ${driver.nachname}`.trim(),
        driverId: driver.id || "test",
        jobId,
        einsatzort: job.einsatzort || "Keine Angabe",
        zeitraum: (job.zeitraum || "Nach Absprache").replace(/\s*Tag\(e\)\s*$/i, "").trim(),
        fahrzeugtyp: job.fahrzeugtyp || "LKW",
        fuehrerscheinklasse: job.fuehrerscheinklasse || "C+E",
        nachricht: job.nachricht || "Keine weiteren Informationen",
        besonderheiten: job.besonderheiten,
        acceptUrl,
        declineUrl,
        unsubscribeUrl,
        attachments,
      })
    );

    const subject = `[TEST] Neuer Auftrag: ${job.fahrzeugtyp} in ${job.einsatzort}`;
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { data: sendRes, error: sendErr } = await resend.emails.send({
      from: Deno.env.get("MAIL_FROM") || "Kraftfahrer-Mieten <noreply@kraftfahrer-mieten.com>",
      to: [driver.email],
      subject,
      html,
    });

    // email_log entry
    await supabase.from("email_log").insert({
      recipient: driver.email,
      subject,
      template: "job_invite_test",
      status: sendErr ? "failed" : "sent",
      sent_at: sendErr ? null : new Date().toISOString(),
      job_id: jobId,
      message_id: sendRes?.id || null,
      error_message: sendErr ? (sendErr.message || String(sendErr)) : null,
    });

    // admin_actions audit (job status remains pending)
    await supabase.from("admin_actions").insert({
      action: "job_test_send",
      job_id: jobId,
      admin_email: user.email || "unknown",
      note: `Testmail an ${driver.email} (Status bleibt pending)`,
    });

    if (sendErr) {
      return new Response(JSON.stringify({ success: false, error: sendErr.message || String(sendErr) }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      recipient: driver.email,
      messageId: sendRes?.id || null,
      attachments: attachments.length,
      inviteCreated: !!driver.id,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("send-test-job-invite error:", e);
    return new Response(JSON.stringify({ error: "Internal error", details: e?.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});