// ============================================================================
// FESTE, FREIGEGEBENE FAHRER-RUNDMAIL-VORLAGEN
// ----------------------------------------------------------------------------
// Wiederhergestellt aus Commit cc292a5 (vor Revert 1d6fb34).
// Inhalte dieser Datei sind die einzige Quelle für freigegebene
// Fahrerinformationen-Rundmails. Beim Versand mit templateId !== 'free' darf
// der Body NIEMALS aus dem Admin-Textfeld kommen.
// Änderungen an diesen Inhalten nur nach ausdrücklicher Freigabe.
// ============================================================================

export type DriverNewsletterTemplateId = 'free' | 'fahrerinformationen_v1';

// Strukturierte Abschnitte einer freigegebenen Fahrer-Rundmail.
// Jede Sektion wird als eigene weiße Karte mit Navy-Überschrift und rotem
// Akzentbalken links gerendert. Inhalte können Absätze, Aufzählungen und
// optional ein roter Call-to-Action-Button sein.
export type DriverNewsletterBlock =
  | { type: 'paragraph'; html: string }
  | { type: 'list'; items: string[] }
  | { type: 'cta'; label: string; /** 'mailto' = öffnet E-Mail-Programm an info@kraftfahrer-mieten.com */ target: 'mailto' }
  | { type: 'note'; html: string };

export interface DriverNewsletterSection {
  heading: string;
  blocks: DriverNewsletterBlock[];
}

export interface DriverNewsletterTemplate {
  id: DriverNewsletterTemplateId;
  label: string;
  subject: string;
  /** Einleitender Absatz vor den Karten (z. B. nach der Anrede). */
  intro: string;
  /** Inhaltskarten in Reihenfolge. */
  sections: DriverNewsletterSection[];
  /** Abschlusszeile nach den Karten (vor dem Gruß). */
  closing: string;
}

