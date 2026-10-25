import { Heading, Text, Section, Link } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles, getBoxProps, getTextProps } from './base-email.tsx';
import { TARIF_TEXTE, tarifTextByKey } from './tarif-text-helper.ts';
import { TRAVEL_COSTS } from '../overnight-costs.ts';
import { OvernightCostNotice, ZUSATZKOSTEN_BOX, ZUSATZKOSTEN_HEADING } from './overnight-cost-notice.tsx';
import {
  UNTERKUNFT_OPTIONEN,
  VORKALKULATION_TITEL,
  VORKALKULATION_HINWEIS,
  OFFENE_KOSTEN_HINWEIS,
  offenePositionen,
  formatEuro as formatEuroKosten,
  type UnterkunftOption,
  type KostenUebersicht,
  OBERGRENZE_LABEL,
  UNTERKUNFT_GRUNDSATZ,
} from '../kosten-uebersicht.ts';

const PREISE_URL = 'https://www.kraftfahrer-mieten.com/preise-und-ablauf';

const ROLLENBESCHREIBUNG =
  'Die Fahrerexpress-Agentur vermittelt und koordiniert Fahrerdienstleistungen mit selbstständigen Unternehmern mit eigenem Gewerbe. Vertragspartner des Auftraggebers ist die Fahrerexpress-Agentur; die Rechnungsstellung erfolgt nach Einsatzende durch Fahrerexpress. Fahrzeuge werden nicht gestellt.';

const ABRECHNUNGSTEXT =
  'Der angefragte Zeitraum dient der Einsatzplanung. Die Rechnungsstellung erfolgt nach Einsatzende auf Grundlage der tatsächlich geleisteten Einsatztage, angefangenen Mehrstunden, berechnungsfähigen Fahrtkilometer und zutreffenden Zuschläge. Verlängerungen und Änderungen werden entsprechend den veröffentlichten Preisen und Konditionen berücksichtigt.';

const MEHRSTUNDENREGEL =
  'Jede über die im gewählten Tarif enthaltene Einsatzzeit hinaus tatsächlich angefallene Einsatzzeit wird nach der veröffentlichten Preisliste je angefangene Stunde zusätzlich berechnet. Eine gesonderte Vereinbarung oder Bestätigung ist nicht erforderlich.';

interface CustomerBookingConfirmationProps {
  customerName: string;
  companyName?: string;
  driverType: string;
  requirements?: string[];
  timeframe: string;
  location: string;
  message: string;
  isFernfahrerTarif?: boolean;
  isUeberfuehrung?: boolean;
  weekendHolidayAffected?: boolean;
  weekendHolidayAcknowledged?: boolean;
  tarif?: {
    tarif: string;
    label: string;
    netto: number | null;
    einheit: string;
    mehrstunde: number | null;
    needsReview: boolean;
    reason: string;
  };
  /** Wird bewusst nicht mehr mit konkreten Datumsangaben ausgegeben. */
  surchargeDays?: Array<{ label: string; percent: number }>;
  /** Gewählte Unterkunftsregelung (nur bei relevanten Tarifen). */
  unterkunftOption?: UnterkunftOption | null;
  /** Vereinbarte Kostenobergrenze netto (nur bei Option fahrer_organisiert). */
  unterkunftObergrenze?: number | null;
  /** Serverseitig berechnete unverbindliche Vorkalkulation. */
  kostenUebersicht?: KostenUebersicht | null;
}

