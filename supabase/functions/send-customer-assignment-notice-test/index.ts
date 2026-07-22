import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import {
  verifyAdminAuth,
  createCorsHeaders,
  handleCorsPreflightRequest,
  createErrorResponse,
} from "../_shared/admin-auth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Testversand der Kunden-/Bucherbenachrichtigung customer_assignment_notice.
// Sendet ausschliesslich an einen festen Testempfaenger. Legt keine Zuweisung
// an, aendert keine Daten. Log-Template: customer_assignment_notice_test.
serve(async (req) => {
  const corsHeaders = createCorsHeaders();
  if (req.method === "OPTIONS") return handleCorsPreflightRequest(corsHeaders);
  if (req.method !== "POST") return createErrorResponse("Method not allowed", 405, corsHeaders);

  try {
    const authResult = await verifyAdminAuth(req);
    if (!authResult.success) return authResult.response;
    const { supabase } = authResult;

    const body = await req.json().catch(() => ({}));
    const testEmail: string = body?.testEmail || "info@kraftfahrer-mieten.com";

    const customerName = "Lorenz Sturm / Sturm-Spedition";
    const einsatzort = "Altdorf, 90518";
    const driverName = "Mustafa Duru";
    const driverPhone = body?.driverPhone || "[Telefon Fahrer]";
    const driverEmail = body?.driverEmail || "[E-Mail Fahrer]";
    const zeitraum = "20.07.2026 bis 31.08.2026";
    const driverEmailLine = driverEmail ? `E-Mail: ${driverEmail}` : "";

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:640px;">
        <p style="color:#b45309;font-weight:bold;">[TESTMAIL – Vorschau der Kunden-/Bucherbenachrichtigung. Kein echter Auftrag. Nicht an Kunden weiterleiten.]</p>
        <p>Sehr geehrte Damen und Herren,</p>
        <p>(Kunde/Bucher laut Auftrag: ${customerName})</p>
        <p>für Ihren Auftrag wurde folgender selbstständiger Fahrer vorgesehen:</p>
        <p>
          <strong>Name:</strong> ${driverName}<br>
          <strong>Telefon:</strong> ${driverPhone}
          ${driverEmail ? `<br><strong>E-Mail:</strong> ${driverEmail}` : ""}
        </p>
        <p>
          <strong>Einsatzzeitraum:</strong> ${zeitraum}<br>
          <strong>Einsatzort:</strong> ${einsatzort}
        </p>
        <p>Bitte stimmen Sie die weiteren einsatzbezogenen Details direkt mit dem Fahrer ab.</p>
        <p>
          <strong>Hinweis:</strong><br>
          Die Fahrerzuteilung erfolgt auf Grundlage der aktuellen Verfügbarkeit und der vom Fahrer bestätigten Einsatzbereitschaft. Sollte es kurzfristig zu einer Änderung oder einem Ausfall kommen, informieren Sie uns bitte umgehend, damit wir die Situation prüfen können.
        </p>
        <p>Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.</p>
        <p>Mit freundlichen Grüßen<br><br>
          Fahrerexpress-Agentur<br>
          Günter Killer
        </p>
      </div>
    `;

    const text =
`[TESTMAIL – Vorschau der Kunden-/Bucherbenachrichtigung. Kein echter Auftrag.]

Sehr geehrte Damen und Herren,

(Kunde/Bucher laut Auftrag: ${customerName})

für Ihren Auftrag wurde folgender selbstständiger Fahrer vorgesehen:

Name: ${driverName}
Telefon: ${driverPhone}
${driverEmailLine}

Einsatzzeitraum: ${zeitraum}
Einsatzort: ${einsatzort}

Bitte stimmen Sie die weiteren einsatzbezogenen Details direkt mit dem Fahrer ab.

Hinweis:
Die Fahrerzuteilung erfolgt auf Grundlage der aktuellen Verfügbarkeit und der vom Fahrer bestätigten Einsatzbereitschaft. Sollte es kurzfristig zu einer Änderung oder einem Ausfall kommen, informieren Sie uns bitte umgehend, damit wir die Situation prüfen können.

Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen

Fahrerexpress-Agentur
Günter Killer`;

    const subject = "[TEST] Fahrerzuteilung zu Ihrem Auftrag";

    const result = await resend.emails.send({
      from: "Fahrerexpress <info@kraftfahrer-mieten.com>",
      to: [testEmail],
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error("Test customer assignment email failed:", result.error);
      await supabase.from("email_log").insert({
        recipient: testEmail,
        template: "customer_assignment_notice_test",
        status: "error",
        error_message: String(result.error?.message || result.error),
      });
      return createErrorResponse("Testmail fehlgeschlagen", 502, corsHeaders);
    }

    await supabase.from("email_log").insert({
      recipient: testEmail,
      template: "customer_assignment_notice_test",
      status: "sent",
      message_id: result.data?.id,
    });

    return new Response(
      JSON.stringify({ success: true, emailId: result.data?.id, recipient: testEmail, subject, template: "customer_assignment_notice_test" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-customer-assignment-notice-test error:", e);
    return createErrorResponse("Interner Fehler", 500, createCorsHeaders());
  }
});