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
        <Heading {...getTextProps({ ...textStyles.heading3, fontSize: '15px' }, 'small-heading')}>📋 Vermittlungsmodell & Vergütung</Heading>
        <Text {...getTextProps(textStyles.paragraph)}>
          Sie arbeiten als selbstständiger Subunternehmer für die Fahrerexpress-Agentur.
          Der Auftraggeber erhält die Rechnung von der Fahrerexpress-Agentur.
          Sie stellen uns nach Durchführung eine Rechnung abzüglich Vermittlungsgebühr.
        </Text>

        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
          <li>
            <strong>LKW-Fahrer (Klasse CE):</strong> 15 % Vermittlungsgebühr
          </li>
          <li>
            <strong>Baumaschinenführer / Geräteführer:</strong> 20 % Vermittlungsgebühr
          </li>
        </ul>

        <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '15px' })}>
          Die Gebühr fällt ausschließlich bei tatsächlich ausgeführten Einsätzen an.
          Sie entscheiden vor jedem Einsatz frei, ob Sie annehmen oder ablehnen.
        </Text>
      </Section>

      <Section {...getBoxProps(boxStyles.infoBox)}>
        <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>📝 Pflichten als Subunternehmer</Heading>
        <Text {...getTextProps(textStyles.paragraph)}>
          Mit Annahme eines Einsatzes übernehmen Sie folgende verbindliche Pflichten:
        </Text>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
          <li>pünktliches Erscheinen am Einsatzort</li>
          <li>ordnungsgemäße Durchführung des Einsatzes</li>
          <li>sofortige Meldung bei Problemen</li>
          <li>richtige und vollständige Angaben zu Qualifikationen</li>
          <li>pfleglicher Umgang mit Fahrzeugen, Maschinen und Kundenmaterial</li>
        </ul>
      </Section>

      <Section {...getBoxProps({ ...boxStyles.infoBox, backgroundColor: '#fef3f2' })}>
        <Heading {...getTextProps({ ...textStyles.heading3, color: '#dc2626' }, 'small-heading')}>🚫 Verbote</Heading>
        <Text {...getTextProps(textStyles.paragraph)}>
          Folgende Handlungen sind nicht zulässig:
        </Text>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
          <li>Weitergabe des Einsatzes an andere Fahrer</li>
          <li>Einsatz durch eine andere Person ohne Zustimmung</li>
          <li>Direktabsprachen oder Preisvereinbarungen mit Auftraggebern</li>
          <li>Folgeaufträge am Auftraggeber vorbei</li>
          <li>Weitergabe interner Einsatzdaten an Dritte</li>
          <li>eigenständige Änderungen zu Zeiten, Aufgaben oder Einsatzort</li>
        </ul>
      </Section>

      <Section {...getBoxProps({ ...boxStyles.infoBox, backgroundColor: '#fef9c3' })}>
        <Heading {...getTextProps({ ...textStyles.heading3, color: '#854d0e' }, 'small-heading')}>⚠️ Nichterscheinen & Leistungsstörungen</Heading>
        <Text {...getTextProps(textStyles.paragraph)}>
          Wenn ein Fahrer einen angenommenen Einsatz nicht antritt oder abbricht, entstehen der Fahrerexpress-Agentur Schäden gegenüber dem Auftraggeber.
          In diesem Fall haftet der Fahrer im Innenverhältnis für:
        </Text>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
          <li>Ersatzfahrer-Kosten</li>
          <li>Vertragsstrafen des Auftraggebers</li>
          <li>Standgelder, Ausfallkosten oder Fehlzeiten</li>
          <li>alle weiteren dadurch entstehenden Schäden</li>
        </ul>
        <Text {...getTextProps({ ...textStyles.paragraph, fontWeight: 'bold', marginTop: '10px' })}>
          Die Fahrerexpress-Agentur kann diese Schäden vollständig regressieren.
        </Text>
      </Section>

      <Section {...getBoxProps({ ...boxStyles.infoBox, backgroundColor: '#fee2e2' })}>
        <Heading {...getTextProps({ ...textStyles.heading3, color: '#991b1b' }, 'small-heading')}>⛔ Konsequenzen bei Regelverstößen</Heading>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
          <li>sofortige Sperrung des Fahrerzugangs</li>
          <li>keine weiteren Einsatzangebote</li>
          <li>interne Schadensregulierung</li>
          <li>dauerhafte Beendigung der Zusammenarbeit</li>
        </ul>
      </Section>

      <Section {...getBoxProps(boxStyles.highlightBox)}>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
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
