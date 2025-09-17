// supabase/functions/send-driver-confirmation/index.ts
// Deno Edge Function – sofortiger Versand der Fahrer-Einsatzbestätigung (E-Mail + PDF)
// Erwartet: POST { assignment_id: string, mode?: 'inline' | 'both' | 'pdf-only' }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { htmlToSimplePdf } from "./pdf.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "Kraftfahrer-Mieten <info@kraftfahrer-mieten.com>";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type DeliveryMode = 'inline' | 'both' | 'pdf-only';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- EMBEDDED TEMPLATES ---
const htmlTpl = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Einsatzbestätigung</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2196F3; margin: 0; }
        .section { margin-bottom: 25px; padding: 15px; border-left: 4px solid #2196F3; background-color: #f8f9fa; }
        .section h3 { margin-top: 0; color: #1976D2; }
        .info-row { margin: 8px 0; }
        .label { font-weight: bold; display: inline-block; width: 140px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .agreements { margin-top: 30px; padding: 15px; background-color: #fff8e1; border: 1px solid #ffcc02; border-radius: 4px; }
        .agreements h4 { color: #f57c00; margin-top: 0; }
        .agreements ol { padding-left: 20px; }
        .no-show { margin-top: 30px; padding: 15px; background-color: #ffebee; border: 1px solid #f44336; border-radius: 4px; }
        .no-show h4 { color: #d32f2f; margin-top: 0; }
        .pdf-link { margin-top: 30px; padding: 15px; background-color: #e3f2fd; border: 1px solid #2196F3; border-radius: 4px; text-align: center; }
        .pdf-link a { color: #1976D2; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Einsatzbestätigung</h1>
        <p>Fahrerexpress | kraftfahrer-mieten.com</p>
        <p>Datum: {{heute}}</p>
    </div>

    <div class="section">
        <h3>Fahrer-Information</h3>
        <div class="info-row">
            <span class="label">Name:</span>
            {{fp.vorname}} {{fp.nachname}}
        </div>
    </div>

    <div class="section">
        <h3>Auftraggeber</h3>
        <div class="info-row">
            <span class="label">Unternehmen/Name:</span>
            {{jr.firma_oder_name}}
        </div>
        <div class="info-row">
            <span class="label">Ansprechpartner:</span>
            {{jr.ansprechpartner}}
        </div>
        <div class="info-row">
            <span class="label">Telefon:</span>
            {{jr.telefon}}
        </div>
        <div class="info-row">
            <span class="label">E-Mail:</span>
            {{jr.email}}
        </div>
    </div>

    <div class="section">
        <h3>Einsatz-Details</h3>
        <div class="info-row">
            <span class="label">Zeitraum:</span>
            {{einsatz_zeitraum}}
        </div>
        <div class="info-row">
            <span class="label">Einsatzort/Treffpunkt:</span>
            {{jr.einsatzort}}
        </div>
        <div class="info-row">
            <span class="label">Fahrzeug/Typ:</span>
            {{jr.fahrzeugtyp}}
        </div>
        <div class="info-row">
            <span class="label">Besonderheiten:</span>
            {{jr.besonderheiten}}
        </div>
    </div>

    <div class="section">
        <h3>Konditionen</h3>
        <div class="info-row">
            <span class="label">Abrechnung:</span>
            {{ja.rate_type_display}}
        </div>
        <div class="info-row">
            <span class="label">Satz:</span>
            {{ja.rate_value}} (zzgl. gesetzlicher USt)
        </div>
    </div>

    <div class="agreements">
        <h4>Vereinbarungen (Fahrerexpress)</h4>
        <ol>
            <li><strong>Vermittlungsprovision:</strong> 15 % des Nettohonorars – ausschließlich für den vermittelten Einsatz; fällig nur bei tatsächlichem Einsatz.</li>
            <li><strong>Abrechnung/Zahlung:</strong> Der Fahrer rechnet direkt mit dem Auftraggeber ab (Zahlungsziel: 14 Tage, ohne Abzug). Die Provision wird dem Fahrer von Fahrerexpress gesondert in Rechnung gestellt.</li>
            <li><strong>Folgeaufträge:</strong> Auch direkt vereinbarte Folgeeinsätze mit diesem Auftraggeber sind provisionspflichtig, solange keine Festanstellung vorliegt.</li>
            <li><strong>Informationspflicht:</strong> Direkt vereinbarte Folgeaufträge sind Fahrerexpress unaufgefordert mitzuteilen.</li>
            <li><strong>Vertragsstrafe:</strong> Bei Verstoß gegen Ziff. 3) oder 4) fällt eine Vertragsstrafe von 2.500 € je Verstoß an; die Geltendmachung eines weitergehenden Schadens bleibt vorbehalten.</li>
            <li><strong>Rechtsverhältnis:</strong> Einsatz als selbstständiger Unternehmer (keine Arbeitnehmerüberlassung). Der Fahrer stellt sicher, dass erforderliche Qualifikationen/Berechtigungen/Versicherungen vorliegen.</li>
        </ol>
    </div>

    <div class="no-show">
        <h4>Nichterscheinen / kurzfristige Absage (No-Show)</h4>
        <p>Erscheint der Fahrer ohne triftigen Grund nicht zum vereinbarten Einsatzbeginn oder sagt er kurzfristig ab, gilt dies als No-Show. Der pauschalierte Schadensersatz richtet sich nach der verbleibenden Vorlaufzeit bis Einsatzbeginn:</p>
        <ul>
            <li><strong>&lt; 6 Stunden:</strong> 100 % des vereinbarten Tagesäquivalents (mind. 350 €, max. 900 €)</li>
            <li><strong>6–24 Stunden:</strong> 60 % (mind. 300 €)</li>
            <li><strong>24–48 Stunden:</strong> 30 % (mind. 250 €)</li>
        </ul>
        <p style="font-size: 14px;">Dem Fahrer bleibt der Nachweis vorbehalten, dass kein oder ein geringerer Schaden entstanden ist; dem Auftraggeber bleibt der Nachweis eines höheren Schadens unbenommen. Höhere Gewalt (z. B. akute Krankheit mit Attest, Unfall) ist ausgenommen; die Verhinderung ist unverzüglich mitzuteilen.</p>
    </div>

    <div class="section">
        <h3>Mehrwertsteuer</h3>
        <p>Die Beträge verstehen sich zzgl. gesetzlicher Umsatzsteuer.</p>
    </div>

    {{pdf_link_section}}

    <div class="footer">
        <p><strong>Fahrerexpress</strong><br>
        kraftfahrer-mieten.com<br>
        E-Mail: info@kraftfahrer-mieten.com<br>
        Telefon: +49-1577-1442285</p>
    </div>
</body>
</html>`;

const txtTpl = `EINSATZBESTÄTIGUNG
Fahrerexpress | kraftfahrer-mieten.com
Datum: {{heute}}

=====================================

FAHRER-INFORMATION
==================
Name: {{fp.vorname}} {{fp.nachname}}

AUFTRAGGEBER
============
Unternehmen/Name: {{jr.firma_oder_name}}
Ansprechpartner: {{jr.ansprechpartner}}
Telefon: {{jr.telefon}}
E-Mail: {{jr.email}}

EINSATZ-DETAILS
===============
Zeitraum: {{einsatz_zeitraum}}
Einsatzort/Treffpunkt: {{jr.einsatzort}}
Fahrzeug/Typ: {{jr.fahrzeugtyp}}
Besonderheiten: {{jr.besonderheiten}}

KONDITIONEN
===========
Abrechnung: {{ja.rate_type_display}}
Satz: {{ja.rate_value}} (zzgl. gesetzlicher USt)

VEREINBARUNGEN (FAHREREXPRESS)
==============================

1. Vermittlungsprovision: 15 % des Nettohonorars – ausschließlich für den vermittelten Einsatz; fällig nur bei tatsächlichem Einsatz.

2. Abrechnung/Zahlung: Der Fahrer rechnet direkt mit dem Auftraggeber ab (Zahlungsziel: 14 Tage, ohne Abzug). Die Provision wird dem Fahrer von Fahrerexpress gesondert in Rechnung gestellt.

3. Folgeaufträge: Auch direkt vereinbarte Folgeeinsätze mit diesem Auftraggeber sind provisionspflichtig, solange keine Festanstellung vorliegt.

4. Informationspflicht: Direkt vereinbarte Folgeaufträge sind Fahrerexpress unaufgefordert mitzuteilen.

5. Vertragsstrafe: Bei Verstoß gegen Ziff. 3) oder 4) fällt eine Vertragsstrafe von 2.500 € je Verstoß an; die Geltendmachung eines weitergehenden Schadens bleibt vorbehalten.

6. Rechtsverhältnis: Einsatz als selbstständiger Unternehmer (keine Arbeitnehmerüberlassung). Der Fahrer stellt sicher, dass erforderliche Qualifikationen/Berechtigungen/Versicherungen vorliegen.

NICHTERSCHEINEN / KURZFRISTIGE ABSAGE (NO-SHOW)
===============================================

Erscheint der Fahrer ohne triftigen Grund nicht zum vereinbarten Einsatzbeginn oder sagt er kurzfristig ab, gilt dies als No-Show. Der pauschalierte Schadensersatz richtet sich nach der verbleibenden Vorlaufzeit bis Einsatzbeginn:

< 6 Stunden: 100 % des vereinbarten Tagesäquivalents (mind. 350 €, max. 900 €)
6–24 Stunden: 60 % (mind. 300 €)  
24–48 Stunden: 30 % (mind. 250 €)

Dem Fahrer bleibt der Nachweis vorbehalten, dass kein oder ein geringerer Schaden entstanden ist; dem Auftraggeber bleibt der Nachweis eines höheren Schadens unbenommen. Höhere Gewalt (z. B. akute Krankheit mit Attest, Unfall) ist ausgenommen; die Verhinderung ist unverzüglich mitzuteilen.

MEHRWERTSTEUER
==============
Die Beträge verstehen sich zzgl. gesetzlicher Umsatzsteuer.

=====================================

Fahrerexpress
kraftfahrer-mieten.com
E-Mail: info@kraftfahrer-mieten.com
Telefon: +49-1577-1442285`;

// simple replacer
function render(tpl: string, vars: Record<string, string | number | null | undefined>) {
  return tpl.replace(/{{\s*([^}]+)\s*}}/g, (_, k) => {
    const v = vars[k.trim()];
    return (v === undefined || v === null) ? "" : String(v);
  });
}

function ensure(v?: string | null) { return !!(v && v.trim().length); }

// derive display helpers
function withCurrency(n?: number | null, rateType?: string) {
  if (typeof n === "number") {
    const formatted = new Intl.NumberFormat("de-DE", { 
      style: "currency", 
      currency: "EUR" 
    }).format(n);
    
    // Verhindere doppeltes € - formatiere mit Suffix
    const baseAmount = new Intl.NumberFormat("de-DE", { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(n);
    
    if (rateType === "hourly") {
      return `${baseAmount} €/Std`;
    } else if (rateType === "daily") {
      return `${baseAmount} €/Tag`;
    }
    return `${baseAmount} €`;
  }
  return "nach Absprache";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { 
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const { assignment_id, mode }: { assignment_id: string; mode?: DeliveryMode } = await req.json();
    const deliveryMode: DeliveryMode = mode ?? 'inline';
    
    if (!assignment_id) {
      return new Response(JSON.stringify({ ok: false, error: "assignment_id required" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Daten holen (Assignment + Job + Fahrer)
    // Passen ggf. die Feldnamen an euer Schema an.
    const { data: rows, error } = await sb
      .from("job_assignments")
      .select(`
        id, job_id, driver_id, status,
        rate_type, rate_value, start_date, end_date, admin_note,
        job_requests:job_id (
          id, status, customer_name, company, customer_phone, customer_email,
          einsatzort, fahrzeugtyp, besonderheiten, zeitraum
        ),
        fahrer_profile:driver_id (
          id, vorname, nachname, email, telefon
        )
      `)
      .eq("id", assignment_id)
      .limit(1)
      .maybeSingle();

    if (error || !rows) {
      return new Response(JSON.stringify({ ok: false, error: "assignment not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const ja = rows as any;
    const jr = ja.job_requests;
    const fp = ja.fahrer_profile;

    // Pflicht-Validierungen (hard stop)
    if (!fp || !ensure(fp.email) || !ensure(fp.vorname) || !ensure(fp.nachname)) {
      return new Response(JSON.stringify({ ok: false, error: "Fahrerdaten unvollständig." }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    if (!jr) {
      return new Response(JSON.stringify({ ok: false, error: "Auftragsdaten fehlen." }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // NEUE VALIDIERUNGEN (Blocker vor Versand)
    
    // 1. Auftraggeber-Name darf kein Platzhalter sein
    const companyName = jr.company || jr.customer_name || "";
    if (!companyName || companyName.toLowerCase().includes("bitte wählen") || companyName.toLowerCase().includes("bitte waehlen")) {
      return new Response(JSON.stringify({ ok: false, error: "Auftraggeber-Name ist unvollständig (Platzhalter erkannt)." }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 2. Mindestens ein Kontakt (Telefon oder E-Mail) - bereits vorhanden aber erweitert
    if (!ensure(jr.customer_phone) && !ensure(jr.customer_email)) {
      return new Response(JSON.stringify({ ok: false, error: "Kontakt Auftraggeber fehlt (Telefon oder E-Mail)." }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const zeitraum = ja.start_date && ja.end_date
      ? new Intl.DateTimeFormat("de-DE").format(new Date(ja.start_date)) +
        " – " + new Intl.DateTimeFormat("de-DE").format(new Date(ja.end_date))
      : jr.zeitraum || "nach Absprache";

    const adminEmailRes = await sb.from("admin_settings").select("admin_email").limit(1).maybeSingle();
    const adminEmail = adminEmailRes.data?.admin_email ?? "info@kraftfahrer-mieten.com";

    const vars = {
      "fp.vorname": fp.vorname,
      "fp.nachname": fp.nachname,
      "jr.firma_oder_name": jr.company || jr.customer_name || "",
      "jr.ansprechpartner": jr.customer_name || "",
      "jr.telefon": jr.customer_phone || "",
      "jr.email": jr.customer_email || "",
      "jr.einsatzort": jr.einsatzort || "Siehe Nachricht",
      "jr.fahrzeugtyp": jr.fahrzeugtyp || "",
      "jr.besonderheiten": jr.besonderheiten || "",
      "ja.rate_type": ja.rate_type || "nach Absprache",
      "ja.rate_type_display": ja.rate_type === "hourly" ? "Stundensatz" : ja.rate_type === "daily" ? "Tagessatz" : "nach Absprache",
      "ja.rate_value": ja.rate_value || "",
      "einsatz_zeitraum": zeitraum,
      "heute": new Intl.DateTimeFormat("de-DE").format(new Date()),
    };

    // Anzeige für Satz (korrekt formatiert, ohne doppeltes €)
    const satzAnzeige = withCurrency(typeof ja.rate_value === "number" ? ja.rate_value : undefined, ja.rate_type);
    
    // PDF bauen (Simple PDF – Text-basiert)
    const pdfBytes = await htmlToSimplePdf(render(htmlTpl, { ...vars, "ja.rate_value": satzAnzeige, "pdf_link_section": "" }), render(txtTpl, { ...vars, "ja.rate_value": satzAnzeige }));

    // PDF in private Bucket speichern
    const filenameBase = `driver-confirmation-${new Date().toISOString().slice(0,10)}`;
    const filePath = `confirmations/assignments/${assignment_id}/${filenameBase}.pdf`;
    const up = await sb.storage.from("confirmations").upload(filePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (up.error) {
      console.error("PDF upload error", up.error);
    }

    // Signierte URL erstellen (14 Tage gültig)
    const { data: signedData } = await sb.storage.from("confirmations").createSignedUrl(filePath, 14 * 24 * 60 * 60);
    const pdfUrl = signedData?.signedUrl ?? null;

    // PDF-Link-Sektion für E-Mail
    const pdfLinkSection = pdfUrl && deliveryMode !== 'pdf-only' 
      ? `<div class="pdf-link">
           <h4>📄 PDF-Download</h4>
           <p><a href="${pdfUrl}" target="_blank">Einsatzbestätigung als PDF herunterladen</a></p>
           <p style="font-size: 12px; color: #666;">Der Link ist 14 Tage gültig.</p>
         </div>`
      : '';

    // HTML und Text für E-Mail bauen
    const html = deliveryMode === 'pdf-only' 
      ? '<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>Einsatzbestätigung</h2><p>Die Einsatzbestätigung liegt als PDF im Anhang bei.</p><p>Fahrerexpress | kraftfahrer-mieten.com</p></div>'
      : render(htmlTpl, { ...vars, "ja.rate_value": satzAnzeige, "pdf_link_section": pdfLinkSection });
    
    const txt = deliveryMode === 'pdf-only'
      ? 'Einsatzbestätigung\n\nDie Einsatzbestätigung liegt als PDF im Anhang bei.\n\nFahrerexpress | kraftfahrer-mieten.com'
      : render(txtTpl, { ...vars, "ja.rate_value": satzAnzeige }) + (pdfUrl ? `\n\nPDF-Download: ${pdfUrl} (gültig 14 Tage)` : '');

    // E-Mail via Resend API senden (TO: Fahrer, BCC: Admin)
    const subject = `Einsatzbestätigung – ${vars["jr.firma_oder_name"]} – ${jr.einsatzort || "Einsatz"} – ${zeitraum}`;
    
    // Build email payload for Resend API
    const emailPayload: any = {
      from: MAIL_FROM,
      to: [fp.email],
      bcc: [adminEmail],
      subject,
      html,
      text: txt,
    };

    // PDF anhängen nur bei 'both' oder 'pdf-only'
    if (deliveryMode === 'both' || deliveryMode === 'pdf-only') {
      // Convert PDF bytes to base64 for Resend API
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
      emailPayload.attachments = [{
        filename: `${filenameBase}.pdf`,
        content: pdfBase64,
        content_type: "application/pdf"
      }];
    }

    const mailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailPayload),
    });

    let status: "sent" | "failed" = "sent";
    if (!mailRes.ok) status = "failed";

    // email_log schreiben mit neuen Feldern
    await sb.from("email_log").insert({
      template: "driver_confirmation_v2",
      subject,
      recipient: fp.email,
      status,
      assignment_id,
      job_id: jr.id,
      delivery_mode: deliveryMode,
      pdf_path: filePath,
      pdf_url: pdfUrl,
      sent_at: new Date().toISOString(),
    });

    if (!mailRes.ok) {
      const errTxt = await mailRes.text();
      return new Response(JSON.stringify({ ok: false, error: `Mail error: ${errTxt}` }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      pdf_path: filePath, 
      pdf_url: pdfUrl, 
      delivery_mode: deliveryMode 
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ ok: false, error: "unexpected error" }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});