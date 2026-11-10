// Kurze Zuteilungsmitteilung an den Auftraggeber: Fahrer, Kontakt, Einsatz, Kundenpreis (Tarif), Status, Link.
// Enthält nie Fahrerhonorar oder interne Kalkulation.
import { wrapDriverEmailHtml } from "../_shared/email-templates/driver-html-shell.ts";
import { tarifTextByKey } from "../_shared/email-templates/tarif-text-helper.ts";

const BEDINGUNGEN_URL = "https://www.kraftfahrer-mieten.com/vermittlungsbedingungen";
const escHtml = (v: unknown) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as Record<string, string>)[c]);

export function buildCustomerAssignmentNotice({ job, driverName, driverPhone, driverEmail, zeitraum, einsatzort }: {
  job: any; driverName: string; driverPhone: string; driverEmail?: string | null; zeitraum: string; einsatzort: string;
}) {
      const tarifText = job?.tarif_needs_review ? undefined : tarifTextByKey(job?.tarif_type);
      // Fernverkehr: vergünstigter Wochenpreis wie in der Eingangsbestätigung mit nennen (Werte unverändert aus den Tariftexten).
      const woche = job?.tarif_type === "fernfahrer" ? tarifText?.details.find((d: string) => d.startsWith("Wochenpreis:")) : undefined;
      const preis = tarifText ? `${tarifText.priceLine}${woche ? `; ${woche.replace(/^Wochenpreis:\s*/, "vergünstigt ")}` : ""} (gemäß Ihrer Anfrage und Preisliste)` : "gemäß Ihrer Anfrage und Preisliste";
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

      const subject = "Fahrerinformation zu Ihrem Auftrag";
      const p = 'style="margin:0 0 14px 0;font-size:15px;line-height:1.6;" class="body-text"';
      const inner = `
        <p ${p}>Sehr geehrte Damen und Herren,</p>
        <p ${p}>für Ihren Einsatz ist folgender selbstständiger Fahrer zugeteilt:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background:#f8fafc;border-left:4px solid #bb2c29;border-radius:4px;margin:0 0 18px 0;">
          <tr><td style="padding:14px 16px;font-size:15px;line-height:1.6;color:#0d2340;" class="body-text">
            ${rows.map(([k, v]) => `<strong>${escHtml(k)}:</strong> ${escHtml(v)}`).join("<br/>")}
          </td></tr>
        </table>
        <p ${p}>Bitte prüfen Sie die Angaben und teilen Sie uns Abweichungen umgehend mit. Maßgeblich sind die vereinbarten Auftragsdaten und unsere Vermittlungsbedingungen.</p>
        <p ${p}>Es gelten unsere <a href="${BEDINGUNGEN_URL}" style="color:#0d2340;">Vermittlungsbedingungen</a>.</p>
        <p style="margin:0;font-size:15px;line-height:1.6;" class="body-text">Mit freundlichen Grüßen<br/>Fahrerexpress-Agentur – Günter Killer</p>
      `;
      const html = wrapDriverEmailHtml(inner, {
        subject,
        previewText: "Fahrerinformation zu Ihrem Auftrag",
        showUnsubscribe: false,
      });

      const text = `Sehr geehrte Damen und Herren,

  für Ihren Einsatz ist folgender selbstständiger Fahrer zugeteilt:

  ${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}

  Bitte prüfen Sie die Angaben und teilen Sie uns Abweichungen umgehend mit. Maßgeblich sind die vereinbarten Auftragsdaten und unsere Vermittlungsbedingungen.

  Es gelten unsere Vermittlungsbedingungen: ${BEDINGUNGEN_URL}

  Mit freundlichen Grüßen
  Fahrerexpress-Agentur – Günter Killer`;

  return { subject, html, text: text.replace(/^ +/gm, "") };
}
