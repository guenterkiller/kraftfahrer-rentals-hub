// Verbindliche Einsatzbestätigung an den Auftraggeber nach Zuweisung durch Fahrerexpress.
// Enthält Kundentarif und Fahrerkontakt, niemals interne Annahmen, Fahrerhonorar oder Provision.
import { wrapDriverEmailHtml } from "../_shared/email-templates/driver-html-shell.ts";
import { tarifTextByKey } from "../_shared/email-templates/tarif-text-helper.ts";
import {
  EINSATZBESTAETIGUNG_TITEL,
  EINSATZBESTAETIGUNG_STATUS_TEXT,
  EINSATZBESTAETIGUNG_TEXT,
  UNTERKUNFT_OPTIONEN,
  OBERGRENZE_LABEL,
  formatEuro,
  type UnterkunftOption,
} from "../_shared/kosten-uebersicht.ts";

const BEDINGUNGEN_URL = "https://www.kraftfahrer-mieten.com/vermittlungsbedingungen";
const FAHRTKOSTEN_TEXT = "Die An- und Abfahrtskosten des Fahrers werden zusätzlich zum vereinbarten Einsatzpreis separat berechnet.";
const UNTERKUNFT_HINWEIS = "Reist der Fahrer von weiter entfernt an, kann eine geeignete Unterkunft wirtschaftlicher sein als die täglich anfallenden An- und Abfahrtskosten. Die Unterkunftsregelung richtet sich nach der vom Auftraggeber bei der Buchung gewählten Option.";
const escHtml = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as Record<string, string>)[c]);

export function buildCustomerAssignmentNotice({ job, driverName, driverPhone, driverEmail, zeitraum, einsatzort }: {
  job: any; driverName: string; driverPhone: string; driverEmail?: string | null; zeitraum: string; einsatzort: string;
}) {
  const tarifText = job?.tarif_needs_review ? undefined : tarifTextByKey(job?.tarif_type);
  // Fernverkehr: vergünstigter Wochenpreis wie in der Eingangsbestätigung (Werte unverändert).
  const woche = job?.tarif_type === "fernfahrer" ? tarifText?.details.find((d: string) => d.startsWith("Wochenpreis:")) : undefined;
  const preis = tarifText
    ? `${tarifText.priceLine}${woche ? `; ${woche.replace(/^Wochenpreis:\s*/, "vergünstigt ")}` : ""} (vereinbarter Kundentarif gemäß Preisliste)`
    : "gemäß den mit Ihnen vereinbarten Konditionen";
  const ansprech = [job?.company, job?.customer_name].filter(Boolean).join(" – ");
  const rows: [string, string][] = [
    ...(ansprech ? [["Auftraggeber", ansprech] as [string, string]] : []),
    ["Einsatzort", einsatzort && einsatzort.trim() && einsatzort.trim() !== "—" ? einsatzort : "Nicht erfasst – wird vor Einsatz mit Ihnen abgestimmt"],
    ["Zeitraum", zeitraum],
    ["Fahrer", driverName],
    ["Telefon Fahrer", driverPhone],
    ...(driverEmail ? [["E-Mail Fahrer", driverEmail] as [string, string]] : []),
    ["Preis", preis],
  ];

  const gespeicherteOption = typeof job?.unterkunft_option === "string" && Object.prototype.hasOwnProperty.call(UNTERKUNFT_OPTIONEN, job.unterkunft_option)
    ? job.unterkunft_option as UnterkunftOption
    : null;
  const unterkunft = gespeicherteOption
    ? `${UNTERKUNFT_OPTIONEN[gespeicherteOption]}${gespeicherteOption === "fahrer_organisiert" && typeof job?.unterkunft_obergrenze === "number" && Number.isFinite(job.unterkunft_obergrenze) ? ` ${OBERGRENZE_LABEL}: ${formatEuro(job.unterkunft_obergrenze)}` : ""}`
    : "";

  const subject = `${EINSATZBESTAETIGUNG_TITEL} – ${einsatzort || "Ihr Einsatz"}`;
  const p = 'style="margin:0 0 14px 0;font-size:15px;line-height:1.6;" class="body-text"';
  const inner = `
    <p ${p}>Sehr geehrte Damen und Herren,</p>
    <div style="border-left:4px solid #bb2c29;background:#fff5f4;padding:14px 16px;margin:0 0 18px 0;color:#0d2340;" class="body-text">
      <strong style="font-size:18px;">${EINSATZBESTAETIGUNG_TITEL}</strong><br/>
      ${EINSATZBESTAETIGUNG_STATUS_TEXT}
    </div>
    <p ${p}>${EINSATZBESTAETIGUNG_TEXT}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background:#f8fafc;border-left:4px solid #bb2c29;border-radius:4px;margin:0 0 18px 0;">
      <tr><td style="padding:14px 16px;font-size:15px;line-height:1.6;color:#0d2340;" class="body-text">
        ${rows.map(([k, v]) => `<strong>${escHtml(k)}:</strong> ${escHtml(v)}`).join("<br/>")}
      </td></tr>
    </table>
    <p ${p}>${FAHRTKOSTEN_TEXT}</p>
    <p ${p}><strong>Hinweis zur Unterkunft:</strong> ${UNTERKUNFT_HINWEIS}</p>
    ${unterkunft ? `<p ${p}><strong>Bei der Buchung gewählte Unterkunftsoption:</strong> ${escHtml(unterkunft)}</p>` : ""}
    <p ${p}>Bei sachlichen Fehlern in dieser Bestätigung kontaktieren Sie uns bitte umgehend. Maßgeblich sind die hier bestätigten Einsatzdaten und Konditionen sowie unsere Vermittlungsbedingungen.</p>
    <p ${p}>Es gelten unsere <a href="${BEDINGUNGEN_URL}" style="color:#0d2340;">Vermittlungsbedingungen</a>.</p>
    <p style="margin:0;font-size:15px;line-height:1.6;" class="body-text">Mit freundlichen Grüßen<br/>Fahrerexpress-Agentur – Günter Killer</p>
  `;
  const html = wrapDriverEmailHtml(inner, {
    subject,
    previewText: EINSATZBESTAETIGUNG_STATUS_TEXT,
    showUnsubscribe: false,
  });

  const text = `Sehr geehrte Damen und Herren,

${EINSATZBESTAETIGUNG_TITEL}
${EINSATZBESTAETIGUNG_STATUS_TEXT}

${EINSATZBESTAETIGUNG_TEXT}

${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}

${FAHRTKOSTEN_TEXT}

Hinweis zur Unterkunft: ${UNTERKUNFT_HINWEIS}
${unterkunft ? `\nBei der Buchung gewählte Unterkunftsoption: ${unterkunft}\n` : ""}
Bei sachlichen Fehlern in dieser Bestätigung kontaktieren Sie uns bitte umgehend. Maßgeblich sind die hier bestätigten Einsatzdaten und Konditionen sowie unsere Vermittlungsbedingungen.

Es gelten unsere Vermittlungsbedingungen: ${BEDINGUNGEN_URL}

Mit freundlichen Grüßen
Fahrerexpress-Agentur – Günter Killer`;

  return { subject, html, text };
}
