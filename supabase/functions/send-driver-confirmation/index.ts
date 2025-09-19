// supabase/functions/send-driver-confirmation/index.ts
// Deno Edge Function – sofortiger Versand der Fahrer-Einsatzbestätigung (E-Mail + PDF)
// Erwartet: POST { assignment_id: string, mode?: 'inline' | 'both' | 'pdf-only' }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { htmlToSimplePdf } from "./pdf.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "Kraftfahrer-Mieten <info@kraftfahrer-mieten.com>";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!

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
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.6; }
        .header { margin-bottom: 30px; }
        .header h1 { color: #2196F3; margin: 0 0 10px 0; }
        .section { margin-bottom: 25px; padding: 15px; border-left: 4px solid #2196F3; background-color: #f8f9fa; }
        .section h3 { margin-top: 0; color: #1976D2; }
        .bullet-list { margin: 10px 0; padding-left: 0; }
        .bullet-list li { list-style: none; margin: 8px 0; }
        .bullet-list li:before { content: "• "; font-weight: bold; color: #2196F3; }
        .no-show { margin-top: 30px; padding: 15px; background-color: #ffebee; border: 1px solid #f44336; border-radius: 4px; }
        .no-show h4 { color: #d32f2f; margin-top: 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666; }
        .pdf-link { margin-top: 30px; padding: 15px; background-color: #e3f2fd; border: 1px solid #2196F3; border-radius: 4px; text-align: center; }
        .pdf-link a { color: #1976D2; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Einsatzbestätigung</h1>
        <p>Hallo {{fp.vorname}} {{fp.nachname}},<br>
        hiermit bestätigen wir Ihren Einsatz als selbstständiger Fahrer.</p>
    </div>

    <div class="section">
        <h3>AUFTRAGGEBER (Kunde)</h3>
        <ul class="bullet-list">
            <li>Unternehmen/Name: {{jr.firma_oder_name}}</li>
            <li>Ansprechpartner: {{jr.ansprechpartner}}</li>
            <li>Anschrift: {{jr.anschrift_vollstaendig}}</li>
            <li>Telefon: {{jr.telefon}}</li>
            <li>E-Mail: {{jr.email}}</li>
        </ul>
    </div>

    <div class="section">
        <h3>EINSATZ</h3>
        <ul class="bullet-list">
            <li>Datum/Zeitraum: {{einsatz_zeitraum}}</li>
            <li>Einsatzort/Treffpunkt: {{jr.einsatzort}}</li>
            <li>Fahrzeug/Typ: {{jr.fahrzeugtyp}}</li>
            <li>Besonderheiten: {{jr.besonderheiten}}</li>
        </ul>
    </div>

    <div class="section">
        <h3>KONDITIONEN (zwischen Auftraggeber und Fahrer)</h3>
        <ul class="bullet-list">
            <li>Vergütung: {{ja.rate_value}} {{ust_hinweis}}</li>
            <li>Abrechnung/Zahlung: Der Fahrer rechnet direkt mit dem Auftraggeber ab. Zahlungsziel: 14 Tage, ohne Abzug.</li>
            <li>Spesen/Extras: Nur, wenn vorab schriftlich vereinbart.</li>
        </ul>
    </div>

    <div class="section">
        <h3>ROLLE VON FAHREREXPRESS (Vermittlung)</h3>
        <ul class="bullet-list">
            <li>Fahrerexpress ist Vermittler; es entsteht kein Arbeitsverhältnis mit Fahrerexpress und keine Arbeitnehmerüberlassung.</li>
            <li>Vermittlungsprovision: 15 % des Nettohonorars, nur bei tatsächlichem Einsatz. Die Provision wird Fahrerexpress dem Fahrer gesondert in Rechnung stellen.</li>
            <li>Folgeaufträge mit diesem Auftraggeber sind provisionspflichtig, solange keine Festanstellung vorliegt.</li>
            <li>Informationspflicht: Direkt vereinbarte Folgeeinsätze sind Fahrerexpress unverzüglich mitzuteilen.</li>
            <li>Vertragsstrafe: Bei Verstoß gegen Folgeauftrags-/Informationspflicht 2.500 € je Verstoß; weitergehender Schaden bleibt vorbehalten.</li>
        </ul>
    </div>

    <div class="no-show">
        <h4>Nichterscheinen / kurzfristige Absage (No-Show)</h4>
        <p>Erscheint der Fahrer ohne triftigen Grund nicht zum Einsatzbeginn oder sagt er ≤ 24 h vorher ab, gilt dies als No-Show.</p>
        <p>In diesem Fall schuldet der Fahrer dem Auftraggeber einen pauschalierten Schadensersatz von 150 € (alternativ zulässig: 30 % des vereinbarten Tages-/Einsatzsatzes, max. 250 €).</p>
        <p style="font-size: 14px;">Dem Fahrer bleibt der Nachweis vorbehalten, dass kein oder ein geringerer Schaden entstanden ist; dem Auftraggeber bleibt der Nachweis eines höheren Schadens unbenommen. Höhere Gewalt (z. B. Krankheit mit Attest, Unfall) ist ausgenommen; die Verhinderung ist unverzüglich mitzuteilen.</p>
        <p>Fahrerexpress bemüht sich im No-Show-Fall um Ersatz.</p>
    </div>

    <div class="section">
        <h3>Rechtliches</h3>
        <ul class="bullet-list">
            <li>Rechtsverhältnis: Einsatz als selbstständiger Unternehmer; der Fahrer stellt sicher, dass erforderliche Qualifikationen/Berechtigungen/Versicherungen vorliegen.</li>
            <li>Umsatzsteuer: {{ust_hinweis_lang}}</li>
            <li>Vertragsschluss: Mit Bestätigung/Antritt des Einsatzes kommt der Vertrag zwischen Auftraggeber (Kunde) und Fahrer zustande.</li>
        </ul>
    </div>

    <p><strong>Bitte prüfen Sie die Angaben; Abweichungen umgehend melden.</strong></p>

    {{pdf_link_section}}

    <div class="footer">
        <p><strong>Viele Grüße</strong><br>
        Fahrerexpress | kraftfahrer-mieten.com<br>
        E-Mail: info@kraftfahrer-mieten.com | Tel: +49 1577 1442285</p>
    </div>
</body>
</html>`;

const txtTpl = `Hallo {{fp.vorname}} {{fp.nachname}},
hiermit bestätigen wir Ihren Einsatz als selbstständiger Fahrer.

AUFTRAGGEBER (Kunde)
• Unternehmen/Name: {{jr.firma_oder_name}}
• Ansprechpartner: {{jr.ansprechpartner}}
• Anschrift: {{jr.anschrift_vollstaendig}}
• Telefon: {{jr.telefon}}
• E-Mail: {{jr.email}}

EINSATZ
• Datum/Zeitraum: {{einsatz_zeitraum}}
• Einsatzort/Treffpunkt: {{jr.einsatzort}}
• Fahrzeug/Typ: {{jr.fahrzeugtyp}}
• Besonderheiten: {{jr.besonderheiten}}

KONDITIONEN (zwischen Auftraggeber und Fahrer)
• Vergütung: {{ja.rate_value}} {{ust_hinweis}}
• Abrechnung/Zahlung: Der Fahrer rechnet direkt mit dem Auftraggeber ab. Zahlungsziel: 14 Tage, ohne Abzug.
• Spesen/Extras: Nur, wenn vorab schriftlich vereinbart.

ROLLE VON FAHREREXPRESS (Vermittlung)
• Fahrerexpress ist Vermittler; es entsteht kein Arbeitsverhältnis mit Fahrerexpress und keine Arbeitnehmerüberlassung.
• Vermittlungsprovision: 15 % des Nettohonorars, nur bei tatsächlichem Einsatz. Die Provision wird Fahrerexpress dem Fahrer gesondert in Rechnung stellen.
• Folgeaufträge mit diesem Auftraggeber sind provisionspflichtig, solange keine Festanstellung vorliegt.
• Informationspflicht: Direkt vereinbarte Folgeeinsätze sind Fahrerexpress unverzüglich mitzuteilen.
• Vertragsstrafe: Bei Verstoß gegen Folgeauftrags-/Informationspflicht 2.500 € je Verstoß; weitergehender Schaden bleibt vorbehalten.

Nichterscheinen / kurzfristige Absage (No-Show)

Erscheint der Fahrer ohne triftigen Grund nicht zum Einsatzbeginn oder sagt er ≤ 24 h vorher ab, gilt dies als No-Show.
In diesem Fall schuldet der Fahrer dem Auftraggeber einen pauschalierten Schadensersatz von 150 € (alternativ zulässig: 30 % des vereinbarten Tages-/Einsatzsatzes, max. 250 €).
Dem Fahrer bleibt der Nachweis vorbehalten, dass kein oder ein geringerer Schaden entstanden ist; dem Auftraggeber bleibt der Nachweis eines höheren Schadens unbenommen. Höhere Gewalt (z. B. Krankheit mit Attest, Unfall) ist ausgenommen; die Verhinderung ist unverzüglich mitzuteilen.
Fahrerexpress bemüht sich im No-Show-Fall um Ersatz.

Rechtliches
• Rechtsverhältnis: Einsatz als selbstständiger Unternehmer; der Fahrer stellt sicher, dass erforderliche Qualifikationen/Berechtigungen/Versicherungen vorliegen.
• Umsatzsteuer: {{ust_hinweis_lang}}
• Vertragsschluss: Mit Bestätigung/Antritt des Einsatzes kommt der Vertrag zwischen Auftraggeber (Kunde) und Fahrer zustande.

Bitte prüfen Sie die Angaben; Abweichungen umgehend melden.

Viele Grüße
Fahrerexpress | kraftfahrer-mieten.com
E-Mail: info@kraftfahrer-mieten.com | Tel: +49 1577 1442285`;

// simple replacer
function render(tpl: string, vars: Record<string, string | number | null | undefined>) {
  return tpl.replace(/{{\s*([^}]+)\s*}}/g, (_, k) => {
    const v = vars[k.trim()];
    return (v === undefined || v === null) ? "" : String(v);
  });
}

function ensure(v?: string | null) { return !!(v && v.trim().length); }

// Hilfsfunktion für vollständige Adresse (nur customer_* Felder verwenden)
function buildFullAddress(jr: any): string {
  // Neue customer_* Felder verwenden
  const street = jr.customer_street || "";
  const number = jr.customer_house_number || "";
  const zip = jr.customer_postal_code || "";
  const city = jr.customer_city || "";
  
  // Vollständige Adresse zusammenbauen
  if (street && number && zip && city) {
    return `${street} ${number}, ${zip} ${city}`.trim();
  }
  
  // Fallback sollte nicht mehr nötig sein durch Validation
  return jr.einsatzort || "Adresse siehe Nachricht";
}

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

  // Extract email from request body for admin validation
  let email: string | null = null;
  try {
    const body = await req.text();
    const bodyData = JSON.parse(body);
    email = bodyData.email;
    
    // Re-create the request with the original body for later processing
    req = new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: body
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  // Validate admin email
  const ADMIN_EMAIL = "guenter.killer@t-online.de";
  if (email !== ADMIN_EMAIL) {
    console.log('Unauthorized access attempt by:', email);
    return new Response(
      JSON.stringify({ error: 'Zugriff verweigert' }),
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  // Create Supabase client with service role key (bypasses RLS)
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration');
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  const supa = createClient(supabaseUrl, supabaseServiceKey);

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
    const { data: rows, error } = await supa
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

    // 2. Anschrift Auftraggeber muss vollständig sein
    if (!ensure(jr.customer_street) || !ensure(jr.customer_house_number) ||
        !ensure(jr.customer_postal_code) || !ensure(jr.customer_city)) {
      return new Response(JSON.stringify({ ok: false, error: "Anschrift Auftraggeber unvollständig." }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // PLZ muss 5-stellig sein
    if (!/^\d{5}$/.test(jr.customer_postal_code)) {
      return new Response(JSON.stringify({ ok: false, error: "PLZ muss 5-stellig sein." }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // 3. Mindestens ein Kontakt (Telefon oder E-Mail)
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

    const adminEmailRes = await supa.from("admin_settings").select("admin_email").limit(1).maybeSingle();
    const adminEmail = adminEmailRes.data?.admin_email ?? "info@kraftfahrer-mieten.com";

    const vars = {
      "fp.vorname": fp.vorname,
      "fp.nachname": fp.nachname,
      "jr.firma_oder_name": jr.company || jr.customer_name || "",
      "jr.ansprechpartner": jr.customer_name || "",
      "jr.anschrift_vollstaendig": buildFullAddress(jr),
      "jr.telefon": jr.customer_phone || "",
      "jr.email": jr.customer_email || "",
      "jr.einsatzort": jr.einsatzort || "Siehe Nachricht",
      "jr.fahrzeugtyp": jr.fahrzeugtyp || "",
      "jr.besonderheiten": jr.besonderheiten || "",
      "einsatz_zeitraum": zeitraum,
      "ust_hinweis": "zzgl. gesetzlicher USt",
      "ust_hinweis_lang": "Die Vergütung versteht sich zuzüglich der gesetzlichen Umsatzsteuer.",
    };

    // Anzeige für Satz (korrekt formatiert, ohne doppeltes €)
    const satzAnzeige = withCurrency(typeof ja.rate_value === "number" ? ja.rate_value : undefined, ja.rate_type);
    
    // PDF bauen (Simple PDF – Text-basiert)
    const pdfBytes = await htmlToSimplePdf(render(htmlTpl, { ...vars, "ja.rate_value": satzAnzeige, "pdf_link_section": "" }), render(txtTpl, { ...vars, "ja.rate_value": satzAnzeige }));

    // PDF in private Bucket speichern
    const filenameBase = `driver-confirmation-${new Date().toISOString().slice(0,10)}`;
    const filePath = `confirmations/assignments/${assignment_id}/${filenameBase}.pdf`;
    const up = await supa.storage.from("confirmations").upload(filePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (up.error) {
      console.error("PDF upload error", up.error);
    }

    // Signierte URL erstellen (14 Tage gültig)
    const { data: signedData } = await supa.storage.from("confirmations").createSignedUrl(filePath, 14 * 24 * 60 * 60);
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
    const subject = `Einsatzbestätigung – ${vars["jr.firma_oder_name"]} – ${jr.einsatzort || jr.ort || "Einsatz"} – ${zeitraum}`;
    
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
    await supa.from("email_log").insert({
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