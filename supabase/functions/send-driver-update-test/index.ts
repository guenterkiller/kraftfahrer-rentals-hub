import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import {
  buildDriverUnsubscribeUrl,
  makeDriverUnsubscribeToken,
} from "../_shared/driver-unsubscribe-token.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Feste Allowlist — Test-Endpoint, kann nur an interne Adressen senden.
const TEST_RECIPIENT_DEFAULT = "info@kraftfahrer-mieten.com";
const TEST_RECIPIENT_ALLOWLIST = new Set<string>([
  "info@kraftfahrer-mieten.com",
  "guenter.killer@t-online.de",
]);

const SUBJECT =
  "Wichtige Information für unsere Fahrer – aktuelle Regelungen & kurze Rückmeldung erbeten";

const BRAND = {
  navy: "#0d2340",
  red: "#b81c1c",
  lightGray: "#f8fafc",
  pageGray: "#f3f4f6",
  border: "#e5e7eb",
  text: "#374151",
  muted: "#6b7280",
  footerMuted: "#cbd5e1",
  footerLine: "#1e3a5f",
  footerSubtle: "#94a3b8",
  white: "#ffffff",
};

const buildBodyText = (name: string | null | undefined, unsubscribeUrl: string) => {
  const greetingName = name && name.trim().length > 0
    ? `Hallo ${name.trim()},`
    : "Guten Tag,";

  return `${SUBJECT}

DESIGN-TESTMAIL – Versand ausschließlich zur Layoutprüfung. Fahrer werden erst nach ausdrücklicher Freigabe angeschrieben.

${greetingName}

vielen Dank, dass Sie Teil unseres Fahrer-Netzwerks bei Fahrerexpress sind. Mit dieser E-Mail informieren wir Sie über die aktuell gültigen Regelungen zur Zusammenarbeit und bitten gleichzeitig um eine kurze Rückmeldung zur Aktualisierung unserer Fahrerdatei.

Aktuelle Regelungen zur Zusammenarbeit
- Sie sind selbstständiger Fahrer / selbstständiger Unternehmer. Es besteht kein Arbeitsverhältnis und keine Arbeitnehmerüberlassung.
- Vermittlungsanteil: Bei Standardaufträgen beträgt der Vermittlungsanteil in der Regel 20 % der vereinbarten Netto-Vergütung für die Fahrerdienstleistung. In Sonderfällen kann der Vermittlungsanteil bis zu 25 % betragen. Maßgeblich ist immer das konkrete Auftragsangebot vor Einsatzbeginn.
- Der Vermittlungsanteil bezieht sich ausschließlich auf die reine Fahrerdienstleistung. Auslagen wie An- und Abfahrt, Fahrtkosten, Diesel, Maut, Parkgebühren, Bahn- und Hotelkosten sowie sonstige vorab freigegebene Auslagen werden nicht vom Vermittlungsanteil gekürzt.
- Ihre Rechnung stellen Sie an Fahrerexpress – bereits nach Abzug des Vermittlungsanteils.
- Keine Direktabrechnung mit Auftraggebern. Keine Preisabsprachen mit Auftraggebern.
- Die Rückmeldung „Ich kann übernehmen" ist ausschließlich eine Verfügbarkeitsmeldung. Die finale, verbindliche Einsatzbestätigung erfolgt separat durch Fahrerexpress.
- Zahlung: Die Zahlung der vereinbarten Vergütung erfolgt nach vollständiger und ordnungsgemäßer Durchführung des Einsatzes auf Grundlage Ihrer Rechnung an Fahrerexpress. Soweit im konkreten Auftragsangebot nichts anderes vereinbart ist, erfolgt die Zahlung nach Zahlungseingang des Auftraggebers bei Fahrerexpress.
- Sie entscheiden bei jedem Angebot frei, ob Sie es annehmen oder ablehnen.

Rückmeldung: info@kraftfahrer-mieten.com
Abmeldung: ${unsubscribeUrl}

Fahrerexpress-Agentur – Günter Killer
Walther-von-Cronberg-Platz 12, 60594 Frankfurt am Main
Telefon: 01577 1442285
E-Mail: info@kraftfahrer-mieten.com
Web: www.kraftfahrer-mieten.com`;
};

