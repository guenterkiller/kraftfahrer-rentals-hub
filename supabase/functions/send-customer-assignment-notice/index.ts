import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import {
  verifyAdminAuth,
  createCorsHeaders,
  handleCorsPreflightRequest,
  createErrorResponse,
} from "../_shared/admin-auth.ts";
import { wrapDriverEmailHtml } from "../_shared/email-templates/driver-html-shell.ts";
import { formatAssignmentPeriod } from "../_shared/berlin-time.ts";
import { tarifTextByKey } from "../_shared/email-templates/tarif-text-helper.ts";

const BEDINGUNGEN_URL = "https://www.kraftfahrer-mieten.com/vermittlungsbedingungen";
const escHtml = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as Record<string, string>)[c]);

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
        id, job_id, driver_id, start_date, end_date, times_entered,
        job_requests:job_id ( id, customer_email, customer_name, company, einsatzort, tarif_type, tarif_needs_review ),
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

    const tarifText = jr?.tarif_needs_review ? undefined : tarifTextByKey(jr?.tarif_type);
    const preis = tarifText ? `${tarifText.priceLine} (gemäß Ihrer Anfrage und Preisliste)` : "gemäß Ihrer Anfrage und Preisliste";
    const ansprech = [jr?.company, jr?.customer_name].filter(Boolean).join(" – ");
    const rows: [string, string][] = [
      ...(ansprech ? [["Auftraggeber", ansprech] as [string, string]] : []),
      ["Einsatzort", einsatzort],
      ["Zeitraum", zeitraum],
      ["Fahrer", driverName],
      ["Telefon Fahrer", driverPhone],
      ...(fp.email ? [["E-Mail Fahrer", fp.email] as [string, string]] : []),
      ["Preis", preis],
    ];

    const subject = "Fahrerinformation zu Ihrem Auftrag";
    const p = 'style="margin:0 0 14px 0;font-size:15px;line-height:1.6;" class="body-text"';
    const inner = `
      <p ${p}>Sehr geehrte Damen und Herren,</p>
      <p ${p}>für Ihren Einsatz ist folgender selbstständiger Fahrer zugeteilt:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background:#f8fafc;border-left:4px solid #bb2c29;border-radius:4px;margin:0 0 18px 0;">
        <tr><td style="padding:14px 16px;font-size:15px;line-height:1.6;color:#0d2340;" class="body-text">
          ${rows.map(([k, v]) => `<strong>${escHtml(k)}:</strong> ${escHtml(v)}`).join("<br/>")}
        </td></tr>
      </table>
      <p ${p}>Bitte prüfen Sie die Angaben. Stimmt etwas nicht, widersprechen Sie bitte unverzüglich; ohne unverzüglichen Widerspruch gilt die Zuteilung als bestätigt.</p>
      <p ${p}>Es gelten unsere <a href="${BEDINGUNGEN_URL}" style="color:#0d2340;">Vermittlungsbedingungen</a>.</p>
      <p style="margin:0;font-size:15px;line-height:1.6;" class="body-text">Mit freundlichen Grüßen<br/>Fahrerexpress-Agentur – Günter Killer</p>
    `;
    const html = wrapDriverEmailHtml(inner, {
      subject,
      previewText: "Fahrerinformation zu Ihrem Auftrag",
      showUnsubscribe: false,
    });

    const text = `Sehr geehrte Damen und Herren,

für Ihren Einsatz ist folgender selbstständiger Fahrer zugeteilt:

${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}

Bitte prüfen Sie die Angaben. Stimmt etwas nicht, widersprechen Sie bitte unverzüglich; ohne unverzüglichen Widerspruch gilt die Zuteilung als bestätigt.

Es gelten unsere Vermittlungsbedingungen: ${BEDINGUNGEN_URL}

Mit freundlichen Grüßen
Fahrerexpress-Agentur – Günter Killer`;

    const result = await resend.emails.send({
      from: "Fahrerexpress <info@kraftfahrer-mieten.com>",
      to: [customerEmail],
      subject,
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