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
  subject: 'Wichtige Information für unsere Fahrer – aktuelle Regelungen & kurze Rückmeldung erbeten',
  paragraphs: [
    'vielen Dank, dass Sie Teil unseres Fahrer-Netzwerks bei Fahrerexpress sind. Mit dieser E-Mail informieren wir Sie über die aktuell gültigen Regelungen zur Zusammenarbeit und bitten gleichzeitig um eine kurze Rückmeldung zur Aktualisierung unserer Fahrerdatei.',
    '<strong>Aktuelle Regelungen zur Zusammenarbeit</strong>',
    'Sie sind selbstständiger Fahrer / selbstständiger Unternehmer. Es besteht kein Arbeitsverhältnis und keine Arbeitnehmerüberlassung.',
    'Vermittlungsanteil: Bei Standardaufträgen beträgt der Vermittlungsanteil in der Regel 20 % der vereinbarten Netto-Vergütung für die Fahrerdienstleistung. In Sonderfällen kann der Vermittlungsanteil bis zu 25 % betragen. Maßgeblich ist immer das konkrete Auftragsangebot vor Einsatzbeginn.',
    'Der Vermittlungsanteil bezieht sich ausschließlich auf die reine Fahrerdienstleistung. Auslagen wie An- und Abfahrt, Fahrtkosten, Diesel, Maut, Parkgebühren, Bahn- und Hotelkosten sowie sonstige vorab freigegebene Auslagen werden nicht vom Vermittlungsanteil gekürzt.',
    'Ihre Rechnung stellen Sie an Fahrerexpress – bereits nach Abzug des Vermittlungsanteils.',
    'Keine Direktabrechnung mit Auftraggebern. Keine Preisabsprachen mit Auftraggebern.',
    'Die Rückmeldung „Ich kann übernehmen“ ist ausschließlich eine Verfügbarkeitsmeldung. Die finale, verbindliche Einsatzbestätigung erfolgt separat durch Fahrerexpress.',
    'Zahlung: Die Zahlung der vereinbarten Vergütung erfolgt nach vollständiger und ordnungsgemäßer Durchführung des Einsatzes auf Grundlage Ihrer Rechnung an Fahrerexpress. Soweit im konkreten Auftragsangebot nichts anderes vereinbart ist, erfolgt die Zahlung nach Zahlungseingang des Auftraggebers bei Fahrerexpress.',
    'Sie entscheiden bei jedem Angebot frei, ob Sie es annehmen oder ablehnen.',
    '<strong>Aktualisierung unserer Fahrerdatei</strong>',
    'Einige Fahrer haben bisher noch keinen Auftrag über Fahrerexpress übernommen. Damit wir unsere Fahrerdatei aktuell halten können, bitten wir Sie um eine kurze Rückmeldung, falls Sie weiterhin grundsätzlich an Einsätzen interessiert sind, bisher aber noch keinen Auftrag angenommen haben.',
    'Teilen Sie uns gerne kurz mit, woran es bisher gelegen hat, zum Beispiel:<br><br>* Einsatzort hat nicht gepasst<br>* Termin hat nicht gepasst<br>* Vergütung hat nicht gepasst<br>* Fahrzeugart / Tätigkeit hat nicht gepasst<br>* derzeit keine Verfügbarkeit<br>* grundsätzlich kein Interesse mehr',
    '<strong>Jetzt Rückmeldung geben</strong>',
    'Oder einfach auf den Abmeldelink am Ende dieser E-Mail klicken.',
    '<strong>Was ist zu tun?</strong>',
    'Wenn Sie weiterhin grundsätzlich an Auftragsangeboten interessiert sind, freuen wir uns über eine kurze Rückmeldung – besonders dann, wenn Sie bisher noch keinen Auftrag über Fahrerexpress übernommen haben.',
    'Wenn Sie weiterhin Angebote erhalten möchten und sich für Sie nichts geändert hat, müssen Sie nichts weiter tun.',
    'Abmeldung: Sie können sich jederzeit über den Abmeldelink am Ende dieser E-Mail oder formlos per E-Mail an <a href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a> vom Erhalt weiterer Auftragsangebote abmelden. Die Angabe eines Abmeldegrundes ist freiwillig.',
    'Vielen Dank für Ihre Unterstützung und gute Fahrt!',
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