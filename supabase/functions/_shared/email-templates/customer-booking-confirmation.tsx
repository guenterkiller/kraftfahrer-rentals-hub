import { Heading, Text, Section, Link } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles, getBoxProps, getTextProps } from './base-email.tsx';
import { TARIF_TEXTE, tarifTextByKey } from './tarif-text-helper.ts';
import { TRAVEL_COSTS } from '../overnight-costs.ts';
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
  FERNFAHRER_PREIS_HINWEIS,
  FERNFAHRER_WOCHENENDRUHE_HINWEIS,
} from '../kosten-uebersicht.ts';

const PREISE_URL = 'https://www.kraftfahrer-mieten.com/preise-und-ablauf';
const BEDINGUNGEN_URL = 'https://www.kraftfahrer-mieten.com/vermittlungsbedingungen';

interface CustomerBookingConfirmationProps {
  customerName: string;
  companyName?: string;
  driverType: string;
  selectedActivity?: string;
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
  selectedActivity,
  requirements = [],
  timeframe,
  location,
  message,
  weekendHolidayAffected = false,
  tarif,
  isUeberfuehrung = false,
  unterkunftOption = null,
  unterkunftObergrenze = null,
  kostenUebersicht = null,
}: CustomerBookingConfirmationProps) => {
  // Kurzfassung: nur wichtigste Daten, Kundenpreis und Status; alle weiteren Konditionen über Links.
  const ueberfuehrung = isUeberfuehrung || tarif?.tarif === 'ueberfuehrung';
  const tarifText = tarif && !tarif.needsReview ? tarifTextByKey(tarif.tarif) : undefined;
  const istFernfahrer = tarif?.tarif === 'fernfahrer';
  const ohneZuschlaege = tarif?.tarif === 'event' || istFernfahrer;
  const tarifDetails = tarifText ? withoutRedundantDetails(tarifText.details) : [];
  const spezialanforderungen = eigenstaendigeAnforderungen(requirements, message);
  const cell = { padding: '4px 0', fontSize: '14px', verticalAlign: 'top' as const };
  const row = (k: string, v: React.ReactNode) => (
    <tr key={k}><td style={{ ...cell, width: '40%' }} className="mobile-text"><strong>{k}:</strong></td><td style={cell} className="mobile-text">{v}</td></tr>
  );
  const unterkunft = unterkunftOption
    ? `${UNTERKUNFT_OPTIONEN[unterkunftOption]}${unterkunftOption === 'fahrer_organisiert' && typeof unterkunftObergrenze === 'number' ? ` ${OBERGRENZE_LABEL}: ${formatEuroKosten(unterkunftObergrenze)}` : ''}`
    : '';

  return (
    <BaseEmail previewText="Eingangsbestätigung Ihrer Fahreranfrage – Fahrerexpress-Agentur">
      <Heading {...getTextProps(textStyles.heading2, 'heading')}>
        {buildSalutation(customerName, companyName)}
      </Heading>
      <Text {...getTextProps(textStyles.paragraph)}>
        vielen Dank für Ihre Anfrage über unser Buchungsformular. Ihre verbindliche Anfrage zur Fahrerdisposition ist eingegangen.
      </Text>

      <Section {...getBoxProps(boxStyles.warningBox)}>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
          <strong>Status: Anfrage – noch keine Einsatzbestätigung.</strong> Wir prüfen jetzt die Verfügbarkeit passender selbstständiger Fahrer. Ein kostenpflichtiger Auftrag entsteht erst nach Bestätigung durch Fahrerexpress und erfolgreicher Fahrerzuteilung. Ist kein passender Fahrer verfügbar, entstehen Ihnen keine Kosten.
        </Text>
      </Section>

      <Section {...getBoxProps(boxStyles.infoBox)}>
        <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>Ihre Anfrage</Heading>
        <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
          {companyName ? row('Auftraggeber', companyName) : null}
          {customerName ? row('Kontakt', customerName) : null}
          {row('Einsatzort', location)}
          {row('Zeitraum', timeframe)}
          {row('Fahrertyp', tarif ? (tarif.needsReview ? 'wird dem passenden veröffentlichten Tarif zugeordnet' : tarif.label) : driverType)}
          {selectedActivity && selectedActivity !== driverType ? row('Tätigkeit / Fahrzeugart', selectedActivity) : null}
          {spezialanforderungen.length > 0 ? row('Anforderungen', spezialanforderungen.join(', ')) : null}
          {row('Aufgabe', message)}
          {unterkunft ? row('Unterkunft', unterkunft) : null}
        </table>
      </Section>

      {ueberfuehrung ? (
        <Section {...getBoxProps(boxStyles.infoBox)}>
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
            <strong>Preis:</strong> LKW-Überführung – individuelles Angebot nach Fahrzeug, Strecke und Aufwand.
          </Text>
        </Section>
      ) : (
        <Section {...getBoxProps(boxStyles.infoBox)}>
          <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>Preis</Heading>
          {tarifText ? (
            <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
              {row('Tarif', `${tarifText.priceLine}${tarifDetails[0] ? ` – ${tarifDetails[0].charAt(0).toLowerCase()}${tarifDetails[0].slice(1)}` : ''}`)}
              {typeof tarif?.mehrstunde === 'number' && !ohneZuschlaege ? row('Mehrarbeit', `${formatEuro(tarif.mehrstunde)} netto je angefangene Stunde`) : null}
              {row('Zuschläge', ohneZuschlaege ? 'Keine Samstags-, Sonntags- oder Feiertagszuschläge' : 'Samstag 25 %, Sonntag und gesetzliche Feiertage 50 %')}
              {row('An- und Abfahrt', TRAVEL_COSTS.short)}
            </table>
          ) : (
            <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
              Der passende veröffentlichte Tarif wird vor der verbindlichen Einsatzbestätigung zugeordnet.
            </Text>
          )}
          {!ohneZuschlaege && weekendHolidayAffected && (
            <Text {...getTextProps({ ...textStyles.paragraph, fontSize: '13px', margin: '8px 0 0 0' })}>
              Ihr Zeitraum enthält einen Samstag, Sonntag oder gesetzlichen Feiertag.
            </Text>
          )}
          {kostenUebersicht && (
            <>
              <Text {...getTextProps({ ...textStyles.paragraph, fontWeight: 'bold', margin: '12px 0 4px 0' })}>{VORKALKULATION_TITEL}</Text>
              <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
                {kostenUebersicht.positionen.map((p) => (
                  <tr key={p.label}>
                    <td style={cell} className="mobile-text">{p.label}</td>
                    <td style={{ ...cell, textAlign: 'right', whiteSpace: 'nowrap' }} className="mobile-text">{formatEuroKosten(p.betrag)}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ ...cell, fontWeight: 'bold', borderTop: '1px solid #e5e7eb' }} className="mobile-text">Summe netto</td>
                  <td style={{ ...cell, fontWeight: 'bold', textAlign: 'right', whiteSpace: 'nowrap', borderTop: '1px solid #e5e7eb' }} className="mobile-text">{formatEuroKosten(kostenUebersicht.netto)}</td>
                </tr>
                <tr>
                  <td style={cell} className="mobile-text">zzgl. 19 % USt. / brutto</td>
                  <td style={{ ...cell, textAlign: 'right', whiteSpace: 'nowrap' }} className="mobile-text">{formatEuroKosten(kostenUebersicht.ust)} / {formatEuroKosten(kostenUebersicht.brutto)}</td>
                </tr>
              </table>
              <Text {...getTextProps({ ...textStyles.paragraph, fontSize: '13px', margin: '8px 0 0 0' })}>
                Unverbindlich; abgerechnet werden die tatsächlich geleisteten Einsatztage. {OFFENE_KOSTEN_HINWEIS}
              </Text>
              {istFernfahrer && (
                <Text {...getTextProps({ ...textStyles.paragraph, fontSize: '13px', margin: '6px 0 0 0' })}>{FERNFAHRER_WOCHENENDRUHE_HINWEIS}</Text>
              )}
            </>
          )}
        </Section>
      )}

      <Text {...getTextProps({ ...textStyles.paragraph, fontSize: '13px' })}>
        Fahrerexpress vermittelt selbstständige Fahrer (keine Arbeitnehmerüberlassung, keine Fahrzeuge). Alle Preise netto zzgl. MwSt. Es gelten unsere{' '}
        <Link href={BEDINGUNGEN_URL} style={{ color: colors.primary }}>Vermittlungsbedingungen</Link> und die{' '}
        <Link href={PREISE_URL} style={{ color: colors.primary }}>Preisliste</Link> (u. a. Mehrstunden, Zuschläge, Übernachtung, Stornierung, Haftung).
      </Text>
      <Text {...getTextProps(textStyles.paragraph)}>
        Sie erhalten eine Rückmeldung zur Verfügbarkeit. Nach Annahme durch einen Fahrer folgt die Einsatzbestätigung mit Fahrer und Kontakt.
      </Text>
    </BaseEmail>
  );
};

export default CustomerBookingConfirmation;
