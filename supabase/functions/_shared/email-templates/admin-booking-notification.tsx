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
  tarif?: {
    tarif: string;
    label: string;
    netto: number | null;
    einheit: string;
    mehrstunde: number | null;
    needsReview: boolean;
    reason: string;
  };
  maschinenbedienungLabel?: string;
  surchargeDays?: string[];
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
  tarif,
  maschinenbedienungLabel,
  surchargeDays = [],
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
            {tarif
              ? (tarif.needsReview
                  ? 'Tarifzuordnung erforderlich'
                  : `${tarif.label}${tarif.netto ? ` – ${tarif.netto.toLocaleString('de-DE')} € netto ${tarif.einheit}` : ''}`)
              : (isFernfahrerTarif ? 'Fernfahrer-Pauschale (450 € netto / Einsatztag)' : 'Standard-Tagessatz')}
          </td>
        </tr>
        {requirements.length > 0 && (
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Anforderungen:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }}>{requirements.join(', ')}</td>
          </tr>
        )}
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Einsatztätigkeiten und Anforderungen:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{message}</td>
        </tr>
      </table>
      <Text style={{ ...textStyles.paragraph, fontSize: '13px', fontStyle: 'italic', margin: '12px 0 0 0' }}>
        Der Besteller hat bestätigt, dass die beschriebenen Einsatztätigkeiten und Anforderungen vollständig und richtig sind. Diese Angaben bilden die Grundlage der Einsatzabstimmung und der Auftragsannahme durch den selbstständigen Fahrer.
      </Text>
    </Section>

    {tarif && (
      <Section style={{ ...boxStyles.infoBox, backgroundColor: tarif.needsReview ? '#fef3c7' : '#f0fdf4', borderLeft: `4px solid ${tarif.needsReview ? '#d97706' : '#16a34a'}` }}>
        <Heading style={textStyles.heading3}>🧮 Tarifzuordnung</Heading>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px', width: '40%' }}><strong>Maschinen-/Anlagenbedienung:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }}>{maschinenbedienungLabel || 'Keine Angabe'}</td>
          </tr>
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Maßgeblicher Tarif:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }}>
              {tarif.needsReview ? 'Zuordnung zu einem veröffentlichten Tarif erforderlich' : `${tarif.label}`}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Tagessatz:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }}>
              {tarif.netto ? `${tarif.netto.toLocaleString('de-DE')} € netto ${tarif.einheit}` : 'Der zutreffende veröffentlichte Tagessatz wird nach Prüfung der Tätigkeit zugeordnet'}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Mehrstunde:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }}>
              {tarif.mehrstunde ? `${tarif.mehrstunde.toLocaleString('de-DE')} € netto je angefangene Stunde` : 'Der veröffentlichte Mehrstundensatz des zugeordneten Tarifs gilt'}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Begründung:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }}>{tarif.reason}</td>
          </tr>
        </table>
        {surchargeDays.length > 0 && (
          <>
            <Text style={{ ...textStyles.paragraph, margin: '12px 0 4px 0' }}>
              <strong>Wochenend-/Feiertage im Einsatzzeitraum:</strong>
            </Text>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
              {surchargeDays.map((d) => (<li key={d}>{d}</li>))}
            </ul>
          </>
        )}
        {tarif.needsReview && (
          <Text style={{ ...textStyles.paragraph, margin: '12px 0 0 0', fontWeight: 'bold' }}>
            ⚠️ Dem Besteller wurde noch kein Fahrertyp bestätigt. Bitte den passenden veröffentlichten Tarif manuell zuordnen – die Preise selbst stehen fest.
          </Text>
        )}
      </Section>
    )}

    {isFernfahrerTarif && (
      <Section style={{ ...boxStyles.infoBox, backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6' }}>
        <Text style={{ ...textStyles.paragraph, margin: '0' }}>
          <strong>Fernfahrer-Pauschale aktiv:</strong> 450 € pro Fernverkehrs-Einsatztag. Zusätzlich An- und Abfahrt.
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
