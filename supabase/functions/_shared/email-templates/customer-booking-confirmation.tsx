import { Heading, Text, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles } from './base-email.tsx';

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
    <Heading style={textStyles.heading2}>
      Sehr geehrte/r {companyName ? `${companyName} (${customerName})` : customerName},
    </Heading>

    <Text style={textStyles.paragraph}>
      vielen Dank für Ihre Anfrage über unsere Website!
    </Text>

    <Section style={boxStyles.warningBox}>
      <Text style={{ ...textStyles.paragraph, margin: '0' }}>
        <strong>Wichtiger Hinweis:</strong> Diese Bestätigung ist eine Eingangsbestätigung Ihrer Buchungsanfrage.
        Die Buchung wird erst verbindlich, wenn ein Fahrer den Auftrag annimmt und wir Ihnen dies separat per E-Mail bestätigen.
      </Text>
    </Section>

    <Section style={boxStyles.infoBox}>
      <Heading style={textStyles.heading3}>📝 Ihre Anfrage im Überblick</Heading>
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Fahrertyp:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{driverType}</td>
        </tr>
        {requirements.length > 0 && (
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Spezialanforderungen:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }}>{requirements.join(', ')}</td>
          </tr>
        )}
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Zeitraum:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{timeframe}</td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Einsatzort:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{location}</td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Ihre Nachricht:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{message}</td>
        </tr>
      </table>
    </Section>

    <Section style={boxStyles.highlightBox}>
      <Heading style={textStyles.heading3}>💰 Abrechnung & Preise</Heading>
      <Text style={{ ...textStyles.paragraph, fontWeight: 'bold' }}>
        Die Abrechnung erfolgt ausschließlich über die Fahrerexpress-Agentur.
      </Text>

      <Hr style={{ borderTop: `1px solid ${colors.border}`, margin: '20px 0' }} />

      <Heading style={{ ...textStyles.heading3, fontSize: '15px', marginBottom: '10px' }}>LKW CE Fahrer</Heading>
      <Text style={{ ...textStyles.paragraph, margin: '0 0 5px 0' }}>
        <strong>349 € pro Tag</strong> (8 Stunden) | <strong>30 € pro Überstunde</strong>
      </Text>
      <Text style={{ ...textStyles.muted, marginBottom: '20px' }}>
        Gilt für: Fahrmischer, Fernverkehr, Nahverkehr, ADR, Container, Wechselbrücke,
        Kühltransport, Baustellenverkehr, Event- und Messe-Logistik u. v. m.
      </Text>

      <Heading style={{ ...textStyles.heading3, fontSize: '15px', marginBottom: '10px' }}>Baumaschinenführer</Heading>
      <Text style={{ ...textStyles.paragraph, margin: '0 0 5px 0' }}>
        <strong>459 € pro Tag</strong> (8 Stunden) | <strong>60 € pro Überstunde</strong>
      </Text>
      <Text style={{ ...textStyles.muted, marginBottom: '20px' }}>
        Gilt für: Bagger, Radlader, Fahrmischer, Flüssigboden, Mischanlagen,
        Störungsbehebung, Baustellenlogistik & Materialfluss.
      </Text>

      <Heading style={{ ...textStyles.heading3, fontSize: '15px', marginBottom: '10px' }}>Fahrtkosten & Langzeiteinsätze</Heading>
      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
        <li><strong>Fahrtkosten:</strong> 25 km inklusive, danach 0,40 €/km (Hin- und Rückweg)</li>
        <li><strong>Wochenpreise:</strong> LKW CE Fahrer ab 1.490 €/Woche (5 Tage)</li>
        <li><strong>Monatspreise:</strong> auf Anfrage je nach Einsatzdauer und Planungssicherheit</li>
      </ul>

      <Text style={{ ...textStyles.muted, fontSize: '12px', fontStyle: 'italic', marginTop: '15px' }}>
        Alle Preise verstehen sich netto zzgl. gesetzlicher MwSt., Fahrt- und ggf. Übernachtungskosten.
        Abrechnung nach tatsächlichem Einsatzumfang. Zuschläge für Überstunden, Nacht-, Sonn- und Feiertage
        gemäß aktueller Preisliste.
      </Text>
    </Section>

    <Section style={boxStyles.successBox}>
      <Heading style={{ ...textStyles.heading3, color: colors.success }}>🔄 Wie es jetzt weitergeht</Heading>
      <ol style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
        <li>Wir prüfen verfügbare Fahrer in Ihrer Region</li>
        <li>Sie erhalten spätestens am nächsten Werktag unsere Rückmeldung</li>
        <li>Bei Verfügbarkeit stellen wir den direkten Kontakt zum Fahrer her</li>
        <li>Nach Annahme durch den Fahrer erhalten Sie eine separate Auftragsbestätigung</li>
      </ol>
    </Section>

    <Section style={{ ...boxStyles.successBox, backgroundColor: '#fef3f2', borderLeftColor: colors.primary }}>
      <Heading style={textStyles.heading3}>✅ Warum Fahrerexpress?</Heading>
      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
        <li>Keine Kosten, falls kein Fahrer verfügbar ist</li>
        <li>Eine Rechnung, transparente Abwicklung</li>
        <li>Dienst-/Werkleistung – keine Arbeitnehmerüberlassung</li>
        <li>Qualifizierte und erfahrene Fahrer</li>
      </ul>
    </Section>
  </BaseEmail>
);

export default CustomerBookingConfirmation;
