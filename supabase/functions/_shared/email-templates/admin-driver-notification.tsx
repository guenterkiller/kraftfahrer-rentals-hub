import { Heading, Text, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles } from './base-email.tsx';

interface AdminDriverNotificationProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  regions?: string[];
  licenseClasses?: string[];
  specializations?: string[];
}

export const AdminDriverNotification = ({
  firstName,
  lastName,
  email,
  phone,
  regions = [],
  licenseClasses = [],
  specializations = [],
}: AdminDriverNotificationProps) => (
  <BaseEmail previewText={`Neue Fahrer-Registrierung: ${firstName} ${lastName}`}>
    <Heading style={{ ...textStyles.heading2, color: colors.primary }}>
      📥 Neue Fahrerregistrierung eingegangen
    </Heading>

    <Text style={textStyles.paragraph}>
      Ein neuer Fahrer hat sich erfolgreich über das Portal registriert:
    </Text>

    <Section style={boxStyles.highlightBox}>
      <Heading style={textStyles.heading3}>🧾 Persönliche Daten</Heading>
      <table width="100%" cellPadding="0" cellSpacing="0">
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px', width: '40%' }}><strong>Vorname:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{firstName}</td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Nachname:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }}>{lastName}</td>
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
      <Heading style={textStyles.heading3}>🚛 Fahrerdetails</Heading>
      <table width="100%" cellPadding="0" cellSpacing="0">
        {regions.length > 0 && (
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px', width: '40%' }}><strong>Region:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }}>{regions.join(', ')}</td>
          </tr>
        )}
        {licenseClasses.length > 0 && (
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Führerscheinklassen:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }}>{licenseClasses.join(', ')}</td>
          </tr>
        )}
        {specializations.length > 0 && (
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }}><strong>Spezialisierungen:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }}>{specializations.join(', ')}</td>
          </tr>
        )}
      </table>
    </Section>

    <Section style={boxStyles.successBox}>
      <Heading style={{ ...textStyles.heading3, color: colors.success }}>✅ Nächste Schritte</Heading>
      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
        <li>Fahrerunterlagen im Admin-Panel prüfen</li>
        <li>Dokumente (Führerschein, Fahrerkarte, Zertifikate) kontrollieren</li>
        <li>Bei vollständigen und korrekten Unterlagen: Fahrer freischalten</li>
        <li>Fahrer erhält automatisch Benachrichtigung über Freischaltung</li>
      </ul>
    </Section>

    <Hr style={{ borderTop: `2px solid ${colors.primary}`, margin: '30px 0' }} />

    <Text style={{ ...textStyles.muted, fontSize: '12px', textAlign: 'center' as const }}>
      📅 Registriert am: {new Date().toLocaleString('de-DE', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
      })}
    </Text>
  </BaseEmail>
);

export default AdminDriverNotification;
