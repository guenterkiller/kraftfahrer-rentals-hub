// Zentrale HTML-Shell für Fahrerexpress-Fahrer-Mails (Nicht-React-Email Versender).
// Stellt den freigegebenen Look bereit: Navy-Header #0d2340, roter Akzentbalken
// #bb2c29, weiße Karten, Navy-Footer mit weißen Links, mobile-first, Outlook-fest.
// WICHTIG: Diese Datei kapselt NUR das visuelle Layout — keinerlei Inhalte,
// Preise, Bedingungen, Empfänger- oder Versandlogik werden hier verändert.

export interface DriverShellOptions {
  subject: string;
  previewText?: string;
  unsubscribeUrl?: string;       // Tokenbasiert (HMAC) — kein mailto.
  unsubscribeNotice?: string;    // Optionaler Hinweistext über dem Abmeldelink.
  showUnsubscribe?: boolean;     // Default true. Auf false setzen, wenn kein
                                 // Newsletter/Rundmail-Kontext (z. B. Einsatzbestätigung).
}

const BRAND = {
  navy: "#0d2340",
  red: "#bb2c29",
  pageGray: "#f3f4f6",
  white: "#ffffff",
  text: "#374151",
  footerMuted: "#cbd5e1",
  footerLine: "#1e3a5f",
  footerSubtle: "#94a3b8",
};

const FONT_STACK =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

const escapeAttr = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Umhüllt fertigen Inhalts-HTML mit dem freigegebenen Fahrerexpress-Layout.
 * Der übergebene `innerHtml` wird unverändert in den weißen Inhaltsbereich gerendert.
 */
export function wrapDriverEmailHtml(innerHtml: string, opts: DriverShellOptions): string {
  const {
    subject,
    previewText = "",
    unsubscribeUrl,
    unsubscribeNotice =
      "Sie erhalten diese E-Mail, weil Sie sich als Fahrer bei Fahrerexpress registriert haben. " +
      "Wenn Sie künftig keine Fahrerinformationen oder Auftragsbenachrichtigungen mehr erhalten möchten, können Sie sich",
    showUnsubscribe = true,
  } = opts;

  const unsubBlock = (showUnsubscribe && unsubscribeUrl)
    ? `
          <p class="footer-text" style="margin:14px 0 0 0;padding-top:12px;border-top:1px solid ${BRAND.footerLine};font-size:12px;line-height:1.55;color:${BRAND.footerSubtle};">
            ${unsubscribeNotice}
            <a class="footer-link" href="${escapeAttr(unsubscribeUrl)}" style="color:${BRAND.white} !important;text-decoration:underline;">hier abmelden</a>.
          </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeAttr(subject)}</title>
<style>
  body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  a[x-apple-data-detectors], .footer-link { color: #ffffff !important; text-decoration: none !important; }
  @media only screen and (max-width: 600px) {
    .fx-container { width: 100% !important; }
    .fx-px { padding-left: 20px !important; padding-right: 20px !important; }
    .header-title { font-size: 22px !important; line-height: 1.25 !important; }
    .header-sub { font-size: 14px !important; }
    .body-text { font-size: 16px !important; line-height: 1.6 !important; }
    .footer-text { font-size: 13px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.pageGray};font-family:${FONT_STACK};color:${BRAND.text};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeAttr(previewText)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.pageGray}" style="background-color:${BRAND.pageGray};border-collapse:collapse;">
    <tr><td align="center" style="padding:20px 10px;">
      <table role="presentation" class="fx-container" width="640" cellpadding="0" cellspacing="0" border="0" bgcolor="${BRAND.white}" style="width:640px;max-width:640px;background-color:${BRAND.white};border-collapse:collapse;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <tr><td bgcolor="${BRAND.navy}" style="background-color:${BRAND.navy};padding:28px 32px;" class="fx-px">
          <div class="header-title" style="font-size:24px;font-weight:700;line-height:1.2;color:${BRAND.white};font-family:${FONT_STACK};">
            Fahrerexpress-Agentur – Günter Killer
          </div>
          <div class="header-sub" style="font-size:14px;color:${BRAND.footerMuted};margin-top:6px;font-family:${FONT_STACK};">
            Vermittlung selbstständiger Fahrer
          </div>
        </td></tr>
        <tr><td bgcolor="${BRAND.red}" style="background-color:${BRAND.red};height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>

        <tr><td class="fx-px" style="padding:28px 32px;font-family:${FONT_STACK};color:${BRAND.text};">
          ${innerHtml}
        </td></tr>

        <tr><td bgcolor="${BRAND.navy}" style="background-color:${BRAND.navy};padding:24px 32px;" class="fx-px">
          <p class="footer-text" style="margin:0 0 8px 0;font-size:14px;line-height:1.55;color:${BRAND.white};font-weight:700;font-family:${FONT_STACK};">
            Fahrerexpress-Agentur
          </p>
          <p class="footer-text" style="margin:0 0 10px 0;font-size:13px;line-height:1.6;color:${BRAND.footerMuted};font-family:${FONT_STACK};">
            Inhaber: Günter Killer<br/>
            Walther-von-Cronberg-Platz 12<br/>
            60594 Frankfurt am Main
          </p>
          <p class="footer-text" style="margin:0;font-size:13px;line-height:1.6;color:${BRAND.footerMuted};font-family:${FONT_STACK};">
            Telefon: <a class="footer-link" href="tel:+4915771442285" style="color:${BRAND.white} !important;text-decoration:none;">01577 1442285</a><br/>
            E-Mail: <a class="footer-link" href="mailto:info@kraftfahrer-mieten.com" style="color:${BRAND.white} !important;text-decoration:none;">info@kraftfahrer-mieten.com</a><br/>
            Web: <a class="footer-link" href="https://www.kraftfahrer-mieten.com" style="color:${BRAND.white} !important;text-decoration:none;">www.kraftfahrer-mieten.com</a>
          </p>${unsubBlock}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}