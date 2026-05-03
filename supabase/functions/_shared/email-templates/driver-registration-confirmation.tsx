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
      vielen Dank für Ihre Registrierung als selbstständige/r Kraftfahrer/in bei der Fahrerexpress-Agentur.
      <strong> Ihre Registrierung war erfolgreich.</strong>
    </Text>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>✅ So geht es weiter</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Wir prüfen Ihr Profil und melden uns, sobald passende Einsätze verfügbar sind.
        Jeder Einsatz wird Ihnen vorab einzeln angeboten – Sie entscheiden frei, ob Sie ihn annehmen oder ablehnen.
      </Text>
    </Section>

    <Section {...getBoxProps(boxStyles.infoBox)}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>📌 Vergütung & Vermittlungsanteil</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Vergütung und Vermittlungsanteil ergeben sich jeweils aus dem konkreten Auftragsangebot,
        das Fahrerexpress Ihnen vor Einsatzbeginn mitteilt. Sie entscheiden als selbstständige/r
        Unternehmer/in frei, ob Sie das Angebot zu den genannten Konditionen annehmen.
      </Text>
    </Section>

    <Section {...getBoxProps({ ...boxStyles.highlightBox, backgroundColor: '#f0fdf4', borderColor: '#16a34a' })}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: '#16a34a' }, 'small-heading')}>📄 Rechtsgrundlage</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Für die Zusammenarbeit gelten unsere Vermittlungsbedingungen für Fahrer.
        Bitte lesen Sie diese vor Annahme des ersten Einsatzes.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        👉 <a href="https://www.kraftfahrer-mieten.com/fahrer-vermittlungsbedingungen" style={{ color: colors.primary, textDecoration: 'underline' }}>
          Vermittlungsbedingungen für Fahrer ansehen
        </a>
      </Text>
    </Section>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>📞 Kontakt</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
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
