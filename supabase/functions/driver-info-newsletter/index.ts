import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import {
  buildDriverUnsubscribeUrl,
  makeDriverUnsubscribeToken,
} from "../_shared/driver-unsubscribe-token.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const SUBJECT = "Fahraufträge jetzt einfacher annehmen oder ablehnen";

// Allowlist for test recipients (mode=test). Anything else is rejected.
const TEST_EMAIL_ALLOWLIST = new Set<string>([
  "info@kraftfahrer-mieten.com",
  "guenter.killer@t-online.de",
]);

function escape(s: string): string {
  return (s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

function renderHtml(vorname: string, unsubscribeUrl: string): string {
  const name = escape(vorname || "Fahrer");
  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;color:#1f2937;line-height:1.55;">
    <p>Hallo ${name},</p>

    <p>wir haben den Ablauf für Fahraufträge bei der Fahrerexpress-Agentur verbessert.</p>

    <p>Ab sofort erhalten Sie passende Auftragsangebote per E-Mail mit direkter Antwortmöglichkeit.</p>

    <p><strong>Das bedeutet für Sie:</strong></p>
    <p>In der E-Mail sehen Sie alle wichtigen Einsatzdaten:</p>
    <ul>
      <li>Einsatzort</li>
      <li>Zeitraum</li>
      <li>Fahrzeug / Tätigkeit</li>
      <li>besondere Anforderungen</li>
      <li>Aufgabenbeschreibung</li>
    </ul>

    <p>Direkt darunter können Sie auswählen:</p>
    <p style="margin:6px 0;">✅ <strong>„Ich kann den Auftrag übernehmen“</strong></p>
    <p style="margin:4px 0;">oder</p>
    <p style="margin:6px 0;">❌ <strong>„Ich kann nicht übernehmen“</strong></p>

    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 14px;margin:18px 0;color:#92400e;">
      <strong>Wichtig:</strong> Ihre Rückmeldung ist zunächst nur eine Verfügbarkeitsmeldung.
      Die endgültige Einsatzbestätigung erfolgt immer separat durch Fahrerexpress.
      Ein Auftrag gilt erst dann als verbindlich zugewiesen, wenn Fahrerexpress den Einsatz ausdrücklich bestätigt.
    </div>

    <p><strong>Hinweis zur Vergütung und zum Vermittlungsanteil:</strong></p>
    <p>Jeder Einsatz wird Ihnen vorab einzeln angeboten. Die konkrete Vergütung und der Vermittlungsanteil ergeben sich aus dem jeweiligen Auftragsangebot vor Einsatzbeginn.</p>
    <p>Für Standardeinsätze beträgt der Vermittlungsanteil der Fahrerexpress-Agentur in der Regel <strong>20 %</strong> des mit dem Auftraggeber vereinbarten Netto-Einsatzpreises ohne An- und Abfahrt.</p>
    <p>Für Sonder-, Projekt-, Pauschal-, kurzfristige oder besonders aufwendige Einsätze kann der Vermittlungsanteil <strong>bis zu 25 %</strong> betragen.</p>
    <p>Sie entscheiden bei jedem Angebot frei, ob Sie den Einsatz übernehmen möchten oder nicht.</p>

    <p style="margin-top:24px;"><strong>Keine weiteren Auftragsangebote gewünscht?</strong></p>
    <p>Wenn Sie künftig keine Auftragsangebote mehr von Fahrerexpress erhalten möchten, können Sie sich jederzeit über den Abmeldelink am Ende der E-Mail abmelden:</p>
    <p style="text-align:center;margin:18px 0;">
      <a href="${unsubscribeUrl}"
         style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold;">
        Keine weiteren Auftragsangebote erhalten
      </a>
    </p>
    <p style="font-size:13px;color:#4b5563;">
      Ihre Daten werden dadurch nicht automatisch gelöscht. Sie erhalten lediglich keine weiteren Fahrerangebote mehr.
    </p>
    <p style="font-size:13px;color:#4b5563;">
      Wenn Sie zusätzlich die Löschung Ihrer gespeicherten Daten wünschen, schreiben Sie uns bitte an
      <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a>.
    </p>

    <p style="margin-top:22px;">Bei Fragen erreichen Sie uns jederzeit:</p>
    <p>
      Telefon: <a href="tel:+4915771442285">01577 1442285</a><br/>
      E-Mail: <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a>
    </p>

    <p style="margin-top:22px;">Mit freundlichen Grüßen</p>
    <p>
      Fahrerexpress-Agentur<br/>
      Günter Killer<br/>
      Vermittlung gewerblicher Fahrer
    </p>
  </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const internalSecret = Deno.env.get("INTERNAL_FN_SECRET") || "";
    if (!internalSecret) throw new Error("INTERNAL_FN_SECRET missing");

    // ------------------------------------------------------------------
    // AUTH: Require either internal secret header OR valid admin JWT.
    // Applies to ALL modes (preview / test / send) — no anonymous access.
    // Mirrors the pattern used in send-driver-newsletter.
    // ------------------------------------------------------------------
    const providedSecret = req.headers.get("x-internal-secret");
    const authHeader = req.headers.get("authorization");
    let isAuthorized = false;

    if (providedSecret && providedSecret === internalSecret) {
      isAuthorized = true;
    }

    if (!isAuthorized && authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "");
      const { data: userData, error: userErr } = await supabase.auth.getUser(token);
      if (!userErr && userData?.user) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (roleRow) isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ ok: false, error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let body: any = {};
    try { body = await req.json(); } catch (_e) { /* GET / empty */ }
    const mode: "preview" | "test" | "send" = body.mode ?? "preview";
    const testEmail: string = body.test_email ?? "guenter.killer@t-online.de";

    // Empfängerliste
    const { data: drivers, error: dErr } = await supabase
      .from("fahrer_profile")
      .select("id, vorname, nachname, email, status, is_blocked, email_opt_out")
      .eq("status", "approved")
      .eq("is_blocked", false)
      .eq("email_opt_out", false);
    if (dErr) throw dErr;

    const recipients = (drivers ?? []).filter(
      (d) => d.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email),
    );

    // Vorschau – anonymisiert (keine echten Fahrer-E-Mails / Vornamen ausliefern)
    if (mode === "preview") {
      const dummyId = "00000000-0000-0000-0000-000000000000";
      const token = await makeDriverUnsubscribeToken(dummyId, internalSecret);
      const html = renderHtml("Vorname", buildDriverUnsubscribeUrl(token));
      return new Response(
        JSON.stringify({
          ok: true, mode, subject: SUBJECT,
          recipient_count: recipients.length,
          html_preview: html,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
    const mailFrom = Deno.env.get("MAIL_FROM") || "Fahrerexpress <info@kraftfahrer-mieten.com>";

    // Testmail
    if (mode === "test") {
      // Test-Empfänger müssen auf der Allowlist stehen
      const normalizedTest = (testEmail || "").trim().toLowerCase();
      if (!TEST_EMAIL_ALLOWLIST.has(normalizedTest)) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "test_email not allowed. Only internal allowlist addresses are permitted.",
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Fahrer-Datensatz für Token suchen (falls vorhanden), sonst Dummy
      const target = recipients.find((d) => d.email?.toLowerCase() === testEmail.toLowerCase())
        ?? (await supabase.from("fahrer_profile").select("id, vorname, email")
          .ilike("email", testEmail).maybeSingle()).data;

      const driverId = target?.id ?? "00000000-0000-0000-0000-000000000000";
      const vorname = target?.vorname ?? "Tester";
      const token = await makeDriverUnsubscribeToken(driverId, internalSecret);
      const html = renderHtml(vorname, buildDriverUnsubscribeUrl(token));

      const { data: mail, error: mErr } = await resend.emails.send({
        from: mailFrom,
        to: [testEmail],
        subject: `[TEST] ${SUBJECT}`,
        html,
      });
      const status = mErr ? "failed" : "sent";
      await supabase.from("email_log").insert({
        recipient: testEmail,
        subject: `[TEST] ${SUBJECT}`,
        template: "driver_info_newsletter_test",
        status,
        message_id: (mail as any)?.id ?? null,
        sent_at: status === "sent" ? new Date().toISOString() : null,
        error_message: mErr ? JSON.stringify(mErr) : null,
      });
      return new Response(
        JSON.stringify({
          ok: !mErr, mode,
          recipient_count_planned: recipients.length,
          test_to: testEmail,
          message_id: (mail as any)?.id ?? null,
          error: mErr ? String((mErr as any)?.message ?? mErr) : null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Massenversand – nur wenn explizit angefordert
    if (mode === "send") {
      // Schutz: zweiten Bestätigungs-Header verlangen
      const confirm = req.headers.get("x-confirm-send");
      if (confirm !== "yes") {
        return new Response(JSON.stringify({
          ok: false, error: "Mass send blocked. Send header 'x-confirm-send: yes' to confirm.",
          recipient_count: recipients.length,
        }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const results: any[] = [];
      for (const d of recipients) {
        try {
          const token = await makeDriverUnsubscribeToken(d.id, internalSecret);
          const html = renderHtml(d.vorname || "Fahrer", buildDriverUnsubscribeUrl(token));
          const { data: mail, error: mErr } = await resend.emails.send({
            from: mailFrom,
            to: [d.email],
            subject: SUBJECT,
            html,
          });
          const status = mErr ? "failed" : "sent";
          await supabase.from("email_log").insert({
            recipient: d.email,
            subject: SUBJECT,
            template: "driver_info_newsletter",
            status,
            message_id: (mail as any)?.id ?? null,
            sent_at: status === "sent" ? new Date().toISOString() : null,
            error_message: mErr ? JSON.stringify(mErr) : null,
          });
          results.push({ email: d.email, status, message_id: (mail as any)?.id ?? null });
          // Rate-Limit-Schoner
          await new Promise((r) => setTimeout(r, 250));
        } catch (e) {
          results.push({ email: d.email, status: "error", error: String(e) });
        }
      }
      return new Response(
        JSON.stringify({ ok: true, mode, sent: results.filter((r) => r.status === "sent").length,
          failed: results.filter((r) => r.status !== "sent").length, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ ok: false, error: "Unknown mode" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});