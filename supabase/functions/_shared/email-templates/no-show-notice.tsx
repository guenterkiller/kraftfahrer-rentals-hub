import { Text, Heading, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, boxStyles, textStyles } from './base-email.tsx';

interface NoShowNoticeProps {
  customerName: string;
  company?: string;
  customerPhone: string;
  customerEmail: string;
  einsatzort: string;
  zeitraum?: string;
  startDate?: string;
  endDate?: string;
  fahrzeugtyp: string;
  fuehrerscheinklasse?: string;
  feeEur: string;
  tierLabel: string;
}

export const NoShowNotice = ({
  customerName,
  company,
  customerPhone,
  customerEmail,
  einsatzort,
  zeitraum,
  startDate,
  endDate,
  fahrzeugtyp,
  fuehrerscheinklasse,
  feeEur,
  tierLabel,
}: NoShowNoticeProps) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE');
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <BaseEmail previewText="No-Show-Mitteilung – Fahrer ist nicht erschienen">
      <Heading style={{ ...textStyles.h1, color: '#d32f2f' }}>
        No-Show-Mitteilung 🚨
      </Heading>
      
      <Text style={textStyles.paragraph}>
        Sehr geehrte Damen und Herren,
      </Text>
      
      <Text style={textStyles.paragraph}>
        wir informieren Sie, dass der für den heutigen Einsatz vorgesehene Fahrer <strong>nicht erschienen</strong> ist (No-Show).
      </Text>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* AUFTRAGGEBER Section */}
      <Section style={boxStyles.highlight}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          👤 Auftraggeber
        </Heading>
        <Text style={textStyles.paragraph}>
          <strong>Unternehmen/Name:</strong> {company || customerName}
        </Text>
        {company && customerName && (
          <Text style={textStyles.paragraph}>
            <strong>Ansprechpartner:</strong> {customerName}
          </Text>
        )}
        <Text style={textStyles.paragraph}>
          <strong>Telefon:</strong> {customerPhone}
        </Text>
        <Text style={textStyles.paragraph}>
          <strong>E-Mail:</strong> {customerEmail}
        </Text>
      </Section>
      
      {/* EINSATZ Section */}
      <Section style={boxStyles.info}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          🚛 Einsatzdetails
        </Heading>
        {startDate ? (
          <Text style={textStyles.paragraph}>
            <strong>Datum/Zeitraum:</strong> {formatDate(startDate)} {formatTime(startDate)}
            {endDate && ` – ${formatDate(endDate)} ${formatTime(endDate)}`}
          </Text>
        ) : (
          <Text style={textStyles.paragraph}>
            <strong>Zeitraum:</strong> {zeitraum || 'Nicht angegeben'}
          </Text>
        )}
        <Text style={textStyles.paragraph}>
          <strong>Einsatzort/Treffpunkt:</strong> {einsatzort}
        </Text>
        <Text style={textStyles.paragraph}>
          <strong>Fahrzeug:</strong> {fahrzeugtyp}
        </Text>
        {fuehrerscheinklasse && (
          <Text style={textStyles.paragraph}>
            <strong>Führerscheinklasse:</strong> {fuehrerscheinklasse}
          </Text>
        )}
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* SCHADENSERSATZ Section */}
      <Section style={boxStyles.warning}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          ⚠️ Hinweis zum Schadensersatz
        </Heading>
        <Text style={textStyles.paragraph}>
          Gemäß unserer Einsatzbedingungen (siehe Bestätigung) können Sie bei schuldhaftem Nichterscheinen 
          ersatzfähige Schäden geltend machen (z. B. Mehrkosten eines Ersatzfahrers, Ausfall-/Standkosten).
        </Text>
        <Text style={{ ...textStyles.paragraph, fontWeight: 'bold' }}>
          Pauschale No-Show-Entschädigung: {feeEur} € ({tierLabel})
        </Text>
        <Text style={textStyles.muted}>
          Dem Fahrer bleibt der Nachweis eines geringeren Schadens, dem Auftraggeber der Nachweis eines 
          höheren Schadens vorbehalten.
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      <Section style={boxStyles.success}>
        <Text style={{ ...textStyles.paragraph, fontWeight: 'bold', textAlign: 'center' }}>
          Wir kümmern uns umgehend um Ersatz und melden uns kurzfristig.
        </Text>
      </Section>
    </BaseEmail>
  );
};

export default NoShowNotice;
