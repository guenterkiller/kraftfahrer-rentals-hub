// ============================================================================
// FESTE, FREIGEGEBENE FAHRER-RUNDMAIL-VORLAGEN
// ----------------------------------------------------------------------------
// WICHTIG: Inhalte dieser Datei sind die einzige Quelle für freigegebene
// Fahrerinformationen-Rundmails. Beim Versand mit templateId !== 'free' darf
// der Body NIEMALS aus dem Admin-Textfeld kommen.
// Änderungen an diesen Inhalten nur nach ausdrücklicher Freigabe.
// ============================================================================

export type DriverNewsletterTemplateId = 'free' | 'fahrerinformationen_v1';

export interface DriverNewsletterTemplate {
  id: DriverNewsletterTemplateId;
  label: string;
  subject: string;
  // Inhalts-Paragraphen (HTML-Snippets ohne Anrede/Gruß – diese werden im
  // Versand automatisch ergänzt). Reihenfolge = Reihenfolge im Versand.
  paragraphs: string[];
}

const FAHRERINFORMATIONEN_V1: DriverNewsletterTemplate = {
  id: 'fahrerinformationen_v1',
  label: 'Freigegebene Fahrerinformationen (fest)',
  subject: 'Aktuelle Fahrerinformationen von Fahrerexpress',
  paragraphs: [
    'wir möchten Ihnen die aktuell gültigen Informationen zur Zusammenarbeit mit Fahrerexpress zusammenfassen. Damit sind die Abläufe für alle Beteiligten klar geregelt.',
    '<strong>Abschnitt 1 – Zusammenarbeit:</strong><br>Sie sind selbstständiger Fahrer / selbstständiger Unternehmer. Es besteht kein Arbeitsverhältnis und keine Arbeitnehmerüberlassung. Sie entscheiden bei jedem Auftragsangebot frei, ob Sie es annehmen oder ablehnen.',
    '<strong>Abschnitt 2 – Vermittlungsanteil:</strong><br>Bei Standardaufträgen beträgt der Vermittlungsanteil in der Regel 20 % der vereinbarten Netto-Vergütung für die Fahrerdienstleistung. In Sonderfällen kann der Vermittlungsanteil bis zu 25 % betragen. Maßgeblich ist immer das konkrete Auftragsangebot vor Einsatzbeginn.',
    '<strong>Abschnitt 3 – Auslagen:</strong><br>Der Vermittlungsanteil bezieht sich ausschließlich auf die reine Fahrerdienstleistung. An- und Abfahrt, Fahrtkosten, Diesel, Maut, Parkgebühren, Bahn- und Hotelkosten sowie sonstige vorab freigegebene Auslagen werden nicht vom Vermittlungsanteil gekürzt und separat behandelt.',
    '<strong>Abschnitt 4 – Rechnungsstellung:</strong><br>Ihre Rechnung stellen Sie an Fahrerexpress – bereits nach Abzug des Vermittlungsanteils. Eine Direktabrechnung mit Auftraggebern ist nicht zulässig.',
    '<strong>Abschnitt 5 – Preisabsprachen:</strong><br>Preisabsprachen mit Auftraggebern sind nicht zulässig. Die Konditionen werden ausschließlich über Fahrerexpress vereinbart.',
    '<strong>Abschnitt 6 – Auftragsangebot und Einsatzbestätigung:</strong><br>Die Rückmeldung „Ich kann übernehmen“ ist ausschließlich eine Verfügbarkeitsmeldung. Die finale, verbindliche Einsatzbestätigung erfolgt separat durch Fahrerexpress.',
    '<strong>Abschnitt 7 – Zahlung:</strong><br>Die Zahlung der vereinbarten Vergütung erfolgt nach vollständiger und ordnungsgemäßer Durchführung des Einsatzes auf Grundlage Ihrer Rechnung an Fahrerexpress. Soweit im konkreten Auftragsangebot nichts anderes vereinbart ist, erfolgt die Zahlung nach Zahlungseingang des Auftraggebers bei Fahrerexpress.',
    '<strong>Abschnitt 8 – Aktualisierung unserer Fahrerdatei:</strong><br>Einige Fahrer haben bisher noch keinen Auftrag über Fahrerexpress übernommen. Damit wir unsere Fahrerdatei aktuell halten können, freuen wir uns über eine kurze Rückmeldung, falls Sie weiterhin grundsätzlich an Einsätzen interessiert sind, bisher aber noch keinen Auftrag angenommen haben.<br><br>Teilen Sie uns gerne kurz mit, woran es bisher gelegen hat, zum Beispiel:<br><br>* Einsatzort hat nicht gepasst<br>* Termin hat nicht gepasst<br>* Vergütung hat nicht gepasst<br>* Fahrzeugart / Tätigkeit hat nicht gepasst<br>* derzeit keine Verfügbarkeit<br>* grundsätzlich kein Interesse mehr',
    '<strong>Abschnitt 9 – Abmeldung:</strong><br>Sie können sich jederzeit über den Abmeldelink am Ende dieser E-Mail oder formlos per E-Mail an <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a> vom Erhalt weiterer Auftragsangebote abmelden. Die Angabe eines Abmeldegrundes ist freiwillig.',
    'Bei Rückfragen erreichen Sie uns unter <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a>.',
  ],
};

export const DRIVER_NEWSLETTER_TEMPLATES: Record<Exclude<DriverNewsletterTemplateId, 'free'>, DriverNewsletterTemplate> = {
  fahrerinformationen_v1: FAHRERINFORMATIONEN_V1,
};

/**
 * Baut das innere HTML einer Fahrer-Rundmail.
 * Bei templateId !== 'free' werden Betreff und Absätze ZWINGEND aus der festen
 * Vorlage genommen – der `freeMessage`-Parameter wird in diesem Fall ignoriert.
 */
export function buildDriverNewsletterInnerHtml(params: {
  templateId: DriverNewsletterTemplateId;
  vorname: string;
  nachname: string;
  freeMessage?: string;
}): { innerHtml: string; subject: string | null } {
  const { templateId, vorname, nachname, freeMessage } = params;
  const greeting = `<p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;color:#0d2340;font-weight:600;">Hallo ${vorname} ${nachname},</p>`;
  const closing = `<p style="margin:24px 0 0 0;font-size:15px;line-height:1.6;color:#0d2340;font-weight:600;">Mit freundlichen Grüßen<br/>Ihr Fahrerexpress-Team</p>`;

  if (templateId === 'free') {
    const body = (freeMessage ?? '').split('\n').map((line) => line.trim()
      ? `<p style="margin:0 0 12px 0;font-size:15px;line-height:1.65;color:#374151;">${line}</p>`
      : '<br />').join('');
    return { innerHtml: `${greeting}${body}${closing}`, subject: null };
  }

  const tpl = DRIVER_NEWSLETTER_TEMPLATES[templateId];
  if (!tpl) throw new Error(`Unknown driver newsletter templateId: ${templateId}`);
  const body = tpl.paragraphs
    .map((p) => `<p style="margin:0 0 12px 0;font-size:15px;line-height:1.65;color:#374151;">${p}</p>`)
    .join('');
  return { innerHtml: `${greeting}${body}${closing}`, subject: tpl.subject };
}