const FAHRERINFORMATIONEN_V1: DriverNewsletterTemplate = {
  id: 'fahrerinformationen_v1',
  label: 'Freigegebene Fahrerinformationen (fest)',
  subject: 'Wichtige Information für unsere Fahrer – aktuelle Regelungen & kurze Rückmeldung erbeten',
  intro:
    'vielen Dank, dass Sie Teil unseres Fahrer-Netzwerks bei Fahrerexpress sind. Mit dieser E-Mail informieren wir Sie über die aktuell gültigen Regelungen zur Zusammenarbeit und bitten gleichzeitig um eine kurze Rückmeldung zur Aktualisierung unserer Fahrerdatei.',
  sections: [
    {
      heading: 'Aktuelle Regelungen zur Zusammenarbeit',
      blocks: [
        {
          type: 'list',
          items: [
            'Sie sind <strong>selbstständiger Fahrer / selbstständiger Unternehmer</strong>. Es besteht kein Arbeitsverhältnis und keine Arbeitnehmerüberlassung.',
            '<strong>Vermittlungsanteil:</strong> Bei Standardaufträgen beträgt der Vermittlungsanteil in der Regel 20 % der vereinbarten Netto-Vergütung für die Fahrerdienstleistung. In Sonderfällen kann der Vermittlungsanteil bis zu 25 % betragen. Maßgeblich ist immer das konkrete Auftragsangebot vor Einsatzbeginn.',
            'Der Vermittlungsanteil bezieht sich ausschließlich auf die reine Fahrerdienstleistung. <strong>Auslagen</strong> wie An- und Abfahrt, Fahrtkosten, Diesel, Maut, Parkgebühren, Bahn- und Hotelkosten sowie sonstige vorab freigegebene Auslagen <strong>werden nicht vom Vermittlungsanteil gekürzt</strong>.',
            'Ihre <strong>Rechnung</strong> stellen Sie an Fahrerexpress – bereits <strong>nach Abzug</strong> des Vermittlungsanteils.',
            'Keine Direktabrechnung mit Auftraggebern. Keine Preisabsprachen mit Auftraggebern.',
            'Die Rückmeldung <strong>„Ich kann übernehmen"</strong> ist ausschließlich eine Verfügbarkeitsmeldung. Die finale, verbindliche Einsatzbestätigung erfolgt separat durch Fahrerexpress.',
            '<strong>Zahlung:</strong> Die Zahlung der vereinbarten Vergütung erfolgt nach vollständiger und ordnungsgemäßer Durchführung des Einsatzes auf Grundlage Ihrer Rechnung an Fahrerexpress. Soweit im konkreten Auftragsangebot nichts anderes vereinbart ist, erfolgt die Zahlung nach Zahlungseingang des Auftraggebers bei Fahrerexpress.',
            'Sie entscheiden bei jedem Angebot frei, ob Sie es annehmen oder ablehnen.',
          ],
        },
      ],
    },
    {
      heading: 'Aktualisierung unserer Fahrerdatei',
      blocks: [
        {
          type: 'paragraph',
          html:
            'Einige Fahrer haben bisher noch keinen Auftrag über Fahrerexpress übernommen. Damit wir unsere Fahrerdatei aktuell halten können, bitten wir Sie um eine kurze Rückmeldung, falls Sie weiterhin grundsätzlich an Einsätzen interessiert sind, bisher aber noch keinen Auftrag angenommen haben.',
        },
        { type: 'paragraph', html: 'Teilen Sie uns gerne kurz mit, woran es bisher gelegen hat, zum Beispiel:' },
        {
          type: 'list',
          items: [
            'Einsatzort hat nicht gepasst',
            'Termin hat nicht gepasst',
            'Vergütung hat nicht gepasst',
            'Fahrzeugart / Tätigkeit hat nicht gepasst',
            'derzeit keine Verfügbarkeit',
            'grundsätzlich kein Interesse mehr',
          ],
        },
        { type: 'cta', label: 'Jetzt Rückmeldung geben', target: 'mailto' },
        { type: 'note', html: 'Oder einfach auf den Abmeldelink am Ende dieser E-Mail klicken.' },
      ],
    },
    {
      heading: 'Was ist zu tun?',
      blocks: [
        {
          type: 'paragraph',
          html:
            'Wenn Sie weiterhin grundsätzlich an Auftragsangeboten interessiert sind, freuen wir uns über eine kurze Rückmeldung – besonders dann, wenn Sie bisher noch keinen Auftrag über Fahrerexpress übernommen haben.',
        },
        {
          type: 'paragraph',
          html: 'Wenn Sie weiterhin Angebote erhalten möchten und sich für Sie nichts geändert hat, müssen Sie nichts weiter tun.',
        },
        {
          type: 'paragraph',
          html:
            '<strong>Abmeldung:</strong> Sie können sich jederzeit über den Abmeldelink am Ende dieser E-Mail oder formlos per E-Mail an <a href="mailto:info@kraftfahrer-mieten.com" style="color:#bb2c29;text-decoration:underline;">info@kraftfahrer-mieten.com</a> vom Erhalt weiterer Auftragsangebote abmelden. Die Angabe eines Abmeldegrundes ist freiwillig.',
        },
      ],
    },
  ],
  closing: 'Vielen Dank für Ihre Unterstützung und gute Fahrt!',
};

export const DRIVER_NEWSLETTER_TEMPLATES: Record<Exclude<DriverNewsletterTemplateId, 'free'>, DriverNewsletterTemplate> = {
  fahrerinformationen_v1: FAHRERINFORMATIONEN_V1,
};

const NAVY = '#0d2340';
const RED = '#bb2c29';
const TEXT = '#374151';
const CARD_BORDER = '#e5e7eb';
const CARD_BG = '#f8fafc';

