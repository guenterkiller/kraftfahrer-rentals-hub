import { Text, Heading, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, boxStyles, textStyles, colors } from '../../_shared/email-templates/base-email.tsx';

interface JobNotificationEmailProps {
  driverName: string;
  driverId: string;
  jobId: string;
  customerName: string;
  company?: string;
  einsatzort: string;
  zeitraum: string;
  fahrzeugtyp: string;
  fuehrerscheinklasse: string;
  nachricht: string;
  besonderheiten?: string;
}

export const JobNotificationEmail = ({
  driverName,
  driverId,
  jobId,
  customerName,
  company,
  einsatzort,
  zeitraum,
  fahrzeugtyp,
  fuehrerscheinklasse,
  nachricht,
  besonderheiten,
}: JobNotificationEmailProps) => {
  return (
    <BaseEmail previewText={`Neuer Auftrag verfügbar: ${fahrzeugtyp} in ${einsatzort}`}>
      <Heading style={textStyles.h1}>Neuer Auftrag verfügbar 🚛</Heading>
      
      <Text style={textStyles.paragraph}>
        Hallo {driverName},
      </Text>
      
      <Text style={textStyles.paragraph}>
        ein neuer Auftrag ist verfügbar, der zu Ihrem Profil passen könnte:
      </Text>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* AUFTRAGGEBER Section */}
      <Section style={boxStyles.highlight}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          👤 Auftraggeber
        </Heading>
        <Text style={textStyles.paragraph}>
          <strong>Unternehmen/Name:</strong> {company || customerName}
        </Text>
        {company && customerName && (
          <Text style={textStyles.paragraph}>
            <strong>Ansprechpartner:</strong> {customerName}
          </Text>
        )}
      </Section>
      
      {/* EINSATZ Section */}
      <Section style={boxStyles.info}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          🚛 Einsatzdetails
        </Heading>
        <Text style={textStyles.paragraph}>
          <strong>Datum/Zeitraum:</strong> {zeitraum}
        </Text>
        <Text style={textStyles.paragraph}>
          <strong>Einsatzort:</strong> {einsatzort}
        </Text>
        <Text style={textStyles.paragraph}>
          <strong>Fahrzeug/Typ:</strong> {fahrzeugtyp}
        </Text>
        <Text style={textStyles.paragraph}>
          <strong>Führerscheinklasse:</strong> {fuehrerscheinklasse}
        </Text>
        {besonderheiten && (
          <Text style={textStyles.paragraph}>
            <strong>Besonderheiten:</strong> {besonderheiten}
          </Text>
        )}
      </Section>
      
      {/* NACHRICHT Section */}
      {nachricht && (
        <Section style={boxStyles.info}>
          <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
            💬 Nachricht vom Auftraggeber
          </Heading>
          <Text style={textStyles.paragraph}>{nachricht}</Text>
        </Section>
      )}

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* Antwort-Hinweis */}
      <Section style={{ 
        textAlign: 'center' as const, 
        margin: '30px 0',
        padding: '24px',
        backgroundColor: '#f0fdf4',
        border: '2px solid #16a34a',
        borderRadius: '12px'
      }}>
        <Heading style={{ ...textStyles.h3, marginTop: 0, color: '#166534' }}>
          📱 Interesse? Bitte melden Sie sich!
        </Heading>
        <Text style={{ ...textStyles.paragraph, fontSize: '16px', fontWeight: 'bold', color: '#166534' }}>
          Rufen Sie uns an oder schreiben Sie per SMS/WhatsApp:
        </Text>
        <Text style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#16a34a',
          margin: '16px 0'
        }}>
          📞 +49-1577-1442285
        </Text>
        <Text style={{ ...textStyles.muted, fontSize: '14px' }}>
          Nennen Sie kurz Ihren Namen und dass Sie den Auftrag in <strong>{einsatzort}</strong> annehmen oder ablehnen möchten.
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* Vermittlungsgebühr Info */}
      <Section style={boxStyles.warning}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          📋 Wichtig: Vermittlungsgebühr
        </Heading>
        <Text style={textStyles.paragraph}>
          Die Vermittlungsgebühr beträgt bei jedem Einsatz:
        </Text>
        <Text style={textStyles.paragraph}>
          • <strong>15 % für LKW CE Fahrer</strong><br />
          • <strong>20 % für Baumaschinenführer</strong>
        </Text>
        <Text style={textStyles.paragraph}>
          Die Vermittlungsgebühr wird automatisch von Ihrem Rechnungsbetrag abgezogen.
          Sie stellen Ihre Rechnung an Fahrerexpress über den vollen Tagespreis laut Website; 
          die Provision wird intern einbehalten.
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* Contact Info */}
      <Section style={boxStyles.highlight}>
        <Text style={textStyles.paragraph}>
          <strong>Bei Fragen erreichen Sie uns unter:</strong>
        </Text>
        <Text style={textStyles.paragraph}>
          📞 <strong>Telefon:</strong> +49-1577-1442285<br />
          ✉️ <strong>E-Mail:</strong> info@kraftfahrer-mieten.com
        </Text>
      </Section>
    </BaseEmail>
  );
};

export default JobNotificationEmail;
