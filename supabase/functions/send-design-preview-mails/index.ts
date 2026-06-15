// Design-Vorschau-Versender (NICHT-PRODUKTIV)
// Rendert die fünf Fahrer-Mailtypen mit Platzhalterdaten und sendet sie
// ausschließlich an info@kraftfahrer-mieten.com. Keine Datenänderung,
// keine Empfängerlogik, keine Inhalte/Preise/Bedingungen werden hier
// verändert. Es werden nur die bestehenden Templates/Shells aufgerufen.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";

import { DriverRegistrationConfirmation } from "../_shared/email-templates/driver-registration-confirmation.tsx";
import { DriverApprovalEmail } from "./_templates/driver-approval-email.tsx";
import { wrapDriverEmailHtml } from "../_shared/email-templates/driver-html-shell.ts";
import {
  makeDriverUnsubscribeToken,
  buildDriverUnsubscribeUrl,
} from "../_shared/driver-unsubscribe-token.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const TO = "info@kraftfahrer-mieten.com";
const FROM = Deno.env.get("MAIL_FROM") || "Fahrerexpress-Agentur <info@kraftfahrer-mieten.com>";
// Echte Fahrer-ID nur für gültigen HMAC-Token in der Rundmail-Vorschau.
// Es werden keinerlei Daten dieses Fahrers verändert; es wird auch
// keine Mail an den Fahrer selbst gesendet (Empfänger ist TO).
const PREVIEW_DRIVER_ID = "854e0c5d-197b-4ef6-ac84-4652b70ca38a";

async function buildUnsubUrl(): Promise<string | undefined> {
  const secret = Deno.env.get("INTERNAL_FN_SECRET") || "";
  if (!secret) return undefined;
  const token = await makeDriverUnsubscribeToken(PREVIEW_DRIVER_ID, secret);
  return buildDriverUnsubscribeUrl(token);
}

// === 3) Auftragsangebot (Broadcast-Design – freigegebene Shell) ===
function buildJobNotificationInnerHtml(job: Record<string, string>) {
  return `
    <h2 class="body-text" style="margin:0 0 14px 0;font-size:20px;line-height:1.25;color:#0d2340;font-weight:700;">Neuer Fahrerauftrag verfügbar</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8fafc" style="background-color:#f8fafc;border:1px solid #e5e7eb;border-left:4px solid #bb2c29;border-collapse:separate;border-radius:6px;margin:0 0 18px 0;">
      <tr><td style="padding:16px 18px;">
        <h3 class="body-text" style="margin:0 0 8px 0;font-size:16px;color:#0d2340;font-weight:700;">Agenturabrechnung – Vertrag mit Fahrerexpress</h3>
        <p class="body-text" style="margin:0;font-size:15px;line-height:1.6;color:#374151;">Dieser Auftrag wird über Fahrerexpress abgerechnet. Sie erbringen die Leistung als selbstständiger Subunternehmer von Fahrerexpress.</p>
      </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="background-color:#ffffff;border:1px solid #e5e7eb;border-collapse:separate;border-radius:6px;margin:0 0 18px 0;">
      <tr><td style="padding:18px 20px;">
        <h3 class="body-text" style="margin:0 0 10px 0;font-size:16px;color:#0d2340;font-weight:700;">Auftragsdetails</h3>
        <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Kunde:</strong> ${job.customer_name}</p>
        <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Unternehmen:</strong> ${job.company}</p>
        <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Einsatzort:</strong> ${job.einsatzort}</p>
        <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Zeitraum:</strong> ${job.zeitraum}</p>
        <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Fahrzeugtyp:</strong> ${job.fahrzeugtyp}</p>
        <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Führerscheinklasse:</strong> ${job.fuehrerscheinklasse}</p>
        <p class="body-text" style="margin:4px 0;font-size:15px;line-height:1.55;color:#374151;"><strong>Besonderheiten:</strong> ${job.besonderheiten}</p>
      </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8fafc" style="background-color:#f8fafc;border:1px solid #e5e7eb;border-left:4px solid #bb2c29;border-collapse:separate;border-radius:6px;margin:0 0 18px 0;">
      <tr><td style="padding:18px 20px;text-align:center;">
        <h3 class="body-text" style="margin:0 0 8px 0;font-size:17px;color:#0d2340;font-weight:700;">Interesse? Bitte melden Sie sich!</h3>
        <p class="body-text" style="margin:0 0 8px 0;font-size:15px;line-height:1.55;color:#374151;">Rufen Sie uns an oder schreiben Sie per SMS/WhatsApp:</p>
        <p class="body-text" style="margin:8px 0 8px 0;font-size:22px;line-height:1.2;color:#bb2c29;font-weight:700;">
          <a href="tel:+4915771442285" style="color:#bb2c29;text-decoration:none;">+49-1577-1442285</a>
        </p>
      </td></tr>
    </table>
    <p class="body-text" style="margin:8px 0 0 0;font-size:12px;color:#6b7280;">Diese E-Mail wurde automatisch generiert. Bei Fragen: info@kraftfahrer-mieten.com</p>
  `;
}

