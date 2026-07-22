import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import {
  verifyAdminAuth,
  createCorsHeaders,
  handleCorsPreflightRequest,
  createErrorResponse,
} from "../_shared/admin-auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  const corsHeaders = createCorsHeaders();

  if (req.method === "OPTIONS") return handleCorsPreflightRequest(corsHeaders);
  if (req.method !== "POST") return createErrorResponse("Method not allowed", 405, corsHeaders);

  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.success) return authResult.response;
    const { supabase } = authResult;

    const { assignment_id } = await req.json();
    if (!assignment_id) return createErrorResponse("assignment_id required", 400, corsHeaders);

    // Idempotenz: bereits gesendet?
    const { data: existing } = await supabase
      .from("email_log")
      .select("id")
      .eq("template", "customer_assignment_notice")
      .eq("assignment_id", assignment_id)
      .eq("status", "sent")
      .maybeSingle();

    if (existing) {
      console.log(`ℹ️ customer_assignment_notice already sent for ${assignment_id}`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "already_sent" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: assignment, error: aErr } = await supabase
      .from("job_assignments")
      .select(`
        id, job_id, driver_id, start_date, end_date,
        job_requests:job_id ( id, customer_email, customer_name, einsatzort ),
        fahrer_profile:driver_id ( id, vorname, nachname, email, telefon )
      `)
      .eq("id", assignment_id)
      .maybeSingle();

    if (aErr || !assignment) return createErrorResponse("assignment not found", 404, corsHeaders);

    const jr: any = Array.isArray((assignment as any).job_requests)
      ? (assignment as any).job_requests[0] : (assignment as any).job_requests;
    const fp: any = Array.isArray((assignment as any).fahrer_profile)
      ? (assignment as any).fahrer_profile[0] : (assignment as any).fahrer_profile;

    const customerEmail = jr?.customer_email;
    if (!customerEmail) return createErrorResponse("Kunden-E-Mail fehlt", 400, corsHeaders);
    if (!fp?.vorname || !fp?.nachname) return createErrorResponse("Fahrerdaten unvollständig", 400, corsHeaders);

    const fmt = (d: string | null) => {
      if (!d) return "—";
      try { return new Date(d).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }); }
      catch { return d; }
    };

    const driverName = `${fp.vorname} ${fp.nachname}`.trim();
    const driverPhone = fp.telefon || "—";
    const driverEmailLine = fp.email ? `E-Mail: ${fp.email}` : "";
    const zeitraum = `${fmt(assignment.start_date)} bis ${fmt(assignment.end_date)}`;
    const einsatzort = jr?.einsatzort || "—";

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:640px;">
        <p>Sehr geehrte Damen und Herren,</p>
        <p>für Ihren Auftrag wurde folgender selbstständiger Fahrer zugeteilt:</p>
        <p>
          <strong>Name:</strong> ${driverName}<br>
          <strong>Telefon:</strong> ${driverPhone}
          ${fp.email ? `<br><strong>E-Mail:</strong> ${fp.email}` : ""}
        </p>
        <p>
          <strong>Einsatzzeitraum:</strong> ${zeitraum}<br>
          <strong>Einsatzort:</strong> ${einsatzort}
        </p>
        <p>Bitte stimmen Sie die weiteren Einsatzdetails direkt mit dem Fahrer ab.</p>
        <p>Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.</p>
        <p>Mit freundlichen Grüßen<br><br>
          Fahrerexpress-Agentur<br>
          Günter Killer
        </p>
      </div>
    `;

    const text =
`Sehr geehrte Damen und Herren,

für Ihren Auftrag wurde folgender selbstständiger Fahrer zugeteilt:

Name: ${driverName}
Telefon: ${driverPhone}
${driverEmailLine}

Einsatzzeitraum: ${zeitraum}
Einsatzort: ${einsatzort}

Bitte stimmen Sie die weiteren Einsatzdetails direkt mit dem Fahrer ab.

Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen

Fahrerexpress-Agentur
Günter Killer`;

    const result = await resend.emails.send({
      from: "Fahrerexpress <info@kraftfahrer-mieten.com>",
      to: [customerEmail],
      subject: "Fahrerzuteilung zu Ihrem Auftrag",
      html,
      text,
    });

    if (result.error) {
      console.error("Customer assignment email failed:", result.error);
      await supabase.from("email_log").insert({
        recipient: customerEmail,
        template: "customer_assignment_notice",
        job_id: assignment.job_id,
        assignment_id: assignment.id,
        status: "error",
        error_message: String(result.error?.message || result.error),
      });
      return createErrorResponse("E-Mail an Kunde fehlgeschlagen", 502, corsHeaders);
    }

    await supabase.from("email_log").insert({
      recipient: customerEmail,
      template: "customer_assignment_notice",
      job_id: assignment.job_id,
      assignment_id: assignment.id,
      status: "sent",
      message_id: result.data?.id,
    });

    return new Response(
      JSON.stringify({ success: true, emailId: result.data?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-customer-assignment-notice error:", e);
    return createErrorResponse("Interner Fehler", 500, createCorsHeaders());
  }
});