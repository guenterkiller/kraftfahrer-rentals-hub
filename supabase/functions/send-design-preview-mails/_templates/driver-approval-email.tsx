import { Text, Heading, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, boxStyles, textStyles } from '../../_shared/email-templates/base-email.tsx';

interface DriverApprovalEmailProps {
  driverName: string;
  hasMatchingJobs: boolean;
  unsubscribeUrl?: string;
}

export const DriverApprovalEmail = ({
  driverName,
  hasMatchingJobs,
  unsubscribeUrl,
}: DriverApprovalEmailProps) => {
  return (
    <BaseEmail previewText="Sie sind jetzt bei Fahrerexpress freigeschaltet">
      <Heading style={textStyles.h1}>Sie sind jetzt bei Fahrerexpress freigeschaltet</Heading>

      <Text style={textStyles.paragraph}>
        Hallo {driverName},
      </Text>

      <Text style={textStyles.paragraph}>
        Ihr Fahrerprofil wurde freigeschaltet.
      </Text>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />

      {hasMatchingJobs ? (
        <Section style={boxStyles.info}>
          <Text style={textStyles.paragraph}>
            Es wurden passende offene Fahrergesuche gefunden. Sie erhalten dazu separate Auftragsangebote per E-Mail mit direkter Antwortmöglichkeit.
          </Text>
        </Section>
      ) : (
        <Section style={boxStyles.info}>
          <Text style={textStyles.paragraph}>
            Derzeit sind keine passenden offenen Fahrergesuche verfügbar. Wir melden uns, sobald passende Anfragen eingehen.
          </Text>
        </Section>
      )}

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* Vermittlungsinformation */}
      <Section style={boxStyles.warning}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          Wichtig: Vermittlungsbedingungen
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
          Sie stellen Ihre Rechnung nach Einsatzabschluss direkt an Fahrerexpress – bereits nach Abzug des im Auftragsangebot vereinbarten Vermittlungsanteils. Der Vermittlungsanteil wird also nicht nachträglich von einer vollen Fahrerrechnung einbehalten, sondern vor Rechnungsstellung vom Netto-Auftragswert der reinen Fahrerdienstleistung abgezogen. Auslagen (An-/Abfahrt, Fahrtkosten, Diesel, Maut, Parkgebühren, Bahn, Hotel) werden gesondert behandelt und nicht vom Vermittlungsanteil gekürzt.
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* Contact Info */}
      <Section style={boxStyles.highlight}>
        <Text style={textStyles.paragraph}>
          <strong>Bei Fragen erreichen Sie uns unter:</strong>
        </Text>
        <Text style={textStyles.paragraph}>
          <strong>Telefon:</strong> +49-1577-1442285<br />
          <strong>E-Mail:</strong> info@kraftfahrer-mieten.com
        </Text>
      </Section>

      {unsubscribeUrl && (
        <Section style={{ marginTop: 16, textAlign: 'center' as const }}>
          <Text style={{ ...textStyles.muted, fontSize: '12px' }}>
            <a href={unsubscribeUrl} style={{ color: '#6b7280', textDecoration: 'underline' }}>
              Keine weiteren Auftragsangebote erhalten
            </a>
          </Text>
        </Section>
      )}
    </BaseEmail>
  );
};

export default DriverApprovalEmail;
