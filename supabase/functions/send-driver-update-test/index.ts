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

// Hardcoded recipient — test endpoint only. Cannot be abused to send anywhere else.
const TEST_RECIPIENT = "info@kraftfahrer-mieten.com";

const SUBJECT =
  "Wichtige Information für unsere Fahrer – aktuelle Regelungen & kurze Rückmeldung erbeten";

const buildBodyHtml = (name: string | null | undefined, unsubscribeUrl: string) => {
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
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1f2937;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Aktuelle Regelungen zur Zusammenarbeit & kurze Rückmeldung erbeten.</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" class="container" width="640" cellpadding="0" cellspacing="0" border="0" style="width:640px;max-width:640px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr><td style="background-color:#0d2340;padding:28px 32px;" class="px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                <div class="header-title" style="font-size:26px;font-weight:700;line-height:1.2;color:#ffffff;">
                  Fahrerexpress-Agentur<br/>– Günter Killer
                </div>
                <div class="header-sub" style="font-size:15px;color:#cbd5e1;margin-top:6px;">
                  Vermittlung selbstständiger Fahrer
                </div>
              </td>
            </tr>
          </table>
        </td></tr>
        <!-- Red accent bar -->
        <tr><td style="background-color:#bb2c29;height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>

        <!-- GREETING -->
        <tr><td class="px" style="padding:28px 32px 8px 32px;">
          <p class="body-text" style="margin:0 0 14px 0;font-size:17px;font-weight:600;color:#0d2340;">${greetingName}</p>
          <p class="body-text" style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
            vielen Dank, dass Sie Teil unseres Fahrer-Netzwerks bei Fahrerexpress sind.
            Mit dieser E-Mail informieren wir Sie über die aktuell gültigen Regelungen zur
            Zusammenarbeit und bitten gleichzeitig um eine kurze Rückmeldung zur Aktualisierung
            unserer Fahrerdatei.
          </p>
        </td></tr>

        <!-- CARD: Regelungen -->
        <tr><td class="px" style="padding:20px 32px 8px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #e5e7eb;border-left:4px solid #bb2c29;border-radius:6px;">
            <tr><td style="padding:20px 22px;">
              <h2 class="h2" style="margin:0 0 14px 0;font-size:18px;color:#0d2340;font-weight:700;">
                Aktuelle Regelungen zur Zusammenarbeit
              </h2>
              <ul class="body-text" style="margin:0;padding-left:20px;font-size:15px;line-height:1.65;color:#374151;">
                <li style="margin-bottom:8px;">Sie sind <strong>selbstständiger Fahrer / selbstständiger Unternehmer</strong>. Es besteht kein Arbeitsverhältnis und keine Arbeitnehmerüberlassung.</li>
                <li style="margin-bottom:8px;"><strong>Vermittlungsanteil:</strong> 20 % Standard, in Sonderfällen bis zu 25 %. Maßgeblich ist immer das konkrete Auftragsangebot vor Einsatzbeginn.</li>
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
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;">
            <tr><td style="padding:20px 22px;">
              <h2 class="h2" style="margin:0 0 12px 0;font-size:18px;color:#0d2340;font-weight:700;">
                Aktualisierung unserer Fahrerdatei
              </h2>
              <p class="body-text" style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#374151;">
                Einige Fahrer haben bisher noch keinen Auftrag über Fahrerexpress übernommen.
                Damit wir unsere Fahrerdatei aktuell halten können, bitten wir Sie um eine kurze
                Rückmeldung, falls Sie weiterhin grundsätzlich an Einsätzen interessiert sind,
                bisher aber noch keinen Auftrag angenommen haben.
              </p>
              <p class="body-text" style="margin:0 0 10px 0;font-size:15px;line-height:1.6;color:#374151;">
                Teilen Sie uns gerne kurz mit, woran es bisher gelegen hat, zum Beispiel:
              </p>
              <ul class="body-text" style="margin:0 0 14px 0;padding-left:20px;font-size:15px;line-height:1.65;color:#374151;">
                <li>Einsatzort hat nicht gepasst</li>
                <li>Termin hat nicht gepasst</li>
                <li>Vergütung hat nicht gepasst</li>
                <li>Fahrzeugart / Tätigkeit hat nicht gepasst</li>
                <li>derzeit keine Verfügbarkeit</li>
                <li>grundsätzlich kein Interesse mehr</li>
              </ul>
              <!-- Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="btn" style="margin-top:6px;">
                <tr><td align="center" style="background-color:#bb2c29;border-radius:6px;">
                  <a href="mailto:info@kraftfahrer-mieten.com?subject=R%C3%BCckmeldung%20Fahrerdatei"
                     style="display:inline-block;padding:14px 26px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
                    Jetzt Rückmeldung geben
                  </a>
                </td></tr>
              </table>
              <p class="body-text" style="margin:12px 0 0 0;font-size:13px;color:#6b7280;">
                Oder einfach auf den Abmeldelink am Ende dieser E-Mail klicken.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- CARD: Was ist zu tun -->
        <tr><td class="px" style="padding:14px 32px 8px 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:6px;">
            <tr><td style="padding:20px 22px;">
              <h2 class="h2" style="margin:0 0 12px 0;font-size:18px;color:#0d2340;font-weight:700;">
                Was ist zu tun?
              </h2>
              <p class="body-text" style="margin:0 0 10px 0;font-size:15px;line-height:1.6;color:#374151;">
                Wenn Sie weiterhin grundsätzlich an Auftragsangeboten interessiert sind, freuen
                wir uns über eine kurze Rückmeldung – besonders dann, wenn Sie bisher noch
                keinen Auftrag über Fahrerexpress übernommen haben.
              </p>
              <p class="body-text" style="margin:0 0 10px 0;font-size:15px;line-height:1.6;color:#374151;">
                Wenn Sie weiterhin Angebote erhalten möchten und sich für Sie nichts geändert
                hat, müssen Sie nichts weiter tun.
              </p>
              <p class="body-text" style="margin:0;font-size:15px;line-height:1.6;color:#374151;">
                Wenn Sie künftig keine Auftragsangebote mehr erhalten möchten, nutzen Sie bitte
                den Abmeldelink am Ende dieser E-Mail („hier abmelden").
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td class="px" style="padding:18px 32px 28px 32px;">
          <p class="body-text" style="margin:0;font-size:15px;line-height:1.6;color:#0d2340;font-weight:600;">
            Vielen Dank für Ihre Unterstützung und gute Fahrt!
          </p>
        </td></tr>

        <!-- FOOTER -->
        <tr><td style="background-color:#0d2340;padding:24px 32px;" class="px">
          <p class="footer-text" style="margin:0 0 8px 0;font-size:14px;line-height:1.55;color:#ffffff;font-weight:700;">
            Fahrerexpress-Agentur
          </p>
          <p class="footer-text" style="margin:0 0 10px 0;font-size:13px;line-height:1.6;color:#cbd5e1;">
            Inhaber: Günter Killer<br/>
            Walther-von-Cronberg-Platz 12<br/>
            60594 Frankfurt am Main
          </p>
          <p class="footer-text" style="margin:0 0 10px 0;font-size:13px;line-height:1.6;color:#cbd5e1;">
            📞 <a href="tel:+4915771442285" style="color:#ffffff;text-decoration:none;">01577 1442285</a><br/>
            ✉ <a href="mailto:info@kraftfahrer-mieten.com" style="color:#ffffff;text-decoration:none;">info@kraftfahrer-mieten.com</a><br/>
            🌐 <a href="https://www.kraftfahrer-mieten.com" style="color:#ffffff;text-decoration:none;">www.kraftfahrer-mieten.com</a>
          </p>
          <p class="footer-text" style="margin:14px 0 0 0;padding-top:12px;border-top:1px solid #1e3a5f;font-size:12px;line-height:1.55;color:#94a3b8;">
            Sie erhalten diese E-Mail, weil Sie sich als Fahrer bei Fahrerexpress registriert haben.
            Wenn Sie künftig keine Fahrerinformationen oder Auftragsbenachrichtigungen mehr erhalten möchten,
            können Sie sich
            <a href="${unsubscribeUrl}" style="color:#ffffff;text-decoration:underline;">hier abmelden</a>.
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
    try {
      if (req.headers.get("content-type")?.includes("application/json")) {
        const body = await req.json().catch(() => ({}));
        if (body && typeof body.name === "string") name = body.name;
      }
    } catch (_) { /* ignore */ }

    // Tokenbasierten Abmeldelink erzeugen (zeigt auf driver-unsubscribe Edge Function).
    // Versucht Fahrer-Profil für die Testadresse zu finden; sonst Dummy-ID (Link zeigt dann
    // korrekt auf die Abmeldeseite, würde aber als "Ungültiger Abmeldelink" beantwortet).
    let driverId = "00000000-0000-0000-0000-000000000000";
    let driverIdSource: "profile" | "dummy" = "dummy";
    try {
      const { data: driver } = await supabase
        .from("fahrer_profile")
        .select("id, vorname")
        .ilike("email", TEST_RECIPIENT)
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
        to: [TEST_RECIPIENT],
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
        recipient: TEST_RECIPIENT,
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