import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { storeCustomerMailSnapshot } from "../_shared/customer-mail-snapshot.ts";
import {
  verifyAdminAuth,
  createCorsHeaders,
  handleCorsPreflightRequest,
  createErrorResponse,
} from "../_shared/admin-auth.ts";
import { formatAssignmentPeriod } from "../_shared/berlin-time.ts";
import { buildCustomerAssignmentNotice } from "./notice.ts";

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
        id, job_id, driver_id, status, start_date, end_date, times_entered,
        job_requests:job_id ( id, status, customer_email, customer_name, company, einsatzort, tarif_type, tarif_needs_review, unterkunft_option, unterkunft_obergrenze ),
        fahrer_profile:driver_id ( id, vorname, nachname, email, telefon )
      `)
      .eq("id", assignment_id)
      .maybeSingle();

    if (aErr || !assignment) return createErrorResponse("assignment not found", 404, corsHeaders);

    const jr: any = Array.isArray((assignment as any).job_requests)
      ? (assignment as any).job_requests[0] : (assignment as any).job_requests;
    const fp: any = Array.isArray((assignment as any).fahrer_profile)
      ? (assignment as any).fahrer_profile[0] : (assignment as any).fahrer_profile;

    // Auslöser ist ausschließlich die aktive Zuweisung durch Fahrerexpress.
    // Eine Fahrerannahme oder ein Fahrer-Annahmenachweis wird nicht abgefragt und nicht benötigt.
    if (!["assigned", "confirmed"].includes(String(assignment.status))) {
      return createErrorResponse("Keine aktive Fahrerzuweisung – keine Einsatzbestätigung versendet", 409, corsHeaders);
    }
    if (jr?.status !== "assigned") {
      return createErrorResponse("Auftrag ist nicht als zugewiesen markiert – keine Einsatzbestätigung versendet", 409, corsHeaders);
    }

    const customerEmail = jr?.customer_email;
    if (!customerEmail) return createErrorResponse("Kunden-E-Mail fehlt", 400, corsHeaders);
    if (!fp?.vorname || !fp?.nachname) return createErrorResponse("Fahrerdaten unvollständig", 400, corsHeaders);

    const driverName = `${fp.vorname} ${fp.nachname}`.trim();
    const driverPhone = fp.telefon || "—";
    // Einsatzzeitraum in deutscher Ortszeit (Europe/Berlin), identisch zur Fahrermail:
    // mit erfasster Uhrzeit Datum + Uhrzeit; Altbestand ohne Uhrzeit nur Kalenderdatum mit Hinweis.
    const zeitraum = formatAssignmentPeriod(
      assignment.start_date,
      assignment.end_date,
      (assignment as any).times_entered,
    ) || "—";
    const einsatzort = jr?.einsatzort || "—";

    const { subject, html, text } = buildCustomerAssignmentNotice({ job: jr, driverName, driverPhone, driverEmail: fp.email, zeitraum, einsatzort });

    const mailPayload = { from: "Fahrerexpress <info@kraftfahrer-mieten.com>", to: customerEmail, subject, html, text };
    const result = await resend.emails.send({ ...mailPayload, to: [customerEmail] });
    await storeCustomerMailSnapshot(supabase, {
      jobId: assignment.job_id,
      assignmentId: assignment.id,
      template: "customer_assignment_notice",
      payload: mailPayload,
      result: result.error
        ? { ok: false, error: String(result.error?.message || result.error) }
        : { ok: true, messageId: result.data?.id ?? null },
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