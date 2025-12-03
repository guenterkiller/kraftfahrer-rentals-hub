import { Heading, Text, Section } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles, getBoxProps, getTextProps } from './base-email.tsx';

interface DriverRegistrationConfirmationProps {
  driverName: string;
}

export const DriverRegistrationConfirmation = ({
  driverName,
}: DriverRegistrationConfirmationProps) => (
  <BaseEmail previewText="Willkommen bei der Fahrerexpress-Agentur – Registrierung bestätigt">
    <Text {...getTextProps({ ...textStyles.paragraph, fontSize: '16px', marginBottom: '10px' })}>🚛 Willkommen bei der Fahrerexpress-Agentur</Text>
    
    <Heading {...getTextProps(textStyles.heading2, 'heading')}>
      Sehr geehrte/r {driverName},
    </Heading>

    <Text {...getTextProps(textStyles.paragraph)}>
      vielen Dank, dass Sie sich bei uns als selbstständiger Kraftfahrer mit eigenem Gewerbe registriert haben.
      <strong> Ihre Registrierung war erfolgreich!</strong>
    </Text>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>✅ Nächste Schritte</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Wir haben Ihre Angaben erhalten und melden uns telefonisch oder per E-Mail, sobald passende
        Fahraufträge verfügbar sind. Halten Sie Ihr Telefon bereit!
      </Text>
    </Section>

    <Section {...getBoxProps(boxStyles.infoBox)}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>💼 Vermittlungsmodell</Heading>
      
      <Text {...getTextProps({ ...textStyles.paragraph, fontWeight: 'bold' })}>
        Wie funktioniert unsere Vermittlung?
      </Text>
      <Text {...getTextProps(textStyles.paragraph)}>
        Fahrerexpress vermittelt selbstständige Fahrer an Auftraggeber in ganz Deutschland. 
        Wir bringen kompetente Partner zusammen.
      </Text>

      <Section {...getBoxProps(boxStyles.highlightBox)}>
        <Heading {...getTextProps({ ...textStyles.heading3, fontSize: '15px' }, 'small-heading')}>📋 Vermittlungsbedingungen & Provision</Heading>
        <Text {...getTextProps(textStyles.paragraph)}>
          Für jeden erfolgreichen Einsatz berechnen wir eine Vermittlungsgebühr (Provision), 
          die vom Fahrer getragen wird:
        </Text>

        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
          <li>
            <strong>LKW-Fahrer (Klasse CE):</strong> 15 % der Einsatzvergütung
          </li>
          <li>
            <strong>Baumaschinenführer:</strong> 20 % der Einsatzvergütung
          </li>
        </ul>

        <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '15px' })}>
          Die Provision wird nach Abschluss des Einsatzes automatisch bei Ihrer Abrechnung 
          an die Agentur berücksichtigt. Bei Nichteinsatz entstehen keine Kosten.
        </Text>

        <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
          <li>
            <strong>Wann entstehen Kosten?</strong> Ausschließlich bei tatsächlichem Einsatz.
          </li>
          <li>
            <strong>Gibt es eine Mindestlaufzeit?</strong> Nein. Sie können Ihre Teilnahme jederzeit
            beenden. Es entstehen keine Fixkosten oder Verpflichtungen.
          </li>
        </ul>
      </Section>
    </Section>

    <Section {...getBoxProps({ ...boxStyles.infoBox, backgroundColor: '#fef3f2' })}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>📝 Ihre Daten ändern</Heading>
      <Text {...getTextProps(textStyles.paragraph)}>
        Falls Sie Ihre Angaben korrigieren oder ergänzen möchten, schreiben Sie uns bitte an:
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        📧 <a href="mailto:info@kraftfahrer-mieten.com" style={{ color: colors.primary, textDecoration: 'none' }}>
          info@kraftfahrer-mieten.com
        </a>
        <br />
        unter Angabe Ihres Namens und Ihrer Telefonnummer.
      </Text>
    </Section>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>📞 Kontakt</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Für Rückfragen zur Abrechnung oder allgemeine Fragen stehen wir Ihnen jederzeit zur Verfügung:
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        📧 info@kraftfahrer-mieten.com<br />
        📱 01577 1442285
      </Text>
    </Section>

    <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '30px', marginBottom: '0' })}>
      Mit freundlichen Grüßen<br />
      <strong>Ihr Fahrerexpress-Team</strong>
    </Text>
  </BaseEmail>
);

export default DriverRegistrationConfirmation;