function renderBlock(block: DriverNewsletterBlock, ctaUrl?: string): string {
  switch (block.type) {
    case 'paragraph':
      return `<p style="margin:0 0 12px 0;font-size:15px;line-height:1.65;color:${TEXT};">${block.html}</p>`;
    case 'list': {
      const items = block.items
        .map(
          (li) =>
            `<li style="margin:0 0 8px 0;padding-left:4px;font-size:15px;line-height:1.65;color:${TEXT};">${li}</li>`
        )
        .join('');
      return `<ul style="margin:0 0 12px 0;padding:0 0 0 22px;color:${TEXT};">${items}</ul>`;
    }
    case 'cta': {
      // Fester mailto-Link – öffnet das E-Mail-Programm des Empfängers.
      // KEIN Supabase-Link, KEIN persönlicher Abmeldelink.
      const mailtoUrl = 'mailto:info@kraftfahrer-mieten.com?subject=R%C3%BCckmeldung%20Fahrerdatei';
      return `<div style="margin:18px 0 8px 0;"><a href="${mailtoUrl}" style="display:inline-block;background:${RED};color:#ffffff !important;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${block.label}</a></div>`;
    }
    case 'note':
      return `<p style="margin:4px 0 0 0;font-size:13px;line-height:1.55;color:#6b7280;">${block.html}</p>`;
  }
}

function renderSectionCard(section: DriverNewsletterSection, ctaUrl?: string): string {
  const heading = `<h2 style="margin:0 0 12px 0;font-size:18px;line-height:1.3;color:${NAVY};font-weight:700;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">${section.heading}</h2>`;
  const body = section.blocks.map((b) => renderBlock(b, ctaUrl)).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px 0;border-collapse:separate;">
    <tr>
      <td style="background:${CARD_BG};border:1px solid ${CARD_BORDER};border-left:4px solid ${RED};border-radius:6px;padding:18px 20px;">
        ${heading}${body}
      </td>
    </tr>
  </table>`;
}

/**
 * Baut das innere HTML einer Fahrer-Rundmail.
 * Bei templateId !== 'free' werden Betreff und Absätze ZWINGEND aus der festen
 * Vorlage genommen – der `freeMessage`-Parameter wird in diesem Fall ignoriert.
 * Abschnitte werden als weiße Karten mit Navy-Überschrift und rotem
 * Akzentbalken links gerendert. CTA-Blöcke vom Typ 'unsubscribe' verlinken
 * auf den persönlichen Abmelde-/Rückmeldelink (`ctaUrl`).
 */
export function buildDriverNewsletterInnerHtml(params: {
  templateId: DriverNewsletterTemplateId;
  vorname: string;
  nachname: string;
  freeMessage?: string;
  ctaUrl?: string;
}): { innerHtml: string; subject: string | null } {
  const { templateId, vorname, nachname, freeMessage, ctaUrl } = params;
  const greetingName = (vorname || '').trim() || nachname || '';
  const greeting = `<p style="margin:0 0 14px 0;font-size:17px;line-height:1.6;color:${NAVY};font-weight:700;">Hallo ${greetingName},</p>`;
  const signOff = `<p style="margin:24px 0 0 0;font-size:15px;line-height:1.6;color:${NAVY};font-weight:600;">Mit freundlichen Grüßen<br/>Ihr Fahrerexpress-Team</p>`;

  if (templateId === 'free') {
    // Freitext-Modus (Abwärtskompatibilität): unverändertes Verhalten.
    const body = (freeMessage ?? '').split('\n').map((line) => line.trim()
      ? `<p style="margin:0 0 12px 0;font-size:15px;line-height:1.65;color:${TEXT};">${line}</p>`
      : '<br />').join('');
    return { innerHtml: `${greeting}${body}${signOff}`, subject: null };
  }

  const tpl = DRIVER_NEWSLETTER_TEMPLATES[templateId];
  if (!tpl) throw new Error(`Unknown driver newsletter templateId: ${templateId}`);

  const intro = `<p style="margin:0 0 18px 0;font-size:15px;line-height:1.65;color:${TEXT};">${tpl.intro}</p>`;
  const cards = tpl.sections.map((s) => renderSectionCard(s, ctaUrl)).join('');
  const closingLine = `<p style="margin:18px 0 0 0;font-size:15px;line-height:1.6;color:${NAVY};font-weight:700;">${tpl.closing}</p>`;

  return { innerHtml: `${greeting}${intro}${cards}${closingLine}${signOff}`, subject: tpl.subject };
}