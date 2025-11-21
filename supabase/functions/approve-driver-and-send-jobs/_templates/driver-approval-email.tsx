import { Text, Heading, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, boxStyles, textStyles } from '../../_shared/email-templates/base-email.tsx';

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
    <BaseEmail previewText="Sie sind freigeschaltet! Aktuelle Fahrergesuche verfügbar">
      <Heading style={textStyles.h1}>Freischaltung erfolgreich 🎉</Heading>
      
      <Text style={textStyles.paragraph}>
        Hallo {driverName},
      </Text>
      
      <Text style={textStyles.paragraph}>
        wir freuen uns, Ihnen mitteilen zu können, dass Sie jetzt <strong>freigeschaltet</strong> sind 
        und Fahrergesuche erhalten können!
      </Text>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />

      {/* Jobs Section */}
      {jobs.length > 0 ? (
        <>
          <Heading style={textStyles.h2}>
            Aktuelle Fahrergesuche ({jobs.length})
          </Heading>
          
          <Text style={textStyles.paragraph}>
            Hier finden Sie die neuesten offenen Aufträge der letzten 30 Tage:
          </Text>

          {jobs.map((job, index) => {
            const startDate = new Date(job.created_at).toLocaleDateString('de-DE');
            return (
              <Section key={index} style={boxStyles.info}>
                <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
                  Auftrag #{index + 1}
                </Heading>
                
                <Text style={textStyles.paragraph}>
                  <strong>Beschreibung:</strong> {job.nachricht || 'Fahrergesuch'}
                </Text>
                <Text style={textStyles.paragraph}>
                  <strong>Einsatzort:</strong> {job.einsatzort || 'Nicht angegeben'}
                </Text>
                <Text style={textStyles.paragraph}>
                  <strong>Erstellt am:</strong> {startDate}
                </Text>
                <Text style={textStyles.paragraph}>
                  <strong>Zeitraum:</strong> {job.zeitraum || 'Nicht angegeben'}
                </Text>
                <Text style={textStyles.paragraph}>
                  <strong>Fahrzeugtyp:</strong> {job.fahrzeugtyp || 'Nicht angegeben'}
                </Text>
                <Text style={textStyles.paragraph}>
                  <strong>Führerschein:</strong> {job.fuehrerscheinklasse || 'Nicht angegeben'}
                </Text>
                {job.besonderheiten && (
                  <Text style={textStyles.paragraph}>
                    <strong>Besonderheiten:</strong> {job.besonderheiten}
                  </Text>
                )}
              </Section>
            );
          })}

          <Section style={boxStyles.success}>
            <Text style={{ ...textStyles.paragraph, textAlign: 'center', fontWeight: 'bold' }}>
              Interessiert an einem Auftrag?
            </Text>
            <Text style={{ ...textStyles.paragraph, textAlign: 'center' }}>
              Antworten Sie einfach auf diese E-Mail oder rufen Sie uns direkt an!
            </Text>
          </Section>
        </>
      ) : (
        <Section style={boxStyles.info}>
          <Text style={textStyles.paragraph}>
            Derzeit sind keine offenen Fahrergesuche verfügbar. Wir melden uns bei Ihnen,
            sobald neue Anfragen eingehen.
          </Text>
        </Section>
      )}

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

export default DriverApprovalEmail;
