import React from 'npm:react@18.3.1';
import { BaseEmail } from '../../_shared/email-templates/base-email.tsx';
import { Body, Container, Heading, Text, Section, Hr } from 'npm:@react-email/components@0.0.22';

interface AdminDriverApprovalNotificationProps {
  driverName: string;
  driverEmail: string;
  driverId: string;
  approvedAt: string;
  jobsSent: number;
}

export const AdminDriverApprovalNotification = ({
  driverName,
  driverEmail,
  driverId,
  approvedAt,
  jobsSent,
}: AdminDriverApprovalNotificationProps) => (
  <BaseEmail previewText={`Fahrer freigeschaltet: ${driverName}`}>
    <Container style={container}>
      <Heading style={h1}>✅ Fahrer freigeschaltet</Heading>
      
      <Text style={text}>
        Ein neuer Fahrer wurde erfolgreich freigeschaltet und hat die Willkommens-E-Mail mit aktuellen Aufträgen erhalten.
      </Text>

      <Section style={infoBox}>
        <Text style={label}>Fahrer:</Text>
        <Text style={value}>{driverName}</Text>
        
        <Text style={label}>E-Mail:</Text>
        <Text style={value}>{driverEmail}</Text>
        
        <Text style={label}>Fahrer-ID:</Text>
        <Text style={value}>{driverId}</Text>
        
        <Text style={label}>Freigeschaltet am:</Text>
        <Text style={value}>{approvedAt}</Text>
        
        <Text style={label}>Gesendete Aufträge:</Text>
        <Text style={value}>{jobsSent} aktuelle Aufträge</Text>
      </Section>

      <Hr style={hr} />

      <Text style={footer}>
        Diese Benachrichtigung wurde automatisch vom fahrerexpress Admin-System generiert.
      </Text>
    </Container>
  </BaseEmail>
);

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

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const infoBox = {
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
