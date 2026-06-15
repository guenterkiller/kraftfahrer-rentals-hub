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
  subject: 'Wichtige Fahrerinformationen – Vermittlungsanteil & Abrechnung',
  paragraphs: [
    'wir möchten Ihnen wichtige Informationen zur Zusammenarbeit mit Fahrerexpress zusammenfassen, damit die Abläufe für alle Beteiligten klar geregelt sind.',
    '<strong>Vermittlungsanteil:</strong> Der Vermittlungsanteil beträgt 20 % im Standardfall, in Sonderfällen bis zu 25 %.',
    '<strong>Rechnungsstellung:</strong> Sie stellen Ihre Rechnung an die Fahrerexpress-Agentur – bereits abzüglich des Vermittlungsanteils. Eine Direktabrechnung mit den Auftraggebern ist ausdrücklich nicht zulässig.',
    '<strong>Preisabsprachen:</strong> Preisabsprachen mit Auftraggebern sind nicht gestattet. Die Konditionen werden ausschließlich über die Agentur vereinbart.',
    '<strong>Auslagen:</strong> Tatsächliche Auslagen (z. B. Maut, Übernachtung, Spesen) sind nicht provisionspflichtig und werden 1:1 weitergereicht.',
    '<strong>Fahrerdatei aktuell halten:</strong> Bitte halten Sie Ihre Stammdaten (Führerscheinklassen, Module, Erreichbarkeit, Verfügbarkeit) jederzeit aktuell, damit wir Sie passend disponieren können.',
    'Falls Sie bisher noch keinen Auftrag über uns hatten, freuen wir uns über eine kurze Rückmeldung, woran das aus Ihrer Sicht liegt – so können wir die Vermittlung besser auf Sie abstimmen.',
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
