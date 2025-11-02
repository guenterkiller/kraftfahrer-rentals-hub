import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

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
}: DriverApprovalEmailProps) => (
  <Html>
    <Head />
    <Preview>Sie sind freigeschaltet! Aktuelle Fahrergesuche</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Heading style={h1}>🚛 Fahrerexpress</Heading>
          <Text style={tagline}>Ihre Vermittlungsagentur für LKW-Fahrer</Text>
        </Section>

        <Hr style={hr} />

        {/* Welcome Message */}
        <Section style={content}>
          <Heading style={h2}>Herzlich willkommen, {driverName}! 🎉</Heading>
          <Text style={paragraph}>
            Wir freuen uns, Ihnen mitteilen zu können, dass Sie jetzt{' '}
            <strong>freigeschaltet</strong> sind und Fahrergesuche erhalten können!
          </Text>
        </Section>

        {/* Jobs Section */}
        {jobs.length > 0 ? (
          <Section style={content}>
            <Heading style={h3}>
              📋 Aktuelle Fahrergesuche ({jobs.length})
            </Heading>
            <Text style={paragraph}>
              Hier finden Sie die neuesten offenen Aufträge der letzten 30 Tage:
            </Text>

            {jobs.map((job, index) => {
              const startDate = new Date(job.created_at).toLocaleDateString('de-DE');
              return (
                <Section key={index} style={jobCard}>
                  <Text style={jobNumber}>Auftrag #{index + 1}</Text>
                  <Text style={jobDescription}>{job.nachricht || 'Fahrergesuch'}</Text>
                  
                  <Section style={jobDetails}>
                    <Text style={jobDetail}>
                      📍 <strong>Ort:</strong> {job.einsatzort || 'Nicht angegeben'}
                    </Text>
                    <Text style={jobDetail}>
                      📅 <strong>Erstellt:</strong> {startDate}
                    </Text>
                    <Text style={jobDetail}>
                      ⏰ <strong>Zeitraum:</strong> {job.zeitraum || 'Nicht angegeben'}
                    </Text>
                    <Text style={jobDetail}>
                      🚚 <strong>Fahrzeug:</strong> {job.fahrzeugtyp || 'Nicht angegeben'}
                    </Text>
                    <Text style={jobDetail}>
                      🪪 <strong>Führerschein:</strong> {job.fuehrerscheinklasse || 'Nicht angegeben'}
                    </Text>
                    {job.besonderheiten && (
                      <Text style={jobDetail}>
                        ⚡ <strong>Besonderheiten:</strong> {job.besonderheiten}
                      </Text>
                    )}
                  </Section>
                </Section>
              );
            })}

            <Hr style={hr} />

            <Text style={paragraph}>
              <strong>Interessiert an einem Auftrag?</strong>
            </Text>
            <Text style={paragraph}>
              Antworten Sie einfach auf diese E-Mail oder rufen Sie uns direkt an!
            </Text>
          </Section>
        ) : (
          <Section style={content}>
            <Text style={paragraph}>
              Derzeit sind keine offenen Fahrergesuche verfügbar. Wir melden uns bei Ihnen,
              sobald neue Anfragen eingehen.
            </Text>
          </Section>
        )}

        <Hr style={hr} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Mit freundlichen Grüßen<br />
            <strong>Ihr Fahrerexpress-Team</strong>
          </Text>
          <Hr style={footerDivider} />
          <Text style={footerCompany}>
            <strong>Fahrerexpress-Agentur</strong><br />
            Günter Killer<br />
            <Link href="mailto:info@kraftfahrer-mieten.com" style={link}>
              info@kraftfahrer-mieten.com
            </Link><br />
            <Link href="https://kraftfahrer-mieten.com" style={link}>
              www.kraftfahrer-mieten.com
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default DriverApprovalEmail

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#1e40af',
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0',
  padding: '0',
}

const tagline = {
  color: '#e0e7ff',
  fontSize: '14px',
  margin: '8px 0 0',
}

const h2 = {
  color: '#1e40af',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 16px',
}

const h3 = {
  color: '#1e293b',
  fontSize: '20px',
  fontWeight: '600',
  margin: '24px 0 16px',
}

const content = {
  padding: '0 24px',
}

const paragraph = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const jobCard = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
}

const jobNumber = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const jobDescription = {
  color: '#1e293b',
  fontSize: '15px',
  fontWeight: '500',
  lineHeight: '22px',
  margin: '0 0 12px',
}

const jobDetails = {
  marginTop: '12px',
}

const jobDetail = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
}

const hr = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
}

const footer = {
  padding: '24px',
}

const footerText = {
  color: '#525252',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const footerDivider = {
  borderColor: '#e2e8f0',
  margin: '16px 0',
}

const footerCompany = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '0',
}

const link = {
  color: '#1e40af',
  textDecoration: 'underline',
}
