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
}

export const CustomerBookingConfirmation = ({
  customerName,
  companyName,
  driverType,
  requirements = [],
  timeframe,
  location,
  message,
}: CustomerBookingConfirmationProps) => (
  <BaseEmail previewText="Ihre Fahrerbuchung bei der Fahrerexpress-Agentur">
    <Heading {...getTextProps(textStyles.heading2, 'heading')}>
      Sehr geehrte/r {companyName ? `${companyName} (${customerName})` : customerName},
    </Heading>

    <Text {...getTextProps(textStyles.paragraph)}>
      vielen Dank für Ihre Anfrage über unsere Website!
    </Text>

    <Section {...getBoxProps(boxStyles.warningBox)}>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        <strong>Wichtiger Hinweis:</strong> Diese Bestätigung ist eine Eingangsbestätigung Ihrer Buchungsanfrage.
        Die Buchung wird erst verbindlich, wenn ein Fahrer den Auftrag annimmt und wir Ihnen dies separat per E-Mail bestätigen.
      </Text>
    </Section>

    <Section {...getBoxProps(boxStyles.infoBox)}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>📝 Ihre Anfrage im Überblick</Heading>
      <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Fahrertyp:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{driverType}</td>
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

    <Section {...getBoxProps(boxStyles.highlightBox)}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>💰 Preise & Konditionen</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, fontWeight: 'bold' })}>
        Die Einsätze werden über die Fahrerexpress-Agentur koordiniert. Die Fahrleistung wird von selbstständigen Unternehmern erbracht, Sie erhalten eine übersichtliche Rechnung direkt von der Fahrerexpress-Agentur. Für Sie als Auftraggeber entstehen keine zusätzlichen Vermittlungsgebühren über die vereinbarten Tages- und Nebenkosten hinaus.
      </Text>

      <Hr style={{ borderTop: `1px solid ${colors.border}`, margin: '20px 0' }} />

      <Heading {...getTextProps({ ...textStyles.heading3, fontSize: '15px', marginBottom: '10px' }, 'small-heading')}>LKW CE Fahrer</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 5px 0' })}>
        <strong>349 € pro Tag</strong> (8 Stunden) | <strong>30 € pro Überstunde</strong>
      </Text>
      <Text {...getTextProps({ ...textStyles.muted, marginBottom: '20px' })}>
        Gilt für: Fahrmischer, Fernverkehr, Nahverkehr, ADR, Container, Wechselbrücke,
        Kühltransport, Baustellenverkehr, Event- und Messe-Logistik u. v. m.
      </Text>

      <Heading {...getTextProps({ ...textStyles.heading3, fontSize: '15px', marginBottom: '10px' }, 'small-heading')}>Baumaschinenführer</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 5px 0' })}>
        <strong>459 € pro Tag</strong> (8 Stunden) | <strong>60 € pro Überstunde</strong>
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
        Alle Preise verstehen sich netto zzgl. gesetzlicher MwSt., Fahrt- und ggf. Übernachtungskosten.
        Abrechnung nach tatsächlichem Einsatzumfang. Zuschläge für Überstunden, Nacht-, Sonn- und Feiertage
        gemäß aktueller Preisliste.
      </Text>
    </Section>

    <Section {...getBoxProps({ ...boxStyles.warningBox, backgroundColor: '#fffbeb', borderLeftColor: '#f59e0b' })}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: '#b45309' }, 'small-heading')}>⚠️ Stornierungsregelung</Heading>
      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
        <li><strong>Storno bis 24 Std. vorher</strong> → kostenlos</li>
        <li><strong>Storno unter 24 Std.</strong> → 80 % des Tagessatzes</li>
        <li><strong>Same-Day-Buchungen ausgeschlossen</strong> (Mindestvorlauf 24h werktags)</li>
      </ul>
      <Text {...getTextProps({ ...textStyles.muted, fontSize: '12px', marginTop: '10px' })}>
        Mit Ihrer Buchungsanfrage bestätigen Sie die Kenntnisnahme dieser Stornierungsregelung.
      </Text>
    </Section>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>🔄 Wie es jetzt weitergeht</Heading>
      <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
        <li>Wir prüfen verfügbare Fahrer in Ihrer Region</li>
        <li>Sie erhalten spätestens am nächsten Werktag unsere Rückmeldung</li>
        <li>Bei Verfügbarkeit stellen wir den direkten Kontakt zum Fahrer her</li>
        <li>Nach Annahme durch den Fahrer erhalten Sie eine separate Auftragsbestätigung</li>
      </ol>
    </Section>

    <Section {...getBoxProps({ ...boxStyles.successBox, backgroundColor: '#fef3f2', borderLeftColor: colors.primary })}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>✅ Warum Fahrerexpress?</Heading>
      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
        <li>Keine Kosten, falls kein Fahrer verfügbar ist</li>
        <li>Transparente Preise, keine versteckten Kosten</li>
        <li>Selbstständige Fahrer auf Basis eines Dienst-/Werkvertrags</li>
        <li>Qualifizierte und erfahrene Fahrer</li>
      </ul>
    </Section>
  </BaseEmail>
);

export default CustomerBookingConfirmation;
