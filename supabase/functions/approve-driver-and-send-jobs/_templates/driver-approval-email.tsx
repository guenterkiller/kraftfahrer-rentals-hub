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

interface Job {
  nachricht: string;
  einsatzort: string;
  created_at: string;
  zeitraum: string;
  fahrzeugtyp: string;
  fuehrerscheinklasse: string;
  besonderheiten?: string;
}

interface DriverApprovalEmailProps {
  driverName: string;
  jobs: Job[];
}

export const DriverApprovalEmail = ({
  driverName,
  jobs = [],
}: DriverApprovalEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Sie sind freigeschaltet! Aktuelle Fahrergesuche verfügbar</Preview>
      <Body style={main}>
        <Container style={container}>
          
          {/* Blue Header */}
          <div style={header}>
            <Heading style={headerTitle}>FREISCHALTUNG ERFOLGREICH</Heading>
            <Text style={headerSubtitle}>Fahrerexpress | kraftfahrer-mieten.com</Text>
          </div>
          
          {/* Content */}
          <div style={content}>
            <Text style={greeting}>Hallo {driverName},</Text>
            <Text style={introText}>
              wir freuen uns, Ihnen mitteilen zu können, dass Sie jetzt <strong>freigeschaltet</strong> sind 
              und Fahrergesuche erhalten können!
            </Text>
            
            {/* Jobs Section */}
            {jobs.length > 0 ? (
              <>
                <Text style={jobsHeader}>
                  <strong>Aktuelle Fahrergesuche ({jobs.length})</strong>
                </Text>
                <Text style={jobsSubtext}>
                  Hier finden Sie die neuesten offenen Aufträge der letzten 30 Tage:
                </Text>

                {jobs.map((job, index) => {
                  const startDate = new Date(job.created_at).toLocaleDateString('de-DE');
                  return (
                    <div key={index} style={sectionBox}>
                      <Heading style={sectionTitle}>AUFTRAG #{index + 1}</Heading>
                      <div style={sectionContent}>
                        <Text style={detailRow}>
                          <strong>• Beschreibung:</strong> {job.nachricht || 'Fahrergesuch'}
                        </Text>
                        <Text style={detailRow}>
                          <strong>• Einsatzort:</strong> {job.einsatzort || 'Nicht angegeben'}
                        </Text>
                        <Text style={detailRow}>
                          <strong>• Erstellt am:</strong> {startDate}
                        </Text>
                        <Text style={detailRow}>
                          <strong>• Zeitraum:</strong> {job.zeitraum || 'Nicht angegeben'}
                        </Text>
                        <Text style={detailRow}>
                          <strong>• Fahrzeugtyp:</strong> {job.fahrzeugtyp || 'Nicht angegeben'}
                        </Text>
                        <Text style={detailRow}>
                          <strong>• Führerschein:</strong> {job.fuehrerscheinklasse || 'Nicht angegeben'}
                        </Text>
                        {job.besonderheiten && (
                          <Text style={detailRow}>
                            <strong>• Besonderheiten:</strong> {job.besonderheiten}
                          </Text>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div style={actionSection}>
                  <Text style={actionText}>
                    <strong>Interessiert an einem Auftrag?</strong>
                  </Text>
                  <Text style={actionSubtext}>
                    Antworten Sie einfach auf diese E-Mail oder rufen Sie uns direkt an!
                  </Text>
                </div>
              </>
            ) : (
              <div style={sectionBox}>
                <Text style={detailRow}>
                  Derzeit sind keine offenen Fahrergesuche verfügbar. Wir melden uns bei Ihnen,
                  sobald neue Anfragen eingehen.
                </Text>
              </div>
            )}
            
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

export default DriverApprovalEmail;

// Styles matching the job-notification template
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

const jobsHeader = {
  margin: '20px 0 10px 0',
  fontSize: '16px',
  color: '#000',
};

const jobsSubtext = {
  margin: '0 0 15px 0',
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

const actionSection = {
  margin: '30px 0',
  textAlign: 'center' as const,
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
};

const actionText = {
  fontSize: '16px',
  color: '#000',
  marginBottom: '10px',
};

const actionSubtext = {
  fontSize: '14px',
  color: '#666',
  margin: '5px 0',
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
