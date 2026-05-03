import { Text, Heading, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, boxStyles, textStyles } from './base-email.tsx';

interface DriverBlockNoticeProps {
  driverName: string;
  reason: string;
}

export const DriverBlockNotice = ({
  driverName,
  reason,
}: DriverBlockNoticeProps) => {
  return (
    <BaseEmail previewText="Ihr Fahrerprofil wurde vorübergehend deaktiviert">
      <Heading style={textStyles.h1}>
        Ihr Fahrerprofil wurde vorübergehend deaktiviert
      </Heading>

      <Text style={textStyles.paragraph}>
        Sehr geehrte/r {driverName},
      </Text>

      <Text style={textStyles.paragraph}>
        Ihr Fahrerprofil bei der Fahrerexpress-Agentur wurde vorübergehend deaktiviert.
      </Text>

      <Section style={boxStyles.info}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>Grund</Heading>
        <Text style={textStyles.paragraph}>{reason}</Text>
      </Section>

      <Text style={textStyles.paragraph}>
        Während der Deaktivierung erhalten Sie keine neuen Auftragsangebote über Fahrerexpress.
        Bereits abgestimmte oder laufende Einsätze bleiben davon unberührt, sofern nichts anderes
        vereinbart wurde.
      </Text>

      <Text style={textStyles.paragraph}>
        Wenn Sie Ihr Profil wieder aktivieren möchten oder Fragen zur Deaktivierung haben, melden
        Sie sich bitte bei uns.
      </Text>

      <Text style={textStyles.paragraph}>
        Telefon: +49 1577 1442285<br />
        E-Mail: info@kraftfahrer-mieten.com
      </Text>

      <Text style={textStyles.paragraph}>
        Mit freundlichen Grüßen<br /><br />
        Fahrerexpress-Agentur<br />
        Günter Killer<br />
        Vermittlung gewerblicher Fahrer
      </Text>
    </BaseEmail>
  );
};

export default DriverBlockNotice;
