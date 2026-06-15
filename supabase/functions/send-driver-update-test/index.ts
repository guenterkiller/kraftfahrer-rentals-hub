import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Hardcoded recipient — test endpoint only. Cannot be abused to send anywhere else.
const TEST_RECIPIENT = "info@kraftfahrer-mieten.com";

const SUBJECT =
  "Wichtige Information für unsere Fahrer – aktuelle Regelungen & kurze Rückmeldung erbeten";

const BODY_HTML = `
<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;color:#1f2937;line-height:1.55;">
  <p>Hallo,</p>

  <p>vielen Dank, dass Sie Teil unseres Fahrer-Netzwerks bei Fahrerexpress sind. Mit dieser E-Mail informieren wir Sie über die aktuell gültigen Regelungen zur Zusammenarbeit und bitten gleichzeitig um eine kurze Rückmeldung zur Aktualisierung unserer Fahrerdatei.</p>

  <h3 style="color:#059669;margin-top:24px;">Aktuelle Regelungen zur Zusammenarbeit</h3>
  <ul>
    <li>Sie sind selbstständiger Subunternehmer. Es besteht kein Arbeitsverhältnis und keine Arbeitnehmerüberlassung.</li>
    <li><strong>Vermittlungsanteil:</strong> 20 % Standard, in Sonderfällen bis zu 25 %. Maßgeblich ist immer das konkrete Auftragsangebot vor Einsatzbeginn.</li>
    <li>Der Vermittlungsanteil bezieht sich ausschließlich auf die reine Fahrer-Dienstleistung. <strong>Auslagen</strong> wie Anfahrt, Spesen, Übernachtung oder Maut sind <strong>nicht provisionspflichtig</strong>.</li>
    <li>Ihre <strong>Rechnung</strong> stellen Sie an Fahrerexpress – bereits <strong>nach Abzug</strong> des Vermittlungsanteils.</li>
    <li>Keine Direktabrechnung mit Auftraggebern. Keine Preisabsprachen mit Auftraggebern.</li>
    <li>Die Rückmeldung <strong>„Ich kann übernehmen"</strong> ist ausschließlich eine Verfügbarkeitsmeldung. Die finale, verbindliche Einsatzbestätigung erfolgt separat durch Fahrerexpress.</li>
    <li><strong>Zahlung:</strong> Die Zahlung der vereinbarten Vergütung erfolgt nach vollständiger und ordnungsgemäßer Durchführung des Einsatzes auf Grundlage Ihrer Rechnung an Fahrerexpress. Soweit im konkreten Auftragsangebot nichts anderes vereinbart ist, erfolgt die Zahlung nach Zahlungseingang des Auftraggebers bei Fahrerexpress.</li>
    <li>Sie entscheiden bei jedem Angebot frei, ob Sie es annehmen oder ablehnen.</li>
  </ul>

  <h3 style="color:#059669;margin-top:24px;">Hinweis zur Aktualisierung unserer Fahrerdatei</h3>
  <p>Einige Fahrer haben bisher noch keinen Auftrag über Fahrerexpress übernommen. Damit wir unsere Fahrerdatei aktuell halten können, bitten wir Sie um eine kurze Rückmeldung, falls Sie weiterhin grundsätzlich an Einsätzen interessiert sind, bisher aber noch keinen Auftrag angenommen haben.</p>
  <p>Teilen Sie uns gerne kurz mit, woran es bisher gelegen hat, zum Beispiel:</p>
  <ul>
    <li>Einsatzort hat nicht gepasst</li>
    <li>Termin hat nicht gepasst</li>
    <li>Vergütung hat nicht gepasst</li>
    <li>Fahrzeugart / Tätigkeit hat nicht gepasst</li>
    <li>derzeit keine Verfügbarkeit</li>
    <li>grundsätzlich kein Interesse mehr</li>
  </ul>
  <p>Eine kurze E-Mail an <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a> genügt.</p>

  <h3 style="color:#059669;margin-top:24px;">Was ist zu tun?</h3>
  <ul>
    <li>Wenn Sie <strong>weiterhin</strong> Auftragsangebote erhalten möchten, müssen Sie <strong>nichts</strong> weiter tun.</li>
    <li>Wenn Sie künftig <strong>keine</strong> Auftragsangebote mehr erhalten möchten, nutzen Sie bitte den Abmeldelink am Ende dieser E-Mail („hier abmelden").</li>
  </ul>

  <p style="margin-top:24px;">Vielen Dank für Ihre Unterstützung und gute Fahrt!</p>

  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
  <p style="font-size:12px;color:#6b7280;">
    Fahrerexpress-Agentur | Tel: 01577 1442285 | <a href="https://www.kraftfahrer-mieten.com">www.kraftfahrer-mieten.com</a><br/>
    Sie erhalten diese E-Mail, weil Sie sich als Fahrer bei Fahrerexpress registriert haben.
    Wenn Sie künftig keine Fahrerinformationen oder Auftragsbenachrichtigungen mehr erhalten möchten, können Sie sich
    <a href="mailto:info@kraftfahrer-mieten.com?subject=Abmeldung%20Fahrer-Newsletter">hier abmelden</a>.
  </p>
  <p style="font-size:11px;color:#9ca3af;"><strong>TESTMAIL</strong> – Vorschau für info@kraftfahrer-mieten.com. Versand an Fahrer erfolgt erst nach ausdrücklicher Freigabe.</p>
</div>
`;

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
        html: BODY_HTML,
      }),
    });

    const text = await res.text();
    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status, body: text, recipient: TEST_RECIPIENT, subject: SUBJECT }),
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