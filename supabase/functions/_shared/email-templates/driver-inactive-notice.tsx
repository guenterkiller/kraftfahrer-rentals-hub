import { Text, Heading, Section } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, boxStyles, textStyles } from './base-email.tsx';

interface DriverInactiveNoticeProps {
  driverName: string;
  reason: string;
}

export const DriverInactiveNotice = ({
  driverName,
  reason,
}: DriverInactiveNoticeProps) => {
  return (
    <BaseEmail previewText="Ihr Fahrerstatus wurde vorübergehend auf nicht aktiv gesetzt">
      <Heading style={textStyles.h1}>
        Fahrerstatus vorübergehend auf nicht aktiv gesetzt
      </Heading>

      <Text style={textStyles.paragraph}>
        Hallo {driverName},
      </Text>

      <Text style={textStyles.paragraph}>
        wir haben Ihren Fahrerstatus bei Fahrerexpress vorübergehend auf nicht aktiv gesetzt.
      </Text>

      <Section style={boxStyles.info}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>Grund</Heading>
        <Text style={textStyles.paragraph}>{reason}</Text>
      </Section>

      <Text style={textStyles.paragraph}>
        Das bedeutet, dass Sie aktuell nicht für neue Auftragsangebote berücksichtigt werden.
      </Text>

      <Text style={textStyles.paragraph}>
        Wenn die fehlenden Punkte geklärt sind oder sich Ihre Einsatzbereitschaft geändert hat,
        können Sie sich gerne wieder bei uns melden. Nach Prüfung kann Ihr Profil wieder
        freigeschaltet werden.
      </Text>

      <Text style={textStyles.paragraph}>
        Telefon: +49 1577 1442285<br />
        E-Mail: info@kraftfahrer-mieten.com
      </Text>

      <Text style={textStyles.paragraph}>
        Mit freundlichen Grüßen<br /><br />
        Fahrerexpress-Agentur<br />
        Günter Killer
      </Text>
    </BaseEmail>
  );
};

export default DriverInactiveNotice;