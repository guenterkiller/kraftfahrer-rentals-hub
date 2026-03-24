import { Heading, Text, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles, getBoxProps, getTextProps } from './base-email.tsx';

interface CustomerBookingConfirmationProps {
  customerName: string;
  companyName?: string;
  driverType: string;
  requirements?: string[];
  timeframe: string;
  location: string;
  message: string;
  isFernfahrerTarif?: boolean;
}

export const CustomerBookingConfirmation = ({
  customerName,
  companyName,
  driverType,
  requirements = [],
  timeframe,
  location,
  message,
  isFernfahrerTarif = false,
}: CustomerBookingConfirmationProps) => (
  <BaseEmail previewText="Eingangsbestätigung Ihrer Fahreranfrage – Fahrerexpress-Agentur">
    <Heading {...getTextProps(textStyles.heading2, 'heading')}>
      Sehr geehrte/r {companyName ? `${companyName} (${customerName})` : customerName},
    </Heading>

    <Text {...getTextProps(textStyles.paragraph)}>
      Vielen Dank für Ihre Anfrage über unser Buchungsformular.
    </Text>
    <Text {...getTextProps(textStyles.paragraph)}>
      Mit dem Absenden des Formulars haben Sie eine verbindliche Anfrage zur Fahrerdisposition gestellt. Die Beauftragung erfolgt gemäß unseren veröffentlichten Vermittlungs- und Stornierungsbedingungen.
    </Text>

    <Section {...getBoxProps(boxStyles.warningBox)}>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 10px 0' })}>
        <strong>Wichtiger Hinweis:</strong> Die Durchführung des Einsatzes erfolgt ausschließlich unter dem Vorbehalt der tatsächlichen Verfügbarkeit eines geeigneten Fahrers.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Sollte kein passender Fahrer verfügbar sein, kommt kein Einsatz zustande und es entstehen Ihnen keinerlei Kosten.
      </Text>
    </Section>

    <Section {...getBoxProps(boxStyles.infoBox)}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>📝 Ihre Anfrage im Überblick</Heading>
      <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Fahrertyp:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{driverType}</td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Tarif:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">
            {isFernfahrerTarif ? 'Fernfahrer-Tarif (450 € netto / Einsatztag)' : 'Standard-Tagessatz'}
          </td>
        </tr>
        {requirements.length > 0 && (
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Spezialanforderungen:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{requirements.join(', ')}</td>
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
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Ihre Nachricht:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{message}</td>
        </tr>
      </table>
    </Section>

    {isFernfahrerTarif && (
      <Section {...getBoxProps({ ...boxStyles.infoBox, backgroundColor: '#eff6ff', borderLeftColor: '#3b82f6' })}>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
          Fernfahrer-Tarif gilt für Fernverkehr mit Übernachtung im LKW und durchgehender Abwesenheit von zuhause. Abrechnung pauschal pro Einsatztag – keine Stundenabrechnung.
        </Text>
      </Section>
    )}

    <Section {...getBoxProps(boxStyles.highlightBox)}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>💰 Preisübersicht gemäß Bestellung</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph })}>
        Die Abrechnung erfolgt auf Basis der bei Bestellung veröffentlichten Preise. Die finale Abrechnung richtet sich nach dem tatsächlichen Einsatzumfang.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph })}>
        Die Fahrleistung wird von selbstständigen Unternehmern erbracht. Die Fahrerexpress-Agentur koordiniert den Einsatz und erstellt nach Durchführung eine Rechnung. Für Sie als Auftraggeber entstehen keine zusätzlichen Vermittlungsgebühren.
      </Text>

      <Hr style={{ borderTop: `1px solid ${colors.border}`, margin: '20px 0' }} />

      {isFernfahrerTarif ? (
        <>
          <Heading {...getTextProps({ ...textStyles.heading3, fontSize: '15px', marginBottom: '10px' }, 'small-heading')}>Fernfahrer-Tarif (LKW CE)</Heading>
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 5px 0' })}>
            <strong>450 € netto pro Einsatztag</strong>
          </Text>
          <Text {...getTextProps({ ...textStyles.muted, marginBottom: '20px' })}>
            Pauschale pro Einsatztag – keine Stundenabrechnung.
            Gilt für Fernverkehr mit Übernachtung im LKW.
          </Text>
        </>
      ) : (
        <>
          <Heading {...getTextProps({ ...textStyles.heading3, fontSize: '15px', marginBottom: '10px' }, 'small-heading')}>LKW CE Fahrer</Heading>
          <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 5px 0' })}>
            <strong>ab 349 € pro Tag</strong> (8 Stunden) | <strong>ab 30 € pro Überstunde</strong>
          </Text>
          <Text {...getTextProps({ ...textStyles.muted, marginBottom: '20px' })}>
            Gilt für: Fahrmischer, Fernverkehr, Nahverkehr, ADR, Container, Wechselbrücke,
            Kühltransport, Baustellenverkehr, Event- und Messe-Logistik u. v. m.
          </Text>
        </>
      )}

      <Heading {...getTextProps({ ...textStyles.heading3, fontSize: '15px', marginBottom: '10px' }, 'small-heading')}>Baumaschinenführer</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 5px 0' })}>
        <strong>ab 459 € pro Tag</strong> (8 Stunden) | <strong>ab 60 € pro Überstunde</strong>
      </Text>
      <Text {...getTextProps({ ...textStyles.muted, marginBottom: '20px' })}>
        Gilt für: Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen,
        Störungsbehebung, Baustellenlogistik & Materialfluss.
      </Text>

      <Heading {...getTextProps({ ...textStyles.heading3, fontSize: '15px', marginBottom: '10px' }, 'small-heading')}>Fahrtkosten & Langzeiteinsätze</Heading>
      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
        <li><strong>Fahrtkosten:</strong> 25 km inklusive, danach 0,40 €/km (Hin- und Rückweg)</li>
        <li><strong>Langzeiteinsätze:</strong> Ab 3 Monaten individuelle Konditionen auf Anfrage</li>
      </ul>

      <Text {...getTextProps({ ...textStyles.muted, fontSize: '12px', fontStyle: 'italic', marginTop: '15px' })}>
        Alle Preise netto zzgl. gesetzlicher MwSt., Fahrt- und ggf. Übernachtungskosten.
        Die Abrechnung erfolgt nach tatsächlichem Einsatzumfang.
      </Text>
    </Section>

    <Section {...getBoxProps({ ...boxStyles.warningBox, backgroundColor: '#fffbeb', borderLeftColor: '#f59e0b' })}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: '#b45309' }, 'small-heading')}>Stornierungsregelung (gilt ab Bestellung)</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 8px 0' })}>
        Eine kostenfreie Stornierung ist bis 24 Stunden vor Einsatzbeginn möglich.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 8px 0' })}>
        Bei einer Stornierung unter 24 Stunden vor Einsatzbeginn werden 80 % des vereinbarten Tagessatzes berechnet.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 8px 0' })}>
        Same-Day-Buchungen sind ausgeschlossen (Mindestvorlauf: 24 Stunden an Werktagen).
      </Text>
      <Text {...getTextProps({ ...textStyles.muted, fontSize: '12px', marginTop: '10px' })}>
        Es gelten die auf unserer Webseite veröffentlichten Vermittlungsbedingungen.
      </Text>
    </Section>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>🔄 Wie es jetzt weitergeht</Heading>
      <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
        <li>Wir prüfen verfügbare selbstständige Fahrer in Ihrer Region</li>
        <li>Sie erhalten spätestens am nächsten Werktag unsere Rückmeldung</li>
        <li>Bei Verfügbarkeit vermitteln wir einen passenden Fahrer</li>
        <li>Nach erfolgreicher Disposition erhalten Sie eine Einsatzbestätigung mit den organisatorischen Details (Fahrer, Zeiten, Ablauf)</li>
      </ol>
    </Section>

    <Section {...getBoxProps({ ...boxStyles.successBox, backgroundColor: '#fef3f2', borderLeftColor: colors.primary })}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>✅ Warum Fahrerexpress?</Heading>
      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
        <li>Keine Kosten, falls kein Fahrer verfügbar ist</li>
        <li>Transparente Preise ohne versteckte Vermittlungsgebühren</li>
        <li>Selbstständige Fahrer auf Basis eines Dienst-/Werkvertrags</li>
        <li>Qualifizierte und erfahrene Fahrer</li>
        <li>Eine Rechnung über die Fahrerexpress-Agentur</li>
      </ul>
    </Section>
  </BaseEmail>
);

export default CustomerBookingConfirmation;
