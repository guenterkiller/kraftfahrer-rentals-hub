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
    <Heading {...getTextProps(textStyles.heading2, 'heading')}>
      Hallo {driverName},
    </Heading>

    <Text {...getTextProps(textStyles.paragraph)}>
      willkommen bei der Fahrerexpress-Agentur – schön, dass Sie dabei sind!
      Ihre Registrierung als selbstständige/r Kraftfahrer/in ist bei uns eingegangen.
    </Text>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>✅ So geht es weiter</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Wir prüfen Ihr Profil zeitnah. Sobald ein passender Einsatz vorliegt, erhalten Sie von uns
        ein konkretes Auftragsangebot mit allen wichtigen Informationen (Einsatzort, Zeitraum,
        Vergütung). Sie entscheiden frei, ob Sie das Angebot annehmen.
      </Text>
    </Section>

    <Section {...getBoxProps(boxStyles.infoBox)}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>💶 Vergütung & Abrechnung – kurz erklärt</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Bei <strong>Standardaufträgen</strong> beträgt der Vermittlungsanteil in der Regel
        <strong> 20 % </strong> der vereinbarten Netto-Arbeitsvergütung.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px', marginBottom: '0' })}>
        Bei <strong>Sonder-, Projekt-, Pauschal- oder kurzfristigen Einsätzen</strong> kann der
        Vermittlungsanteil <strong>bis zu 25 %</strong> betragen. Der konkrete Anteil steht
        immer im jeweiligen Auftragsangebot – Sie wissen es also vor Einsatzbeginn.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '12px', marginBottom: '0' })}>
        <strong>Ihre Rechnung an Fahrerexpress</strong> stellen Sie bereits nach Abzug des
        Vermittlungsanteils – nichts wird Ihnen nachträglich einbehalten.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px', marginBottom: '0' })}>
        <strong>Fahrtkosten, Übernachtung, Maut, Parkgebühren und freigegebene Auslagen</strong>
        {' '}werden <strong>nicht</strong> vom Vermittlungsanteil gekürzt und separat behandelt.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '12px', marginBottom: '0' })}>
        Bitte rechnen Sie <strong>nicht direkt mit dem Auftraggeber</strong> ab und treffen Sie
        keine eigenen Preisvereinbarungen vor Ort – die gesamte Abrechnung läuft über Fahrerexpress.
      </Text>
    </Section>

    <Section {...getBoxProps({ ...boxStyles.highlightBox, backgroundColor: '#f0fdf4', borderColor: '#16a34a' })}>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        📄 Die vollständigen Regelungen finden Sie in den{' '}
        <a href="https://www.kraftfahrer-mieten.com/fahrer-vermittlungsbedingungen" style={{ color: colors.primary, textDecoration: 'underline', fontWeight: 'bold' }}>
          Fahrer-Vermittlungsbedingungen
        </a>. Bitte vor dem ersten Einsatz einmal in Ruhe durchlesen.
      </Text>
    </Section>

    <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '20px' })}>
      Bei Fragen erreichen Sie uns jederzeit unter{' '}
      <a href="mailto:info@kraftfahrer-mieten.com" style={{ color: colors.primary }}>info@kraftfahrer-mieten.com</a>
      {' '}oder telefonisch unter <strong>01577 1442285</strong>.
    </Text>

    <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '20px', marginBottom: '0' })}>
      Wir freuen uns auf die Zusammenarbeit!<br />
      <strong>Ihr Fahrerexpress-Team</strong>
    </Text>
  </BaseEmail>
);

export default DriverRegistrationConfirmation;
