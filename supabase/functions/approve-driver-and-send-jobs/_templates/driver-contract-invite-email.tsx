import { Heading, Text, Section } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles, getBoxProps, getTextProps } from '../../_shared/email-templates/base-email.tsx';

interface DriverContractInviteEmailProps {
  driverName: string;
  contractUrl: string;
  expiresAt: string; // ISO-Datum des Link-Ablaufs
}

/** Einmalige Vertrags-E-Mail nach administrativer Freischaltung. */
export const DriverContractInviteEmail = ({
  driverName,
  contractUrl,
  expiresAt,
}: DriverContractInviteEmailProps) => (
  <BaseEmail previewText="Ihr persönlicher Vermittlungsvertrag – bitte prüfen und bestätigen">
    <Heading {...getTextProps(textStyles.heading2, 'heading')}>
      Hallo {driverName},
    </Heading>

    <Text {...getTextProps(textStyles.paragraph)}>
      Ihre Unterlagen wurden geprüft und Ihr Profil wurde administrativ freigeschaltet.
      Bevor Sie Auftragsangebote erhalten können, bitten wir Sie, den Vermittlungsvertrag
      zu lesen und zu bestätigen.
    </Text>

    <Section {...getBoxProps(boxStyles.highlightBox)}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>Ihr persönlicher Vermittlungsvertrag</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px' })}>
        Bitte lesen Sie den vollständigen Vermittlungsvertrag auf Ihrer persönlichen Seite
        und nehmen Sie ihn dort an oder lehnen Sie ihn ab. Der Link ist bis zum{' '}
        {new Date(expiresAt).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' })} gültig.
        Ein Klick in dieser E-Mail allein entscheidet nichts.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        <a href={contractUrl} style={{ display: 'inline-block', padding: '10px 16px', backgroundColor: '#1d4ed8', color: '#ffffff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>Vermittlungsvertrag prüfen</a>
      </Text>
    </Section>

    <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '20px' })}>
      Erst nach Ihrer Annahme des Vertrags können wir Ihnen passende Auftragsangebote zusenden.
    </Text>

    <Text {...getTextProps(textStyles.paragraph)}>
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

export default DriverContractInviteEmail;