const buildBodyHtml = (name: string | null | undefined, unsubscribeUrl: string, isDummyUnsubscribe: boolean) => {
  const greetingName = name && name.trim().length > 0
    ? `Hallo ${name.trim()},`
    : "Guten Tag,";
  return `
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${SUBJECT}</title>
<style>
  body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  a[x-apple-data-detectors], .footer-link { color: #ffffff !important; text-decoration: none !important; }
  .light-link { color: #b81c1c !important; text-decoration: underline !important; }
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .px { padding-left: 20px !important; padding-right: 20px !important; }
    .header-title { font-size: 22px !important; line-height: 1.25 !important; }
    .header-sub { font-size: 14px !important; }
    .h2 { font-size: 19px !important; }
    .body-text { font-size: 16px !important; line-height: 1.6 !important; }
    .btn a { display: block !important; width: 100% !important; box-sizing: border-box !important; }
    .footer-text { font-size: 13px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.pageGray};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${BRAND.text};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Aktuelle Regelungen zur Zusammenarbeit & kurze Rückmeldung erbeten.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.pageGray}" style="background-color:${BRAND.pageGray};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" class="container" width="640" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.white}" style="width:640px;max-width:640px;background-color:${BRAND.white};border-collapse:collapse;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr><td bgcolor="${BRAND.navy}" style="background-color:${BRAND.navy};padding:28px 32px;" class="px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="color:${BRAND.white};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                <div class="header-title" style="font-size:26px;font-weight:700;line-height:1.2;color:${BRAND.white};">
                  Fahrerexpress-Agentur<br/>– Günter Killer
                </div>
                <div class="header-sub" style="font-size:15px;color:${BRAND.footerMuted};margin-top:6px;">
                  Vermittlung selbstständiger Fahrer
                </div>
              </td>
            </tr>
          </table>
        </td></tr>
        <!-- Red accent bar -->
        <tr><td bgcolor="${BRAND.red}" style="background-color:${BRAND.red};height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>

        <!-- DESIGN TEST NOTICE -->
        <tr><td class="px" style="padding:16px 32px 0 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.lightGray}" style="background-color:${BRAND.lightGray};border:1px solid ${BRAND.border};border-left:4px solid ${BRAND.red};border-collapse:separate;border-radius:6px;">
            <tr><td style="padding:14px 16px;">
              <p style="margin:0;font-size:14px;line-height:1.5;color:${BRAND.navy};font-weight:700;">DESIGN-TESTMAIL</p>
              <p style="margin:4px 0 0 0;font-size:13px;line-height:1.5;color:${BRAND.text};">
                Diese E-Mail wurde ausschließlich zur Layoutprüfung an info@kraftfahrer-mieten.com gesendet.${isDummyUnsubscribe ? " Der Abmeldelink ist in dieser Designvorschau ein Dummy-Link; finale Fahrer-Mails verwenden echte fahrerbezogene HMAC-Links." : " Der Abmeldelink wurde mit einem echten Fahrerprofil erzeugt."}
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- GREETING -->
        <tr><td class="px" style="padding:28px 32px 8px 32px;">
          <p class="body-text" style="margin:0 0 14px 0;font-size:17px;font-weight:600;color:${BRAND.navy};">${greetingName}</p>
          <p class="body-text" style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.text};">
            vielen Dank, dass Sie Teil unseres Fahrer-Netzwerks bei Fahrerexpress sind.
            Mit dieser E-Mail informieren wir Sie über die aktuell gültigen Regelungen zur
            Zusammenarbeit und bitten gleichzeitig um eine kurze Rückmeldung zur Aktualisierung
            unserer Fahrerdatei.
          </p>
        </td></tr>

        <!-- CARD: Regelungen -->
        <tr><td class="px" style="padding:20px 32px 8px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.white}" style="background-color:${BRAND.white};border:1px solid ${BRAND.border};border-left:4px solid ${BRAND.red};border-collapse:separate;border-radius:6px;">
            <tr><td style="padding:20px 22px;">
              <h2 class="h2" style="margin:0 0 14px 0;font-size:18px;color:${BRAND.navy};font-weight:700;">
                Aktuelle Regelungen zur Zusammenarbeit
              </h2>
              <ul class="body-text" style="margin:0;padding-left:20px;font-size:15px;line-height:1.65;color:${BRAND.text};">
                <li style="margin-bottom:8px;">Sie sind <strong>selbstständiger Fahrer / selbstständiger Unternehmer</strong>. Es besteht kein Arbeitsverhältnis und keine Arbeitnehmerüberlassung.</li>
                <li style="margin-bottom:8px;"><strong>Vermittlungsanteil:</strong> Bei Standardaufträgen beträgt der Vermittlungsanteil in der Regel 20 % der vereinbarten Netto-Vergütung für die Fahrerdienstleistung. In Sonderfällen kann der Vermittlungsanteil bis zu 25 % betragen. Maßgeblich ist immer das konkrete Auftragsangebot vor Einsatzbeginn.</li>
                <li style="margin-bottom:8px;">Der Vermittlungsanteil bezieht sich ausschließlich auf die reine Fahrerdienstleistung. <strong>Auslagen</strong> wie An- und Abfahrt, Fahrtkosten, Diesel, Maut, Parkgebühren, Bahn- und Hotelkosten sowie sonstige vorab freigegebene Auslagen <strong>werden nicht vom Vermittlungsanteil gekürzt</strong>.</li>
                <li style="margin-bottom:8px;">Ihre <strong>Rechnung</strong> stellen Sie an Fahrerexpress – bereits <strong>nach Abzug</strong> des Vermittlungsanteils.</li>
                <li style="margin-bottom:8px;">Keine Direktabrechnung mit Auftraggebern. Keine Preisabsprachen mit Auftraggebern.</li>
                <li style="margin-bottom:8px;">Die Rückmeldung <strong>„Ich kann übernehmen"</strong> ist ausschließlich eine Verfügbarkeitsmeldung. Die finale, verbindliche Einsatzbestätigung erfolgt separat durch Fahrerexpress.</li>
                <li style="margin-bottom:8px;"><strong>Zahlung:</strong> Die Zahlung der vereinbarten Vergütung erfolgt nach vollständiger und ordnungsgemäßer Durchführung des Einsatzes auf Grundlage Ihrer Rechnung an Fahrerexpress. Soweit im konkreten Auftragsangebot nichts anderes vereinbart ist, erfolgt die Zahlung nach Zahlungseingang des Auftraggebers bei Fahrerexpress.</li>
                <li style="margin-bottom:0;">Sie entscheiden bei jedem Angebot frei, ob Sie es annehmen oder ablehnen.</li>
              </ul>
            </td></tr>
          </table>
        </td></tr>

        <!-- CARD: Fahrerdatei -->
        <tr><td class="px" style="padding:14px 32px 8px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.lightGray}" style="background-color:${BRAND.lightGray};border:1px solid ${BRAND.border};border-collapse:separate;border-radius:6px;">
            <tr><td style="padding:20px 22px;">
              <h2 class="h2" style="margin:0 0 12px 0;font-size:18px;color:${BRAND.navy};font-weight:700;">
                Aktualisierung unserer Fahrerdatei
              </h2>
              <p class="body-text" style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:${BRAND.text};">
                Einige Fahrer haben bisher noch keinen Auftrag über Fahrerexpress übernommen.
                Damit wir unsere Fahrerdatei aktuell halten können, bitten wir Sie um eine kurze
                Rückmeldung, falls Sie weiterhin grundsätzlich an Einsätzen interessiert sind,
                bisher aber noch keinen Auftrag angenommen haben.
              </p>
              <p class="body-text" style="margin:0 0 10px 0;font-size:15px;line-height:1.6;color:${BRAND.text};">
                Teilen Sie uns gerne kurz mit, woran es bisher gelegen hat, zum Beispiel:
              </p>
              <ul class="body-text" style="margin:0 0 14px 0;padding-left:20px;font-size:15px;line-height:1.65;color:${BRAND.text};">
                <li>Einsatzort hat nicht gepasst</li>
                <li>Termin hat nicht gepasst</li>
                <li>Vergütung hat nicht gepasst</li>
                <li>Fahrzeugart / Tätigkeit hat nicht gepasst</li>
                <li>derzeit keine Verfügbarkeit</li>
                <li>grundsätzlich kein Interesse mehr</li>
              </ul>
              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="btn" style="margin-top:6px;">
                <tr><td align="center" bgcolor="${BRAND.red}" style="background-color:${BRAND.red};border-radius:6px;">
                  <a href="mailto:info@kraftfahrer-mieten.com?subject=R%C3%BCckmeldung%20Fahrerdatei"
                     style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:600;color:${BRAND.white};text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                    Jetzt Rückmeldung geben
                  </a>
                </td></tr>
              </table>
              <p class="body-text" style="margin:12px 0 0 0;font-size:13px;color:${BRAND.muted};">
                Oder einfach auf den Abmeldelink am Ende dieser E-Mail klicken.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- CARD: Was ist zu tun -->
        <tr><td class="px" style="padding:14px 32px 8px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.white}" style="background-color:${BRAND.white};border:1px solid ${BRAND.border};border-collapse:separate;border-radius:6px;">
            <tr><td style="padding:20px 22px;">
              <h2 class="h2" style="margin:0 0 12px 0;font-size:18px;color:${BRAND.navy};font-weight:700;">
                Was ist zu tun?
              </h2>
              <p class="body-text" style="margin:0 0 10px 0;font-size:15px;line-height:1.6;color:${BRAND.text};">
                Wenn Sie weiterhin grundsätzlich an Auftragsangeboten interessiert sind, freuen
                wir uns über eine kurze Rückmeldung – besonders dann, wenn Sie bisher noch
                keinen Auftrag über Fahrerexpress übernommen haben.
              </p>
              <p class="body-text" style="margin:0 0 10px 0;font-size:15px;line-height:1.6;color:${BRAND.text};">
                Wenn Sie weiterhin Angebote erhalten möchten und sich für Sie nichts geändert
                hat, müssen Sie nichts weiter tun.
              </p>
              <p class="body-text" style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.text};">
                <strong>Abmeldung:</strong> Sie können sich jederzeit über den Abmeldelink am Ende dieser
                E-Mail oder formlos per E-Mail an
                <a class="light-link" href="mailto:info@kraftfahrer-mieten.com" style="color:${BRAND.red} !important;text-decoration:underline;">info@kraftfahrer-mieten.com</a>
                vom Erhalt weiterer Auftragsangebote abmelden. Die Angabe eines Abmeldegrundes
                ist freiwillig.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td class="px" style="padding:18px 32px 28px 32px;">
          <p class="body-text" style="margin:0;font-size:15px;line-height:1.6;color:${BRAND.navy};font-weight:600;">
            Vielen Dank für Ihre Unterstützung und gute Fahrt!
          </p>
        </td></tr>

        <!-- FOOTER -->
        <tr><td bgcolor="${BRAND.navy}" style="background-color:${BRAND.navy};padding:24px 32px;" class="px">
          <p class="footer-text" style="margin:0 0 8px 0;font-size:14px;line-height:1.55;color:${BRAND.white};font-weight:700;">
            Fahrerexpress-Agentur
          </p>
          <p class="footer-text" style="margin:0 0 10px 0;font-size:13px;line-height:1.6;color:${BRAND.footerMuted};">
            Inhaber: Günter Killer<br/>
            Walther-von-Cronberg-Platz 12<br/>
            60594 Frankfurt am Main
          </p>
          <p class="footer-text" style="margin:0 0 10px 0;font-size:13px;line-height:1.6;color:${BRAND.footerMuted};">
            Telefon: <a class="footer-link" href="tel:+4915771442285" style="color:${BRAND.white} !important;text-decoration:none;">01577 1442285</a><br/>
            E-Mail: <a class="footer-link" href="mailto:info@kraftfahrer-mieten.com" style="color:${BRAND.white} !important;text-decoration:none;">info@kraftfahrer-mieten.com</a><br/>
            Web: <a class="footer-link" href="https://www.kraftfahrer-mieten.com" style="color:${BRAND.white} !important;text-decoration:none;">www.kraftfahrer-mieten.com</a>
          </p>
          <p class="footer-text" style="margin:14px 0 0 0;padding-top:12px;border-top:1px solid ${BRAND.footerLine};font-size:12px;line-height:1.55;color:${BRAND.footerSubtle};">
            Sie erhalten diese E-Mail, weil Sie sich als Fahrer bei Fahrerexpress registriert haben.
            Wenn Sie künftig keine Fahrerinformationen oder Auftragsbenachrichtigungen mehr erhalten möchten,
            können Sie sich
            <a class="footer-link" href="${unsubscribeUrl}" style="color:${BRAND.white} !important;text-decoration:underline;">hier abmelden</a>.
          </p>
        </td></tr>
      </table>

      <p style="margin:14px 0 0 0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;">
        <strong>TESTMAIL</strong> – Designvorschau für info@kraftfahrer-mieten.com. Versand an Fahrer erst nach ausdrücklicher Freigabe.
      </p>
    </td></tr>
  </table>
</body>
</html>
`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const internalSecret = Deno.env.get("INTERNAL_FN_SECRET") || "";
    if (!internalSecret) {
      return new Response(JSON.stringify({ error: "INTERNAL_FN_SECRET missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let name: string | null = null;
    let recipientOverride: string | null = null;
    try {
      if (req.headers.get("content-type")?.includes("application/json")) {
        const body = await req.json().catch(() => ({}));
        if (body && typeof body.name === "string") name = body.name;
        if (body && typeof body.to === "string") recipientOverride = body.to.trim().toLowerCase();
      }
    } catch (_) { /* ignore */ }

    const recipient = recipientOverride && TEST_RECIPIENT_ALLOWLIST.has(recipientOverride)
      ? recipientOverride
      : TEST_RECIPIENT_DEFAULT;

    // Tokenbasierten Abmeldelink erzeugen (zeigt auf driver-unsubscribe Edge Function).
    // Versucht Fahrer-Profil für die Testadresse zu finden; sonst Dummy-ID (Link zeigt dann
    // korrekt auf die Abmeldeseite, würde aber als "Ungültiger Abmeldelink" beantwortet).
    let driverId = "00000000-0000-0000-0000-000000000000";
    let driverIdSource: "profile" | "dummy" = "dummy";
    try {
      const { data: driver } = await supabase
        .from("fahrer_profile")
        .select("id, vorname")
        .ilike("email", recipient)
        .maybeSingle();
      if (driver?.id) {
        driverId = driver.id;
        driverIdSource = "profile";
        if (!name && driver.vorname) name = driver.vorname;
      }
    } catch (_) { /* ignore */ }

    const token = await makeDriverUnsubscribeToken(driverId, internalSecret);
    const unsubscribeUrl = buildDriverUnsubscribeUrl(token);

    const from = Deno.env.get("MAIL_FROM") ||
      "Fahrerexpress Fahrer-Team <info@kraftfahrer-mieten.com>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        reply_to: "info@kraftfahrer-mieten.com",
        to: [recipient],
        subject: SUBJECT,
        html: buildBodyHtml(name ?? "Günter Killer", unsubscribeUrl),
      }),
    });

    const text = await res.text();
    return new Response(
      JSON.stringify({
        ok: res.ok,
        status: res.status,
        body: text,
        recipient,
        subject: SUBJECT,
        unsubscribe_url: unsubscribeUrl,
        driver_id_source: driverIdSource,
      }),
      {
        status: res.ok ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});