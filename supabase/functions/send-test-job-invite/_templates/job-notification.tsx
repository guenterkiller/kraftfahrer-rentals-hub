import { Text, Heading, Section, Hr, Button } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, boxStyles, textStyles, colors } from '../../_shared/email-templates/base-email.tsx';

interface JobNotificationEmailProps {
  driverName: string;
  driverId: string;
  jobId: string;
  einsatzort: string;
  zeitraum: string;
  fahrzeugtyp: string;
  fuehrerscheinklasse: string;
  nachricht: string;
  besonderheiten?: string;
  acceptUrl?: string;
  declineUrl?: string;
  unsubscribeUrl?: string;
  attachments?: Array<{ filename: string; url: string }>;
}

export const JobNotificationEmail = ({
  driverName,
  driverId,
  jobId,
  einsatzort,
  zeitraum,
  fahrzeugtyp,
  fuehrerscheinklasse,
  nachricht,
  besonderheiten,
  acceptUrl,
  declineUrl,
  unsubscribeUrl,
  attachments,
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
          <Text style={{ ...textStyles.paragraph, whiteSpace: 'pre-line' }}>
            <strong>Besonderheiten:</strong>{'\n'}{besonderheiten}
          </Text>
        )}
      </Section>
      
      {/* NACHRICHT Section */}
      {nachricht && (
        <Section style={boxStyles.info}>
          <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
            💬 Zusätzliche Informationen
          </Heading>
          <Text style={{ ...textStyles.paragraph, whiteSpace: 'pre-line' }}>{nachricht}</Text>
        </Section>
      )}

      {/* Anhänge */}
      {attachments && attachments.length > 0 && (
        <Section style={boxStyles.info}>
          <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
            📎 Anhänge zum Auftrag
          </Heading>
          {(() => {
            let imgCount = 0;
            let pdfCount = 0;
            let docCount = 0;
            return attachments.map((a, i) => {
              const isImage = /\.(png|jpe?g|gif|webp|heic|bmp|svg)$/i.test(a.filename);
              const isPdf = /\.pdf$/i.test(a.filename);
              const label = isImage
                ? `Fahrzeugbild ${++imgCount} öffnen`
                : isPdf
                ? `PDF-Anhang ${++pdfCount} öffnen`
                : `Anhang ${++docCount} öffnen`;
              return (
                <Text key={i} style={textStyles.paragraph}>
                  <a href={a.url} style={{ color: '#2563eb', textDecoration: 'underline' }}>
                    {label}
                  </a>
                </Text>
              );
            });
          })()}
          <Text style={{ ...textStyles.muted, fontSize: '12px' }}>
            Die Links sind aus Sicherheitsgründen zeitlich begrenzt gültig.
          </Text>
        </Section>
      )}

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />

      {/* Antwort-Buttons */}
      {(acceptUrl || declineUrl) && (
        <Section style={{
          textAlign: 'center' as const,
          margin: '30px 0',
          padding: '24px',
          backgroundColor: '#f0fdf4',
          border: '2px solid #16a34a',
          borderRadius: '12px'
        }}>
          <Heading style={{ ...textStyles.h3, marginTop: 0, color: '#166534' }}>
            Können Sie diesen Auftrag übernehmen?
          </Heading>
          <Text style={{ ...textStyles.paragraph, fontSize: '15px', color: '#166534', textAlign: 'center' as const }}>
            Bitte um kurze Rückmeldung über die Buttons:
          </Text>
          <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '16px auto' }}>
            <tr>
              <td style={{ padding: '6px' }}>
                {acceptUrl && (
                  <Button
                    href={acceptUrl}
                    style={{
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      padding: '14px 22px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                  >
                    Ich kann den Auftrag übernehmen
                  </Button>
                )}
              </td>
              <td style={{ padding: '6px' }}>
                {declineUrl && (
                  <Button
                    href={declineUrl}
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      padding: '14px 22px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      textDecoration: 'none',
                      display: 'inline-block',
                    }}
                  >
                    Ich kann nicht übernehmen
                  </Button>
                )}
              </td>
            </tr>
          </table>
          <Text style={{ ...textStyles.paragraph, fontSize: '13px', color: '#166534', marginTop: '12px' }}>
            Ihre Rückmeldung dient der Verfügbarkeitsprüfung. Die endgültige Einsatzbestätigung erfolgt separat durch Fahrerexpress.
          </Text>
        </Section>
      )}

      {/* Wichtiger Hinweis */}
      <Section style={boxStyles.warning}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          ⚠️ Wichtiger Hinweis
        </Heading>
        <Text style={textStyles.paragraph}>
          <strong>Bitte kontaktieren Sie den Auftraggeber nicht direkt.</strong> Die Vermittlung und Einsatzkoordination erfolgt ausschließlich über Fahrerexpress. 
          Direkte Absprachen mit dem Auftraggeber sind nicht gestattet.
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* Vergütung & Vermittlungsanteil */}
      <Section style={boxStyles.highlight}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          📋 Vergütung & Vermittlungsanteil
        </Heading>
        <Text style={textStyles.paragraph}>
          Vergütung und Vermittlungsanteil ergeben sich aus dem konkreten Auftragsangebot,
          das Fahrerexpress Ihnen vor Einsatzbeginn mitteilt. Maßgeblich ist ausschließlich dieses Angebot.
        </Text>
        <Text style={textStyles.paragraph}>
          Details siehe{' '}
          <a href="https://www.kraftfahrer-mieten.com/fahrer-vermittlungsbedingungen" style={{ color: '#2563eb' }}>
            Vermittlungsbedingungen für Fahrer
          </a>.
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* Contact Info */}
      <Section style={boxStyles.highlight}>
        <Text style={textStyles.paragraph}>
          <strong>Bei Fragen erreichen Sie uns unter:</strong>
        </Text>
        <Text style={textStyles.paragraph}>
          📞 <strong>Telefon/WhatsApp:</strong> +49 1577 1442285<br />
          ✉️ <strong>E-Mail:</strong> info@kraftfahrer-mieten.com
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

export default JobNotificationEmail;
