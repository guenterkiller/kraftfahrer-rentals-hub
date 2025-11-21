import { Heading, Text, Section } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles } from './base-email.tsx';

interface DriverRegistrationConfirmationProps {
  driverName: string;
}

export const DriverRegistrationConfirmation = ({
  driverName,
}: DriverRegistrationConfirmationProps) => (
  <BaseEmail previewText="Willkommen bei der Fahrerexpress-Agentur – Registrierung bestätigt">
    <Text style={{ ...textStyles.paragraph, fontSize: '16px', marginBottom: '10px' }}>🚛 Willkommen bei der Fahrerexpress-Agentur</Text>
    
    <Heading style={textStyles.heading2}>
      Sehr geehrte/r {driverName},
    </Heading>

    <Text style={textStyles.paragraph}>
      vielen Dank, dass Sie sich bei uns als selbstständiger Kraftfahrer mit eigenem Gewerbe registriert haben.
      <strong> Ihre Registrierung war erfolgreich!</strong>
    </Text>

    <Section style={boxStyles.successBox}>
      <Heading style={{ ...textStyles.heading3, color: colors.success }}>✅ Nächste Schritte</Heading>
      <Text style={{ ...textStyles.paragraph, margin: '0' }}>
        Wir haben Ihre Angaben erhalten und melden uns telefonisch oder per E-Mail, sobald passende
        Fahraufträge verfügbar sind. Halten Sie Ihr Telefon bereit!
      </Text>
    </Section>

    <Section style={boxStyles.infoBox}>
      <Heading style={textStyles.heading3}>💼 Vermittlung & Provision</Heading>
      
      <Text style={{ ...textStyles.paragraph, fontWeight: 'bold' }}>
        Wie funktioniert unsere Vermittlung?
      </Text>
      <Text style={textStyles.paragraph}>
        Wenn Sie sich über unsere Seite als selbstständiger Fahrer eintragen, vermitteln wir Sie an
        Auftraggeber in ganz Deutschland.
      </Text>

      <Section style={boxStyles.highlightBox}>
        <Heading style={{ ...textStyles.heading3, fontSize: '15px' }}>💰 Vermittlungskosten für Fahrer</Heading>
        <Text style={textStyles.paragraph}>
          Für die erfolgreiche Vermittlung eines Einsatzes berechnen wir nur dem vermittelten Fahrer eine
          Provision in Höhe von <strong>15 % des Nettohonorars</strong>. Die Vermittlung ist für Auftraggeber
          vollständig kostenlos.
        </Text>

        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
          <li>
            <strong>Wann wird die Provision fällig?</strong> Die Provision wird ausschließlich bei
            tatsächlichem Einsatz fällig und kann entweder per Einbehalt oder separater Rechnung
            abgerechnet werden.
          </li>
          <li>
            <strong>Wie läuft die Abrechnung?</strong> Die Provision wird nach Einsatzabschluss per
            Rechnung gestellt – entweder pro Auftrag oder gesammelt am Monatsende.
          </li>
          <li>
            <strong>Gibt es eine Mindestlaufzeit?</strong> Nein. Sie können Ihre Teilnahme jederzeit
            beenden. Es entstehen keine Fixkosten oder Verpflichtungen.
          </li>
        </ul>
      </Section>

      <Heading style={{ ...textStyles.heading3, fontSize: '14px', marginTop: '20px' }}>
        ✅ Was ist NICHT provisionspflichtig?
      </Heading>
      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
        <li>Direktaufträge außerhalb unserer Vermittlung</li>
        <li>Einsätze ohne vorherige Abstimmung mit Fahrerexpress</li>
      </ul>
    </Section>

    <Section style={{ ...boxStyles.infoBox, backgroundColor: '#fef3f2' }}>
      <Heading style={textStyles.heading3}>📝 Ihre Daten ändern</Heading>
      <Text style={textStyles.paragraph}>
        Falls Sie Ihre Angaben korrigieren oder ergänzen möchten, schreiben Sie uns bitte an:
      </Text>
      <Text style={{ ...textStyles.paragraph, margin: '0' }}>
        📧 <a href="mailto:info@kraftfahrer-mieten.com" style={{ color: colors.primary, textDecoration: 'none' }}>
          info@kraftfahrer-mieten.com
        </a>
        <br />
        unter Angabe Ihres Namens und Ihrer Telefonnummer.
      </Text>
    </Section>

    <Section style={boxStyles.successBox}>
      <Heading style={{ ...textStyles.heading3, color: colors.success }}>📞 Kontakt</Heading>
      <Text style={{ ...textStyles.paragraph, margin: '0' }}>
        Für Rückfragen zur Abrechnung oder allgemeine Fragen stehen wir Ihnen jederzeit zur Verfügung:
      </Text>
      <Text style={{ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' }}>
        📧 info@kraftfahrer-mieten.com<br />
        📱 01577 1442285
      </Text>
    </Section>

    <Text style={{ ...textStyles.paragraph, marginTop: '30px', marginBottom: '0' }}>
      Mit freundlichen Grüßen<br />
      <strong>Ihr Fahrerexpress-Team</strong>
    </Text>
  </BaseEmail>
);

export default DriverRegistrationConfirmation;
