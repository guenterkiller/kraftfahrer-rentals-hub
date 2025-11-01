import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface JobNotificationEmailProps {
  driverName: string;
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
  customerName,
  company,
  einsatzort,
  zeitraum,
  fahrzeugtyp,
  fuehrerscheinklasse,
  nachricht,
  besonderheiten,
}: JobNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Neuer Auftrag verfügbar: {fahrzeugtyp} in {einsatzort}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🚛 Neuer Auftrag verfügbar</Heading>
        
        <Text style={text}>
          Hallo {driverName},
        </Text>
        
        <Text style={text}>
          ein neuer Auftrag ist verfügbar, der zu Ihrem Profil passen könnte:
        </Text>

        <Section style={infoBox}>
          <Text style={infoTitle}>Auftragsdetails</Text>
          
          <Text style={infoRow}>
            <strong>Auftraggeber:</strong> {customerName}
            {company && ` (${company})`}
          </Text>
          
          <Text style={infoRow}>
            <strong>Einsatzort:</strong> {einsatzort}
          </Text>
          
          <Text style={infoRow}>
            <strong>Zeitraum:</strong> {zeitraum}
          </Text>
          
          <Text style={infoRow}>
            <strong>Fahrzeugtyp:</strong> {fahrzeugtyp}
          </Text>
          
          <Text style={infoRow}>
            <strong>Führerscheinklasse:</strong> {fuehrerscheinklasse}
          </Text>
          
          {besonderheiten && (
            <Text style={infoRow}>
              <strong>Besonderheiten:</strong> {besonderheiten}
            </Text>
          )}
          
          <Hr style={hr} />
          
          <Text style={infoRow}>
            <strong>Nachricht:</strong><br />
            {nachricht}
          </Text>
        </Section>

        <Text style={text}>
          <strong>Interessiert?</strong> Melden Sie sich bei uns telefonisch oder per E-Mail, 
          damit wir die Details mit Ihnen besprechen können.
        </Text>

        <Section style={contactBox}>
          <Text style={contactText}>
            📞 <strong>Telefon:</strong> +49 (0) 123 456789<br />
            ✉️ <strong>E-Mail:</strong> info@kraftfahrer-mieten.com
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Diese E-Mail wurde automatisch versendet, weil Sie in unserem Fahrerpool registriert sind.
          <br />
          <br />
          Kraftfahrer-Mieten.com | Ihr Partner für professionelle Fahrergestellung
        </Text>
      </Container>
    </Body>
  </Html>
);

export default JobNotificationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
};

const infoBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '24px',
};

const infoTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px 0',
};

const infoRow = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#333',
  margin: '8px 0',
};

const contactBox = {
  backgroundColor: '#e8f4f8',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '20px',
  textAlign: 'center' as const,
};

const contactText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#0066cc',
  margin: '0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '32px',
};