// === 4) Einsatzbestätigung (Shell, showUnsubscribe:false) ===
function buildConfirmationInnerHtml() {
  const sectionStart = (bg: string) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bg}" style="background-color:${bg};border:1px solid #e5e7eb;border-left:4px solid #bb2c29;border-collapse:separate;border-radius:6px;margin:0 0 16px 0;"><tr><td style="padding:16px 18px;">`;
  const sectionEnd = `</td></tr></table>`;
  const h3 = (txt: string, color = "#0d2340") =>
    `<h3 class="body-text" style="margin:0 0 10px 0;font-size:16px;color:${color};font-weight:700;">${txt}</h3>`;
  const row = (label: string, value: string) =>
    `<p class="body-text" style="margin:4px 0;font-size:14px;line-height:1.55;color:#374151;"><strong>${label}:</strong> ${value}</p>`;
  return `
    <h2 class="body-text" style="margin:0 0 8px 0;font-size:22px;line-height:1.2;color:#0d2340;font-weight:700;letter-spacing:.3px;">EINSATZBESTÄTIGUNG</h2>
    <p class="body-text" style="margin:0 0 18px 0;font-size:14px;color:#6b7280;">Fahrerexpress | kraftfahrer-mieten.com</p>
    <p class="body-text" style="margin:0 0 8px 0;font-size:15px;color:#374151;">Hallo Günter Killer,</p>
    <p class="body-text" style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#374151;">hiermit bestätigen wir Ihren Einsatz als selbstständiger Fahrer.</p>
    ${sectionStart("#f8fafc")}${h3("AUFTRAGGEBER")}${row("Unternehmen/Name", "Muster Logistik GmbH")}${row("Ansprechpartner", "Max Muster")}${row("Anschrift", "Musterweg 1, 60594 Frankfurt am Main")}${row("Telefon", "069 1234567")}${row("E-Mail", "disposition@muster-logistik.de")}${sectionEnd}
    ${sectionStart("#ffffff")}${h3("EINSATZ")}${row("Datum/Zeitraum", "16.06.2026 06:00 – 16.06.2026 18:00")}${row("Einsatzort / Treffpunkt", "60594 Frankfurt am Main")}${row("Fahrzeug/Typ", "Sattelzug CE")}${row("Besonderheiten", "Fernverkehr, Übernachtung im LKW")}${sectionEnd}
    ${sectionStart("#f8fafc")}${h3("KONDITIONEN")}${row("Tarif", "Fernfahrer-Pauschale (450 € netto / Einsatztag)")}${row("Abrechnung", "Pauschale pro Einsatztag")}${sectionEnd}
    ${sectionStart("#ffffff")}${h3("VEREINBARUNGEN (Fahrerexpress)")}<p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;">Standard-Vermittlungsanteil, Abrechnungs- und Zahlungsregelung gemäß den geltenden Fahrer-Vermittlungsbedingungen (Vorschau, gekürzt).</p>${sectionEnd}
    ${sectionStart("#f8fafc")}${h3("Nichterscheinen / kurzfristige Absage (No-Show)", "#bb2c29")}<p class="body-text" style="margin:8px 0;font-size:13px;line-height:1.6;color:#374151;">Pauschalierter Schadensersatz 150 € bei No-Show oder Absage ≤ 24 Stunden vor Einsatzbeginn.</p>${sectionEnd}
    <p class="body-text" style="margin:18px 0 8px 0;font-size:14px;color:#374151;">Bitte prüfen Sie die Angaben. Abweichungen bitte umgehend melden.</p>
    <p class="body-text" style="margin:0 0 4px 0;font-size:14px;color:#0d2340;font-weight:600;">Viele Grüße<br/>Fahrerexpress | kraftfahrer-mieten.com</p>
  `;
}

