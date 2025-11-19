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
  Button,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

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
  acceptUrl: string;
  declineUrl: string;
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
  acceptUrl,
  declineUrl,
}: JobNotificationEmailProps) => {

  return (
    <Html>
      <Head />
      <Preview>Neuer Auftrag verfügbar: {fahrzeugtyp} in {einsatzort}</Preview>
      <Body style={main}>
        <Container style={container}>
          
          {/* Blue Header */}
          <div style={header}>
            <Heading style={headerTitle}>NEUER AUFTRAG VERFÜGBAR</Heading>
            <Text style={headerSubtitle}>Fahrerexpress | kraftfahrer-mieten.com</Text>
          </div>
          
          {/* Content */}
          <div style={content}>
            <Text style={greeting}>Hallo {driverName},</Text>
            <Text style={introText}>
              ein neuer Auftrag ist verfügbar, der zu Ihrem Profil passen könnte:
            </Text>
            
            {/* AUFTRAGGEBER Section */}
            <div style={sectionBox}>
              <Heading style={sectionTitle}>AUFTRAGGEBER</Heading>
              <div style={sectionContent}>
                <Text style={detailRow}>
                  <strong>• Unternehmen/Name:</strong> {company || customerName}
                </Text>
                {company && customerName && (
                  <Text style={detailRow}>
                    <strong>• Ansprechpartner:</strong> {customerName}
                  </Text>
                )}
              </div>
            </div>
            
            {/* EINSATZ Section */}
            <div style={sectionBox}>
              <Heading style={sectionTitle}>EINSATZ</Heading>
              <div style={sectionContent}>
                <Text style={detailRow}>
                  <strong>• Datum/Zeitraum:</strong> {zeitraum}
                </Text>
                <Text style={detailRow}>
                  <strong>• Einsatzort:</strong> {einsatzort}
                </Text>
                <Text style={detailRow}>
                  <strong>• Fahrzeug/Typ:</strong> {fahrzeugtyp}
                </Text>
                <Text style={detailRow}>
                  <strong>• Führerscheinklasse:</strong> {fuehrerscheinklasse}
                </Text>
                {besonderheiten && (
                  <Text style={detailRow}>
                    <strong>• Besonderheiten:</strong> {besonderheiten}
                  </Text>
                )}
              </div>
            </div>
            
            {/* NACHRICHT Section */}
            {nachricht && (
              <div style={sectionBox}>
                <Heading style={sectionTitle}>NACHRICHT</Heading>
                <div style={sectionContent}>
                  <Text style={detailRow}>{nachricht}</Text>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <Section style={buttonSection}>
              <Text style={actionText}>
                <strong>Möchten Sie diesen Auftrag annehmen?</strong>
              </Text>
              <table style={buttonTable}>
                <tr>
                  <td style={buttonCell}>
                    <Button href={acceptUrl} style={acceptButton}>
                      ✅ Auftrag annehmen
                    </Button>
                  </td>
                  <td style={buttonCell}>
                    <Button href={declineUrl} style={declineButton}>
                      ❌ Ablehnen
                    </Button>
                  </td>
                </tr>
              </table>
              <Text style={noteText}>
                Nach dem Annehmen werden wir Sie kontaktieren mit weiteren Details.
              </Text>
              <Text style={noteText}>
                ⏱️ Dieser Link ist 48 Stunden gültig und kann nur einmal verwendet werden.
              </Text>
              <Text style={{...noteText, fontSize: '11px', marginTop: '10px'}}>
                <strong>Falls die Buttons nicht funktionieren:</strong><br />
                Annehmen: {acceptUrl}<br />
                Ablehnen: {declineUrl}
              </Text>
            </Section>
            
            {/* Vermittlungsgebühr Info */}
            <div style={{
              backgroundColor: '#fff8e1',
              border: '2px solid #ffc107',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '20px',
              marginBottom: '20px'
            }}>
              <Text style={{
                color: '#333',
                fontSize: '16px',
                fontWeight: 'bold' as const,
                marginBottom: '10px'
              }}>
                📋 Wichtig: Vermittlungsgebühr
              </Text>
              <Text style={{
                color: '#333',
                fontSize: '14px',
                lineHeight: '22px',
                margin: 0
              }}>
                Die Vermittlungsgebühr beträgt bei jedem Einsatz:<br />
                • <strong>15 % für LKW CE Fahrer</strong><br />
                • <strong>20 % für Baumaschinenführer</strong><br />
                <br />
                Die Vermittlungsgebühr wird automatisch von Ihrem Rechnungsbetrag abgezogen.
                Sie stellen Ihre Rechnung an Fahrerexpress über den vollen Tagespreis laut Website; die Provision wird intern einbehalten.
              </Text>
            </div>
            
            {/* Contact Info */}
            <div style={contactSection}>
              <Text style={contactInfo}>
                Bei Fragen erreichen Sie uns unter:
              </Text>
              <Text style={contactDetails}>
                📞 <strong>Telefon:</strong> +49-1577-1442285<br />
                ✉️ <strong>E-Mail:</strong> info@kraftfahrer-mieten.com
              </Text>
            </div>
          </div>
          
          {/* Footer */}
          <div style={footer}>
            <Text style={footerText}>
              <strong>Fahrerexpress-Agentur – Günter Killer</strong>
            </Text>
            <Text style={footerText}>
              E-Mail: info@kraftfahrer-mieten.com | Web: kraftfahrer-mieten.com
            </Text>
            <Text style={footerText}>
              Diese E-Mail wurde automatisch versendet, weil Sie in unserem Fahrerpool registriert sind.
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
};

export default JobNotificationEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  padding: '20px',
};

const container = {
  maxWidth: '700px',
  margin: '0 auto',
};

const header = {
  backgroundColor: '#4472c4',
  color: 'white',
  padding: '30px',
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const headerTitle = {
  margin: 0,
  fontSize: '36px',
  fontWeight: 'bold' as const,
  letterSpacing: '1px',
  color: 'white',
};

const headerSubtitle = {
  margin: '10px 0 0 0',
  fontSize: '16px',
  color: 'white',
};

const content = {
  padding: '0 20px',
};

const greeting = {
  margin: '0 0 10px 0',
  fontSize: '14px',
  color: '#000',
};

const introText = {
  margin: '0 0 20px 0',
  fontSize: '14px',
  color: '#000',
};

const sectionBox = {
  backgroundColor: '#f2f2f2',
  borderLeft: '4px solid #4472c4',
  padding: '15px',
  marginBottom: '20px',
};

const sectionTitle = {
  margin: '0 0 10px 0',
  color: '#000',
  fontSize: '16px',
  fontWeight: 'bold' as const,
};

const sectionContent = {
  color: '#000',
  fontSize: '14px',
};

const detailRow = {
  margin: '3px 0',
  fontSize: '14px',
  color: '#000',
};

const buttonSection = {
  margin: '30px 0',
  textAlign: 'center' as const,
};

const actionText = {
  fontSize: '16px',
  color: '#000',
  marginBottom: '15px',
};

const buttonTable = {
  margin: '0 auto',
  borderSpacing: '10px',
};

const buttonCell = {
  padding: '5px',
};

const acceptButton = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  padding: '15px 40px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold' as const,
  fontSize: '16px',
  display: 'inline-block',
  border: 'none',
};

const declineButton = {
  backgroundColor: '#ef4444',
  color: '#ffffff',
  padding: '15px 40px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 'bold' as const,
  fontSize: '16px',
  display: 'inline-block',
  border: 'none',
};

const noteText = {
  fontSize: '12px',
  color: '#666',
  marginTop: '10px',
  fontStyle: 'italic' as const,
};

const contactSection = {
  marginTop: '30px',
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
};

const contactInfo = {
  fontSize: '14px',
  color: '#000',
  marginBottom: '10px',
};

const contactDetails = {
  fontSize: '14px',
  color: '#4472c4',
  margin: 0,
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '30px',
  padding: '15px',
  fontSize: '12px',
  color: '#666',
  borderTop: '1px solid #ccc',
};

const footerText = {
  margin: '5px 0',
  fontSize: '12px',
  color: '#666',
};
