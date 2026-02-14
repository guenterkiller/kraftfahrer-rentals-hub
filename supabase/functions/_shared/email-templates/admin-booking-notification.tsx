import { Heading, Text, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles } from './base-email.tsx';

interface AdminBookingNotificationProps {
  customerName: string;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  timeframe: string;
  driverType: string;
  requirements?: string[];
  message: string;
  billingModel: string;
  jobId: string;
  isFernfahrerTarif?: boolean;
}

export const AdminBookingNotification = ({
  customerName,
  companyName,
  email,
  phone,
  address,
  timeframe,
  driverType,
  requirements = [],
  message,
  billingModel,
  jobId,
  isFernfahrerTarif = false,
}: AdminBookingNotificationProps) => (
  <BaseEmail previewText={`Neue Buchungsanfrage: ${driverType} in ${address}`}>
    <Heading style={{ ...textStyles.heading2, color: colors.primary }}>
      📥 Neue Buchungsanfrage eingegangen
    </Heading>

    <Text style={textStyles.paragraph}>
      Eine neue Fahrerbuchung wurde über das Portal eingereicht:
    </Text>

    <Section style={boxStyles.highlightBox}>
      <Heading style={textStyles.heading3}>👤 Kundendaten</Heading>
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px', width: '40%' }}><strong>Kunde:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>
            {customerName}{companyName ? ` (${companyName})` : ''}
          </td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>E-Mail:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>
            <a href={`mailto:${email}`} style={{ color: colors.primary }}>{email}</a>
          </td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Telefon:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>
            <a href={`tel:${phone}`} style={{ color: colors.primary }}>{phone}</a>
          </td>
        </tr>
      </table>
    </Section>

    <Section style={boxStyles.infoBox}>
      <Heading style={textStyles.heading3}>🚛 Auftragsdaten</Heading>
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px', width: '40%' }}><strong>Einsatzort:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{address}</td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Zeitraum:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{timeframe}</td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Fahrertyp:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{driverType}</td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Tarif:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px', fontWeight: 'bold', color: isFernfahrerTarif ? '#3b82f6' : undefined }}>
            {isFernfahrerTarif ? 'Fernfahrer-Tarif (450 € netto / Einsatztag)' : 'Standard-Tagessatz'}
          </td>
        </tr>
        {requirements.length > 0 && (
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Anforderungen:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }}>{requirements.join(', ')}</td>
          </tr>
        )}
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Nachricht:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{message}</td>
        </tr>
      </table>
    </Section>

    {isFernfahrerTarif && (
      <Section style={{ ...boxStyles.infoBox, backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6' }}>
        <Text style={{ ...textStyles.paragraph, margin: '0' }}>
          <strong>ℹ️ Fernfahrer-Tarif aktiv:</strong> Fernfahrer-Tarif gilt für Fernverkehr mit Übernachtung im LKW und durchgehender Abwesenheit von zuhause. Abrechnung pauschal pro Einsatztag – keine Stundenabrechnung.
        </Text>
      </Section>
    )}

    <Section style={{ ...boxStyles.infoBox, backgroundColor: '#fef3f2' }}>
      <Heading style={textStyles.heading3}>💼 Abrechnungsdetails</Heading>
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px', width: '40%' }}><strong>Billing Model:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{billingModel}</td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Job ID:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px', fontFamily: 'monospace' }}>{jobId}</td>
        </tr>
      </table>
    </Section>

    <Hr style={{ borderTop: `2px solid ${colors.primary}`, margin: '30px 0' }} />

    <Text style={{ ...textStyles.muted, fontSize: '12px', textAlign: 'center' as const }}>
      📅 Eingegangen am: {new Date().toLocaleString('de-DE', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
      })}
    </Text>
  </BaseEmail>
);

export default AdminBookingNotification;
