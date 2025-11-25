import React from 'npm:react@18.3.1';
import { BaseEmail } from './base-email.tsx';
import { Body, Container, Heading, Text, Section, Hr } from 'npm:@react-email/components@0.0.22';

interface AdminJobAcceptanceNotificationProps {
  driverName: string;
  driverEmail: string;
  jobDetails: {
    customerName: string;
    einsatzort: string;
    zeitraum: string;
    fahrzeugtyp: string;
    nachricht: string;
  };
  billingModel: string;
  acceptedAt: string;
}

export const AdminJobAcceptanceNotification = ({
  driverName,
  driverEmail,
  jobDetails,
  billingModel,
  acceptedAt,
}: AdminJobAcceptanceNotificationProps) => {
  const billingDisplay = billingModel === 'agency' 
    ? 'Agenturabrechnung - Subunternehmer-Modell'
    : 'Vermittlung - Direktabrechnung';

  return (
    <BaseEmail previewText={`Auftragsannahme: ${driverName} → ${jobDetails.customerName}`}>
      <Container style={container}>
        <Heading style={h1}>✅ Auftragsannahme bestätigt</Heading>
        
        <Text style={text}>
          Ein Fahrer hat einen Auftrag angenommen.
        </Text>

        <Section style={infoBox}>
          <Text style={label}>Fahrer:</Text>
          <Text style={value}>{driverName}</Text>
          
          <Text style={label}>E-Mail:</Text>
          <Text style={value}>{driverEmail}</Text>
          
          <Text style={label}>Angenommen am:</Text>
          <Text style={value}>{acceptedAt}</Text>
          
          <Text style={label}>Abrechnungsmodell:</Text>
          <Text style={value}>{billingDisplay}</Text>
        </Section>

        <Hr style={hr} />

        <Section style={jobBox}>
          <Heading style={h3}>📋 Auftragsdetails</Heading>
          
          <Text style={label}>Kunde:</Text>
          <Text style={value}>{jobDetails.customerName}</Text>
          
          <Text style={label}>Einsatzort:</Text>
          <Text style={value}>{jobDetails.einsatzort}</Text>
          
          <Text style={label}>Zeitraum:</Text>
          <Text style={value}>{jobDetails.zeitraum}</Text>
          
          <Text style={label}>Fahrzeugtyp:</Text>
          <Text style={value}>{jobDetails.fahrzeugtyp}</Text>
          
          <Text style={label}>Nachricht:</Text>
          <Text style={value}>{jobDetails.nachricht}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          Diese Benachrichtigung wurde automatisch vom fahrerexpress Admin-System generiert.
        </Text>
      </Container>
    </BaseEmail>
  );
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
};

const h3 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const infoBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const jobBox = {
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const label = {
  color: '#666',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '12px 0 4px',
};

const value = {
  color: '#333',
  fontSize: '16px',
  margin: '0 0 16px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '24px 0 0',
};
