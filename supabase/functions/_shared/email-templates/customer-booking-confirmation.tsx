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
  <BaseEmail previewText="Eingangsbestätigung Ihrer Fahreranfrage – Fahrerexpress-Agentur">
    <Heading {...getTextProps(textStyles.heading2, 'heading')}>
      Sehr geehrte/r {companyName ? `${companyName} (${customerName})` : customerName},
    </Heading>

    <Text {...getTextProps(textStyles.paragraph)}>
      Vielen Dank für Ihre verbindliche Fahrerbestellung. Ihre Anfrage gilt als Auftrag im Sinne unserer Stornoregelungen.
    </Text>

    <Section {...getBoxProps(boxStyles.warningBox)}>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 10px 0' })}>
        <strong>Wichtiger Hinweis:</strong> Ein verbindlicher Einsatz kommt zustande, wenn ein selbstständiger Fahrer den Einsatz annimmt und Sie von uns eine separate Auftragsbestätigung erhalten. Die Stornierungsregelungen gelten ab dem Zeitpunkt dieser Bestellung.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 10px 0' })}>
        Bitte beachten Sie: Eine Absage oder Änderung nach Auftragserteilung ist stornopflichtig, unabhängig davon, ob der Einsatz telefonisch abgestimmt wurde.
      </Text>
      <Text {...getTextProps({ ...textStyles.muted, margin: '0', fontSize: '12px', fontStyle: 'italic' })}>
        Das Unterlassen einer telefonischen Rückmeldung oder kurzfristige Absagen heben die Verbindlichkeit der Bestellung nicht auf.
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
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>💰 Unverbindliche Preisübersicht</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, fontWeight: 'bold' })}>
        Die nachfolgenden Preise sind unverbindliche Richtwerte. Die verbindlichen Konditionen werden Ihnen mit der Auftragsbestätigung nach Annahme durch einen Fahrer mitgeteilt.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph })}>
        Die Fahrleistung wird von selbstständigen Unternehmern erbracht. Die Fahrerexpress-Agentur koordiniert den Einsatz und erstellt nach Durchführung eine Rechnung gemäß Auftragsbestätigung. Für Sie als Auftraggeber entstehen keine zusätzlichen Vermittlungsgebühren über die in der Auftragsbestätigung vereinbarten Konditionen hinaus.
      </Text>

      <Hr style={{ borderTop: `1px solid ${colors.border}`, margin: '20px 0' }} />

      <Heading {...getTextProps({ ...textStyles.heading3, fontSize: '15px', marginBottom: '10px' }, 'small-heading')}>LKW CE Fahrer (Richtwert)</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 5px 0' })}>
        <strong>ab 349 € pro Tag</strong> (8 Stunden) | <strong>ab 30 € pro Überstunde</strong>
      </Text>
      <Text {...getTextProps({ ...textStyles.muted, marginBottom: '20px' })}>
        Gilt für: Fahrmischer, Fernverkehr, Nahverkehr, ADR, Container, Wechselbrücke,
        Kühltransport, Baustellenverkehr, Event- und Messe-Logistik u. v. m.
      </Text>

      <Heading {...getTextProps({ ...textStyles.heading3, fontSize: '15px', marginBottom: '10px' }, 'small-heading')}>Baumaschinenführer (Richtwert)</Heading>
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
        Alle Preise verstehen sich als unverbindliche Richtwerte netto zzgl. gesetzlicher MwSt., Fahrt- und ggf. Übernachtungskosten.
        Die verbindliche Abrechnung erfolgt nach tatsächlichem Einsatzumfang gemäß Auftragsbestätigung.
      </Text>
    </Section>

    <Section {...getBoxProps({ ...boxStyles.warningBox, backgroundColor: '#fffbeb', borderLeftColor: '#f59e0b' })}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: '#b45309' }, 'small-heading')}>Stornierungsregelung (gilt erst nach Auftragsbestätigung)</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 8px 0' })}>
        Die nachfolgenden Stornierungsbedingungen gelten erst, wenn ein verbindlicher Auftrag zustande gekommen ist (nach Annahme durch einen Fahrer und Versand der Auftragsbestätigung).
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0 0 8px 0' })}>
        Eine kostenfreie Stornierung bestätigter Aufträge ist bis 24 Stunden vor Einsatzbeginn möglich.
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
        <li>Erst nach Annahme durch den Fahrer erhalten Sie eine verbindliche Auftragsbestätigung mit den finalen Konditionen</li>
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
