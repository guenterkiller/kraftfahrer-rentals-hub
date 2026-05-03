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
    <BaseEmail previewText="Sie sind jetzt bei Fahrerexpress freigeschaltet">
      <Heading style={textStyles.h1}>Sie sind jetzt bei Fahrerexpress freigeschaltet</Heading>

      <Text style={textStyles.paragraph}>
        Hallo {driverName},
      </Text>

      <Text style={textStyles.paragraph}>
        wir freuen uns, Ihnen mitteilen zu können, dass Ihr Fahrerprofil freigeschaltet wurde.
      </Text>

      <Text style={textStyles.paragraph}>
        Sie können ab sofort passende Fahrergesuche von Fahrerexpress erhalten.
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
            sobald passende Anfragen eingehen.
          </Text>
        </Section>
      )}

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* Vermittlungsinformation */}
      <Section style={boxStyles.warning}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          📋 Wichtig: Vermittlungsbedingungen
        </Heading>
        <Text style={textStyles.paragraph}>
          Für die Zusammenarbeit gelten die Vermittlungsbedingungen für Fahrer.
        </Text>
        <Text style={textStyles.paragraph}>
          Jeder Einsatz wird Ihnen vorab einzeln angeboten. Dabei erhalten Sie alle wichtigen
          Informationen zum Einsatzort, Zeitraum, Fahrzeug, zur Tätigkeit, zu besonderen Anforderungen
          und zur vorgesehenen Vergütung.
        </Text>
        <Text style={textStyles.paragraph}>
          Sie entscheiden bei jedem Angebot frei, ob Sie den Einsatz übernehmen möchten oder nicht.
        </Text>
        <Text style={textStyles.paragraph}>
          Die konkrete Vergütung und der Vermittlungsanteil ergeben sich ausschließlich aus dem
          jeweiligen Auftragsangebot vor Einsatzbeginn.
        </Text>
        <Text style={textStyles.paragraph}>
          Sie stellen Ihre Rechnung nach Einsatzabschluss direkt an Fahrerexpress.
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
