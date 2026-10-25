import { Heading, Text, Section } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles, getBoxProps, getTextProps } from './base-email.tsx';

interface DriverRegistrationConfirmationProps {
  driverName: string;
  contractUrl?: string;
}

export const DriverRegistrationConfirmation = ({
  driverName,
  contractUrl,
}: DriverRegistrationConfirmationProps) => (
  <BaseEmail previewText="Willkommen bei der Fahrerexpress-Agentur – Registrierung bestätigt">
    <Heading {...getTextProps(textStyles.heading2, 'heading')}>
      Hallo {driverName},
    </Heading>

    <Text {...getTextProps(textStyles.paragraph)}>
      willkommen bei der Fahrerexpress-Agentur – schön, dass Sie dabei sind!
      Ihre Registrierung als selbstständige/r Fahrer/in ist bei uns eingegangen.
    </Text>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>So geht es weiter</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Nach Prüfung und Freischaltung Ihres Profils können Sie passende Auftragsangebote per
        E-Mail erhalten. In diesen E-Mails finden Sie die wichtigsten Einsatzdaten wie Einsatzort,
        Zeitraum und Vergütung. Sie entscheiden dann frei, ob Sie ein Angebot annehmen oder
        ablehnen möchten.
      </Text>
    </Section>

    {contractUrl ? (
      <Section {...getBoxProps(boxStyles.highlightBox)}>
        <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>Ihr persönlicher Vermittlungsvertrag</Heading>
        <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px' })}>
          Bitte lesen Sie den vollständigen Vermittlungsvertrag auf Ihrer persönlichen Seite und nehmen Sie ihn dort an oder lehnen Sie ihn ab. Der Link ist 14 Tage gültig. Ein Klick in dieser E-Mail allein entscheidet nichts.
        </Text>
        <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
          <a href={contractUrl} style={{ display: 'inline-block', padding: '10px 16px', backgroundColor: '#1d4ed8', color: '#ffffff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600, }}>Vermittlungsvertrag prüfen</a>
        </Text>
      </Section>
    ) : null}
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
