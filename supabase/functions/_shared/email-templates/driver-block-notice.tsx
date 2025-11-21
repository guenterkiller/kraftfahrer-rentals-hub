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
    <BaseEmail previewText="Wichtig: Sperrung Ihres Fahrerprofils bei fahrerexpress">
      <Heading style={{ ...textStyles.h1, color: '#d32f2f' }}>
        ⚠️ Sperrung Ihres Fahrerprofils
      </Heading>
      
      <Text style={textStyles.paragraph}>
        Sehr geehrte/r {driverName},
      </Text>
      
      <Text style={textStyles.paragraph}>
        Ihr Fahrerprofil bei der Fahrerexpress-Agentur wurde <strong>vorübergehend gesperrt</strong>.
      </Text>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* GRUND Section */}
      <Section style={boxStyles.warning}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          📋 Grund für die Sperrung
        </Heading>
        <Text style={textStyles.paragraph}>
          {reason}
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* HINWEISE Section */}
      <Section style={boxStyles.info}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          ℹ️ Was bedeutet das?
        </Heading>
        <Text style={textStyles.paragraph}>
          Während der Sperrung:
        </Text>
        <Text style={textStyles.paragraph}>
          • Sie erhalten keine neuen Auftragsangebote<br />
          • Ihr Profil ist für neue Vermittlungen inaktiv<br />
          • Laufende Einsätze können normal abgeschlossen werden
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* IHRE RECHTE Section */}
      <Section style={boxStyles.highlight}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          ⚖️ Ihre Rechte
        </Heading>
        <Text style={textStyles.paragraph}>
          Sie haben das Recht:
        </Text>
        <Text style={textStyles.paragraph}>
          • Stellungnahme abzugeben und Sachverhalte zu klären<br />
          • Entsperrung zu beantragen, wenn die Gründe nicht mehr vorliegen<br />
          • Bei Uneinigkeit rechtliche Schritte einzuleiten
        </Text>
        <Text style={{ ...textStyles.paragraph, fontWeight: 'bold' }}>
          📞 Kontakt aufnehmen:
        </Text>
        <Text style={textStyles.paragraph}>
          Telefon: +49-1577-1442285<br />
          E-Mail: info@kraftfahrer-mieten.com
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      <Text style={textStyles.muted}>
        Diese E-Mail dient ausschließlich Ihrer Information. Bei Fragen oder zur Klärung des Sachverhalts 
        stehen wir Ihnen gerne zur Verfügung.
      </Text>
    </BaseEmail>
  );
};

export default DriverBlockNotice;