const listStyle = { margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' };

const formatEuro = (v: number) =>
  `${v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

/** Neutrale Anrede – es wird kein Geschlecht anhand des Vornamens erraten. */
const buildSalutation = (customerName?: string, companyName?: string) => {
  const name = (customerName || '').trim();
  const company = (companyName || '').trim();
  if (name) return `Guten Tag ${name},`;
  if (company) return `Guten Tag ${company},`;
  return 'Guten Tag,';
};

/** Wiederholende Sammelhinweise werden im Tarifblock nicht erneut ausgegeben. */
const withoutRedundantDetails = (details: string[]) =>
  details.filter((d) => {
    const t = d.trim().toLowerCase();
    // "Zuzüglich …" und der Mehrstundensatz stehen bereits im Tarifblock (eigene Zeilen)
    return !t.startsWith('zuzüglich') && !t.startsWith('mehrarbeit');
  });

const normalizeText = (v: string) =>
  v.toLowerCase().replace(/[\s,;/|-]+/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * "Spezialanforderungen" nur anzeigen, wenn eigenständige Angaben vorliegen.
 * Einträge, die bereits in der Tätigkeitsbeschreibung enthalten sind, werden verworfen.
 */
const eigenstaendigeAnforderungen = (requirements: string[], message: string) => {
  const msg = normalizeText(message || '');
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of requirements || []) {
    const value = (raw || '').trim();
    if (!value) continue;
    const norm = normalizeText(value);
    if (!norm || seen.has(norm)) continue;
    if (msg && msg.includes(norm)) continue;
    seen.add(norm);
    result.push(value);
  }
  return result;
};

export const CustomerBookingConfirmation = ({
  customerName,
  companyName,
  driverType,
  requirements = [],
  timeframe,
  location,
  message,
  isFernfahrerTarif = false,
  weekendHolidayAffected = false,
  weekendHolidayAcknowledged = false,
  tarif,
  isUeberfuehrung = false,
  unterkunftOption = null,
  unterkunftObergrenze = null,
  kostenUebersicht = null,
}: CustomerBookingConfirmationProps) => {
  const ueberfuehrung = isUeberfuehrung || tarif?.tarif === 'ueberfuehrung';
  const tarifText = tarif && !tarif.needsReview ? tarifTextByKey(tarif.tarif) : undefined;
  const istWochenpreis = tarif?.tarif === 'lkw_ce_woche';
  const tarifDetails = tarifText ? withoutRedundantDetails(tarifText.details) : [];
  const spezialanforderungen = eigenstaendigeAnforderungen(requirements, message);

  return (
    <BaseEmail previewText="Eingangsbestätigung Ihrer Fahreranfrage – Fahrerexpress-Agentur">
      <Heading {...getTextProps(textStyles.heading2, 'heading')}>
        {buildSalutation(customerName, companyName)}
      </Heading>

      <Text {...getTextProps(textStyles.paragraph)}>
        Vielen Dank für Ihre Anfrage über unser Buchungsformular.
      </Text>
      <Text {...getTextProps(textStyles.paragraph)}>
        Ihre Anfrage ist bei uns eingegangen. Fahrerexpress prüft nun die Verfügbarkeit passender selbstständiger Fahrer. Ein kostenpflichtiger Auftrag entsteht erst nach Bestätigung durch Fahrerexpress und erfolgreicher Fahrerzuteilung. Nach Mitteilung der Fahrerzuteilung haben Sie die Möglichkeit, der Zuteilung unverzüglich zu widersprechen, sofern die mitgeteilten Daten nicht passen.
      </Text>

      <Section {...getBoxProps(boxStyles.warningBox)}>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 10px 0' })}>
          <strong>Wichtiger Hinweis:</strong> Die tatsächliche Durchführung des Einsatzes steht unter dem Vorbehalt, dass ein geeigneter selbstständiger Unternehmer verfügbar ist und den Auftrag annimmt.
        </Text>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
          Sollte kein passender Fahrer verfügbar sein, kommt kein Einsatz zustande und es entstehen Ihnen keinerlei Kosten.
        </Text>
      </Section>

      <Section {...getBoxProps(boxStyles.infoBox)}>
        <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>Ihre Anfrage im Überblick</Heading>
        <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px', width: '45%' }} className="mobile-text"><strong>Fahrertyp:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">
              {tarif
                ? (tarif.needsReview ? 'wird dem passenden veröffentlichten Tarif zugeordnet' : tarif.label)
                : driverType}
            </td>
          </tr>
          {spezialanforderungen.length > 0 && (
            <tr>
              <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Spezialanforderungen:</strong></td>
              <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{spezialanforderungen.join(', ')}</td>
            </tr>
          )}
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Zeitraum:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{timeframe}</td>
          </tr>
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Einsatzort:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{location}</td>
          </tr>
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Einsatztätigkeiten und Anforderungen:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{message}</td>
          </tr>
        </table>
        <Text {...getTextProps({ ...textStyles.paragraph, fontSize: '13px', fontStyle: 'italic', margin: '12px 0 0 0' })}>
          Der Besteller hat bestätigt, dass die beschriebenen Einsatztätigkeiten und Anforderungen vollständig und richtig sind. Diese Angaben bilden die Grundlage der Einsatzabstimmung und der Auftragsannahme durch den selbstständigen Fahrer.
        </Text>
      </Section>

      {unterkunftOption && (
        <Section {...getBoxProps(boxStyles.infoBox)}>
          <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>Ihre Angaben zur Unterkunft</Heading>
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
            {UNTERKUNFT_OPTIONEN[unterkunftOption]}
          </Text>
          {unterkunftOption === 'fahrer_organisiert' && typeof unterkunftObergrenze === 'number' && (
            <Text {...getTextProps({ ...textStyles.paragraph, margin: '8px 0 0 0' })}>
              <strong>{OBERGRENZE_LABEL}:</strong> {formatEuroKosten(unterkunftObergrenze)}
            </Text>
          )}
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '8px 0 0 0' })}>
            {UNTERKUNFT_GRUNDSATZ}
          </Text>
        </Section>
      )}

      {!ueberfuehrung && kostenUebersicht && (
        <Section {...getBoxProps(boxStyles.infoBox)}>
          <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>{VORKALKULATION_TITEL}</Heading>
          <Text {...getTextProps({ ...textStyles.paragraph, fontSize: '13px', margin: '0 0 10px 0' })}>
            {VORKALKULATION_HINWEIS}
          </Text>
          <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
            {kostenUebersicht.positionen.map((p) => (
              <tr key={p.label}>
                <td style={{ padding: '4px 0', fontSize: '14px' }} className="mobile-text">{p.label}</td>
                <td style={{ padding: '4px 0', fontSize: '14px', textAlign: 'right', whiteSpace: 'nowrap' }} className="mobile-text">
                  {formatEuroKosten(p.betrag)}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: '6px 0 2px 0', fontSize: '14px', fontWeight: 'bold', borderTop: '1px solid #e5e7eb' }} className="mobile-text">Zwischensumme netto</td>
              <td style={{ padding: '6px 0 2px 0', fontSize: '14px', fontWeight: 'bold', textAlign: 'right', whiteSpace: 'nowrap', borderTop: '1px solid #e5e7eb' }} className="mobile-text">
                {formatEuroKosten(kostenUebersicht.netto)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '2px 0', fontSize: '14px' }} className="mobile-text">zzgl. 19 % Umsatzsteuer</td>
              <td style={{ padding: '2px 0', fontSize: '14px', textAlign: 'right', whiteSpace: 'nowrap' }} className="mobile-text">
                {formatEuroKosten(kostenUebersicht.ust)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '2px 0', fontSize: '14px', fontWeight: 'bold' }} className="mobile-text">Bruttosumme</td>
              <td style={{ padding: '2px 0', fontSize: '14px', fontWeight: 'bold', textAlign: 'right', whiteSpace: 'nowrap' }} className="mobile-text">
                {formatEuroKosten(kostenUebersicht.brutto)}
              </td>
            </tr>
          </table>
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '10px 0 0 0' })}>
            <strong>Noch offene Zusatzkosten (nicht in der Vorkalkulation enthalten):</strong>
          </Text>
          <ul style={listStyle} className="mobile-text">
            {offenePositionen(unterkunftOption ?? '', unterkunftObergrenze).map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '10px 0 0 0' })}>
            {OFFENE_KOSTEN_HINWEIS}
          </Text>
        </Section>
      )}

      <Section {...getBoxProps(boxStyles.infoBox)}>
        <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>Ihr Vertragspartner</Heading>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>{ROLLENBESCHREIBUNG}</Text>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '10px 0 0 0' })}>
          Fahrerexpress vermittelt den benannten selbstständigen Fahrer für den angefragten Einsatz. Die Durchführung erfolgt eigenverantwortlich durch den selbstständigen Fahrer. Fahrerexpress erbringt keine Arbeitnehmerüberlassung und stellt keine eigenen Arbeitnehmer zur Verfügung.
        </Text>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '10px 0 0 0' })}>
          Sollte der Fahrer aus Krankheit, höherer Gewalt oder sonstigen unvorhersehbaren Gründen ausfallen, bemüht sich Fahrerexpress nach Möglichkeit um eine Ersatzlösung. Eine jederzeitige Ersatzgestellung wird nicht zugesagt.
        </Text>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '10px 0 0 0' })}>
          Fahrerexpress haftet nicht für mittelbare Schäden, entgangenen Gewinn, Produktionsausfall, Vertragsstrafen oder Folgeschäden des Auftraggebers, soweit diese nicht auf Vorsatz oder grober Fahrlässigkeit von Fahrerexpress beruhen. Die Haftung für Vorsatz sowie für Schäden aus der Verletzung von Leben, Körper oder Gesundheit bleibt unberührt.
        </Text>
      </Section>


      {ueberfuehrung && (
        <Section {...getBoxProps({ ...boxStyles.highlightBox, backgroundColor: '#f0fdf4', borderLeftColor: '#16a34a' })}>
          <Heading {...getTextProps({ ...textStyles.heading3, color: '#15803d' }, 'small-heading')}>
            LKW-Überführung – individuelles Angebot
          </Heading>
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
            Kosten nach Fahrzeug, Strecke und Aufwand – individuelles Angebot.
          </Text>
        </Section>
      )}

      {!ueberfuehrung && tarif && !tarif.needsReview && (
        <Section {...getBoxProps({ ...boxStyles.highlightBox, backgroundColor: '#f0fdf4', borderLeftColor: '#16a34a' })}>
          <Heading {...getTextProps({ ...textStyles.heading3, color: '#15803d' }, 'small-heading')}>
            Für Ihren Einsatz maßgeblicher Tarif
          </Heading>
          <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
            <tr>
              <td style={{ padding: '5px 0', fontSize: '14px', width: '45%' }} className="mobile-text"><strong>Fahrertyp:</strong></td>
              <td style={{ padding: '5px 0', fontSize: '14px', fontWeight: 'bold' }} className="mobile-text">{tarif.label}</td>
            </tr>
            {tarifText && (
              <tr>
                <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Preis:</strong></td>
                <td style={{ padding: '5px 0', fontSize: '14px', fontWeight: 'bold' }} className="mobile-text">
                  {tarifText.priceLine}
                  {tarifDetails[0] ? ` – ${tarifDetails[0].charAt(0).toLowerCase()}${tarifDetails[0].slice(1)}` : ''}
                </td>
              </tr>
            )}
            {typeof tarif.mehrstunde === 'number' && (
              <tr>
                <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Mehrarbeit:</strong></td>
                <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">
                  {formatEuro(tarif.mehrstunde)} netto je angefangene Stunde
                </td>
              </tr>
            )}
            <tr style={{ backgroundColor: ZUSATZKOSTEN_BOX.backgroundColor }}>
              <td style={{ padding: '5px 6px', fontSize: '14px', color: ZUSATZKOSTEN_HEADING }} className="mobile-text"><strong>An- und Abfahrt:</strong></td>
              <td style={{ padding: '5px 6px', fontSize: '14px' }} className="mobile-text">
                {TRAVEL_COSTS.short}
              </td>
            </tr>
          </table>
          {tarifDetails.length > 1 && (
            <ul style={listStyle} className="mobile-text">
              {tarifDetails.slice(1).map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
          {istWochenpreis && TARIF_TEXTE.lkw_ce_woche.notes?.map((n) => (
            <Text key={n} {...getTextProps({ ...textStyles.paragraph, margin: '10px 0 0 0' })}>{n}</Text>
          ))}
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '12px 0 0 0' })}>
            Alle weiteren Preise und Konditionen finden Sie in unserer zum Zeitpunkt der Buchungsanfrage veröffentlichten{' '}
            <Link href={PREISE_URL} style={{ color: colors.primary }}>Preisliste</Link>.
          </Text>
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '10px 0 0 0' })}>{ABRECHNUNGSTEXT}</Text>
          <Text {...getTextProps({ ...textStyles.muted, fontSize: '13px', margin: '12px 0 0 0' })}>
            <strong>Alle Preise netto zzgl. gesetzlicher MwSt.</strong> Zahlungsziel: 7 Kalendertage netto ab Rechnungsdatum.
          </Text>
        </Section>
      )}

      {!ueberfuehrung && (!tarif || tarif.needsReview) && (
        <Section {...getBoxProps({ ...boxStyles.infoBox, backgroundColor: '#fef3c7', borderLeftColor: '#d97706' })}>
          <Heading {...getTextProps({ ...textStyles.heading3, color: '#92400e' }, 'small-heading')}>
            Zuordnung zum passenden veröffentlichten Tarif
          </Heading>
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 10px 0' })}>
            Die veröffentlichten Preise und Konditionen sind eindeutig. Aufgrund unvollständiger Angaben zur konkreten Tätigkeit konnte der passende Tarif noch nicht automatisch zugeordnet werden. Die Zuordnung erfolgt vor der verbindlichen Einsatzbestätigung.
          </Text>
          {isFernfahrerTarif && (
            <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 10px 0' })}>
              {TARIF_TEXTE.fernfahrer.name}: {TARIF_TEXTE.fernfahrer.priceLine}.
            </Text>
          )}
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 10px 0' })}>
            Alle Preise und Konditionen finden Sie in unserer zum Zeitpunkt der Buchungsanfrage veröffentlichten{' '}
            <Link href={PREISE_URL} style={{ color: colors.primary }}>Preisliste</Link>.
          </Text>
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>{ABRECHNUNGSTEXT}</Text>
          <Text {...getTextProps({ ...textStyles.muted, fontSize: '13px', margin: '12px 0 0 0' })}>
            <strong>Alle Preise netto zzgl. gesetzlicher MwSt.</strong> Zahlungsziel: 7 Kalendertage netto ab Rechnungsdatum.
          </Text>
        </Section>
      )}

      {!ueberfuehrung && (<Section {...getBoxProps({ ...boxStyles.infoBox, ...ZUSATZKOSTEN_BOX })}>
        <Heading {...getTextProps({ ...textStyles.heading3, color: ZUSATZKOSTEN_HEADING }, 'small-heading')}>Einsatzzeit und Mehrstunden</Heading>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 10px 0' })}>
          Der Tagessatz gilt für die gesamte Einsatzzeit und nicht ausschließlich für die reine Fahrzeit. Zur Einsatzzeit zählen unter anderem gesetzliche Pausen, Fahrzeugübernahme, Wartezeiten, Dokumentation sowie organisatorische Tätigkeiten rund um den Einsatz.
        </Text>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 10px 0' })}>{MEHRSTUNDENREGEL}</Text>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '10px 0 0 0' })}>
          Einsätze, die erheblich über die vereinbarte Einsatzzeit hinausgehen oder in den nächsten Kalendertag hineinreichen, können als zusätzlicher Einsatztag oder Fernverkehrseinsatz berechnet werden.
        </Text>
      </Section>)}

      {!ueberfuehrung && (<Section {...getBoxProps({ ...boxStyles.infoBox, ...ZUSATZKOSTEN_BOX })}>
        <Heading {...getTextProps({ ...textStyles.heading3, color: ZUSATZKOSTEN_HEADING }, 'small-heading')}>Wochenend- und Feiertagszuschläge</Heading>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
          Fällt ein Einsatz auf einen Samstag, Sonntag oder gesetzlichen Feiertag, wird der Zuschlag automatisch auf den jeweiligen Tagessatz berechnet. Eine gesonderte vorherige Vereinbarung ist hierfür nicht erforderlich.
        </Text>
        <ul style={listStyle} className="mobile-text">
          <li>Samstag: 25 %</li>
          <li>Sonntag und gesetzliche Feiertage: 50 %</li>
        </ul>
        {weekendHolidayAffected && (
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '10px 0 0 0' })}>
            <strong>Ihr angefragter Einsatzzeitraum enthält einen Samstag, Sonntag oder gesetzlichen Feiertag.</strong>
          </Text>
        )}
        {weekendHolidayAcknowledged && (
          <Text {...getTextProps({ ...textStyles.paragraph, fontStyle: 'italic', margin: '6px 0 0 0' })}>
            Der Besteller hat diesen Hinweis vor Absenden der Anfrage bestätigt.
          </Text>
        )}
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '10px 0 0 0' })}>
          Nachtarbeit, besondere Zusatzleistungen oder außergewöhnliche Anforderungen werden gesondert abgestimmt.
        </Text>
      </Section>)}

      <OvernightCostNotice tarifKey={ueberfuehrung ? 'ueberfuehrung' : tarif?.tarif} isFernfahrerTarif={isFernfahrerTarif} highlight showMultiWeek={!ueberfuehrung && (tarif?.tarif === 'lkw_ce_woche' || tarif?.tarif === 'fernfahrer')} />

      <Section {...getBoxProps({ ...boxStyles.warningBox, ...ZUSATZKOSTEN_BOX })}>
        <Heading {...getTextProps({ ...textStyles.heading3, color: ZUSATZKOSTEN_HEADING }, 'small-heading')}>Stornierungsregelung nach Einsatzbestätigung</Heading>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 8px 0' })}>
          Die nachfolgenden Stornokosten gelten ab der verbindlichen Einsatzbestätigung, also nachdem ein selbstständiger Fahrer den Auftrag angenommen hat und Ihnen der Einsatz bestätigt wurde.
        </Text>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 8px 0' })}>
          Eine kostenfreie Stornierung ist bis 24 Stunden vor Einsatzbeginn möglich.
        </Text>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 8px 0' })}>
          Bei einer Stornierung unter 24 Stunden vor Einsatzbeginn behält sich Fahrerexpress vor, den entgangenen Aufwand pauschal mit 80 % des vereinbarten Tagessatzes zu berechnen, sofern der Auftraggeber keinen oder einen geringeren Schaden nachweist.
        </Text>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 8px 0' })}>
          Bei Absage am Einsatztag oder Nichterscheinen des Auftraggebers können 100 % des vereinbarten Tagessatzes berechnet werden, sofern der Auftraggeber keinen oder einen geringeren Schaden nachweist.
        </Text>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 8px 0' })}>
          Kurzfristige Einsätze ab etwa 24 Stunden Vorlauf sind je nach Fahrerverfügbarkeit möglich. Eine kurzfristige Vermittlung können wir jedoch nicht garantieren.
        </Text>
        <Text {...getTextProps({ ...textStyles.muted, fontSize: '12px', margin: '10px 0 0 0' })}>
          Es gelten die auf unserer Webseite veröffentlichten Vermittlungsbedingungen.
        </Text>
      </Section>

      <Section {...getBoxProps(boxStyles.successBox)}>
        <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>Wie es jetzt weitergeht</Heading>
        <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
          <li>Wir prüfen verfügbare selbstständige Unternehmer in Ihrer Region</li>
          <li>Sie erhalten eine Rückmeldung zur Verfügbarkeit</li>
          <li>Bei Verfügbarkeit vermitteln wir einen passenden selbstständigen Fahrer</li>
          <li>Nach Annahme des Auftrags erhalten Sie die verbindliche Einsatzbestätigung mit den organisatorischen Details (Fahrer, Zeiten, Ablauf)</li>
        </ol>
      </Section>

    </BaseEmail>
  );
};

export default CustomerBookingConfirmation;