// === 5) Rundmail / Fahrerinformationen ===
function buildNewsletterInnerHtml() {
  return `
    <p class="body-text" style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#0d2340;font-weight:600;">Hallo Günter Killer,</p>
    <p class="body-text" style="margin:0 0 12px 0;font-size:15px;line-height:1.65;color:#374151;">vielen Dank, dass Sie Teil unseres Fahrer-Netzwerks bei Fahrerexpress sind. Mit dieser E-Mail informieren wir Sie über aktuelle Regelungen und bitten um eine kurze Rückmeldung zur Aktualisierung unserer Fahrerdatei.</p>
    <p class="body-text" style="margin:0 0 12px 0;font-size:15px;line-height:1.65;color:#374151;">Sie sind selbstständiger Fahrer / selbstständiger Unternehmer. Es besteht kein Arbeitsverhältnis und keine Arbeitnehmerüberlassung.</p>
    <p class="body-text" style="margin:24px 0 0 0;font-size:15px;line-height:1.6;color:#0d2340;font-weight:600;">Mit freundlichen Grüßen<br/>Ihr Fahrerexpress-Team</p>
  `;
}

async function sendOne(label: string, idx: number, subject: string, html: string) {
  const fullSubject = `[DESIGN-VORSCHAU ${idx}/5] ${subject}`;
  const res = await resend.emails.send({
    from: FROM,
    to: [TO],
    subject: fullSubject,
    html,
  });
  return {
    label,
    subject: fullSubject,
    ok: !res.error,
    id: (res as any)?.data?.id ?? null,
    error: res.error ? String((res.error as any).message ?? res.error) : null,
  };
}

serve(async (_req) => {
  try {
    const unsubscribeUrl = await buildUnsubUrl();

    // 1) Registrierungsbestätigung
    const html1 = await renderAsync(
      React.createElement(DriverRegistrationConfirmation, { driverName: "Günter Killer" }),
    );

    // 2) Freischaltung / Onboarding
    const html2 = await renderAsync(
      React.createElement(DriverApprovalEmail, {
        driverName: "Günter Killer",
        hasMatchingJobs: true,
        unsubscribeUrl,
      }),
    );

    // 3) Auftragsangebot (Broadcast)
    const jobPlaceholder = {
      customer_name: "Max Muster",
      company: "Muster Logistik GmbH",
      einsatzort: "60594 Frankfurt am Main",
      zeitraum: "16.06.2026 – 17.06.2026",
      fahrzeugtyp: "Sattelzug CE",
      fuehrerscheinklasse: "CE",
      besonderheiten: "Fernverkehr, Übernachtung im LKW",
    };
    const html3 = wrapDriverEmailHtml(buildJobNotificationInnerHtml(jobPlaceholder), {
      subject: `Neuer Auftrag: ${jobPlaceholder.fahrzeugtyp} - Agenturabrechnung`,
      previewText: `Neuer Auftrag in ${jobPlaceholder.einsatzort} – Agenturabrechnung über Fahrerexpress`,
      unsubscribeUrl,
      showUnsubscribe: !!unsubscribeUrl,
    });

    // 4) Einsatzbestätigung (kein Abmeldelink)
    const html4 = wrapDriverEmailHtml(buildConfirmationInnerHtml(), {
      subject: "Einsatzbestätigung – Sattelzug CE – Frankfurt am Main",
      previewText: "Einsatzbestätigung – Sattelzug CE – Frankfurt am Main",
      showUnsubscribe: false,
    });

    // 5) Rundmail / Fahrerinformationen (tokenbasierter Abmeldelink)
    const html5 = wrapDriverEmailHtml(buildNewsletterInnerHtml(), {
      subject: "Aktuelle Fahrerinformationen von Fahrerexpress",
      previewText: "Aktuelle Fahrerinformationen von Fahrerexpress",
      unsubscribeUrl,
      showUnsubscribe: true,
    });

    const results = [];
    results.push(await sendOne("registrierungsbestaetigung", 1, "Willkommen bei der Fahrerexpress-Agentur – Registrierung bestätigt", html1));
    results.push(await sendOne("freischaltung_onboarding", 2, "Sie sind jetzt bei Fahrerexpress freigeschaltet", html2));
    results.push(await sendOne("auftragsangebot_broadcast", 3, "Neuer Auftrag: Sattelzug CE - Agenturabrechnung", html3));
    results.push(await sendOne("einsatzbestaetigung", 4, "Einsatzbestätigung – Sattelzug CE – Frankfurt am Main", html4));
    results.push(await sendOne("rundmail_fahrerinformationen", 5, "Aktuelle Fahrerinformationen von Fahrerexpress", html5));

    return new Response(JSON.stringify({ ok: true, to: TO, results }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});