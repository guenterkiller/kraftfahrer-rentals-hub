import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  createCorsHeaders,
  handleCorsPreflightRequest,
  createErrorResponse,
} from "../_shared/admin-auth.ts";
import { buildCustomerAssignmentNotice } from "../send-customer-assignment-notice/notice.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Fester Testempfänger – nicht überschreibbar, um Missbrauch zu verhindern.
const FIXED_TEST_RECIPIENT = "info@kraftfahrer-mieten.com";

// Testversand derselben produktiven Einsatzbestätigung wie nach einer Zuweisung.
// Sendet ausschließlich an den festen internen Testempfänger. Legt keine Zuweisung
// an und ändert keine Daten. Log-Template: customer_assignment_notice_test.
serve(async (req) => {
  const corsHeaders = createCorsHeaders();
  if (req.method === "OPTIONS") return handleCorsPreflightRequest(corsHeaders);
  if (req.method !== "POST") return createErrorResponse("Method not allowed", 405, corsHeaders);

  try {
    const body = await req.json().catch(() => ({}));
    const testEmail = FIXED_TEST_RECIPIENT;
    const notice = buildCustomerAssignmentNotice({
      job: {
        company: "TEST Sturm-Spedition",
        customer_name: "TEST Lorenz Sturm",
        tarif_type: "lkw_ce",
        tarif_needs_review: false,
      },
      driverName: "TEST Mustafa Duru",
      driverPhone: body?.driverPhone || "[Telefon Fahrer]",
      driverEmail: body?.driverEmail || "[E-Mail Fahrer]",
      zeitraum: "20.07.2026 – 31.08.2026",
      einsatzort: "TEST Altdorf, 90518",
    });
    const subject = `[TEST] ${notice.subject}`;
    const warning = "[TESTMAIL – Vorschau der Einsatzbestätigung. Kein echter Auftrag. Nicht an Kunden weiterleiten.]";
    const html = notice.html.replace(
      "</body>",
      `<div style="max-width:640px;margin:12px auto;padding:12px;background:#fff3cd;color:#7c2d12;font-family:Arial,sans-serif;">${warning}</div></body>`,
    );
    const text = `${warning}\n\n${notice.text}`;

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
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("send-customer-assignment-notice-test error:", e);
    return createErrorResponse("Interner Fehler", 500, createCorsHeaders());
  }
});
