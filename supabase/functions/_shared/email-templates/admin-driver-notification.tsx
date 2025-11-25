import { Heading, Text, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles, getBoxProps, getTextProps } from './base-email.tsx';

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
    <Heading {...getTextProps({ ...textStyles.heading2, color: colors.primary }, 'heading')}>
      📥 Neue Fahrerregistrierung eingegangen
    </Heading>

    <Text {...getTextProps(textStyles.paragraph)}>
      Ein neuer Fahrer hat sich erfolgreich über das Portal registriert:
    </Text>

    <Section {...getBoxProps(boxStyles.highlightBox)}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>🧾 Persönliche Daten</Heading>
      <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px', width: '40%' }} className="mobile-text"><strong>Vorname:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{firstName}</td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Nachname:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{lastName}</td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>E-Mail:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">
            <a href={`mailto:${email}`} style={{ color: colors.primary }}>{email}</a>
          </td>
        </tr>
        <tr>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Telefon:</strong></td>
          <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">
            <a href={`tel:${phone}`} style={{ color: colors.primary }}>{phone}</a>
          </td>
        </tr>
      </table>
    </Section>

    <Section {...getBoxProps(boxStyles.infoBox)}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>🚛 Fahrerdetails</Heading>
      <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
        {regions.length > 0 && (
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px', width: '40%' }} className="mobile-text"><strong>Region:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{regions.join(', ')}</td>
          </tr>
        )}
        {licenseClasses.length > 0 && (
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Führerscheinklassen:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{licenseClasses.join(', ')}</td>
          </tr>
        )}
        {specializations.length > 0 && (
          <tr>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text"><strong>Spezialisierungen:</strong></td>
            <td style={{ padding: '5px 0', fontSize: '14px' }} className="mobile-text">{specializations.join(', ')}</td>
          </tr>
        )}
      </table>
    </Section>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>✅ Nächste Schritte</Heading>
      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
        <li>Fahrerunterlagen im Admin-Panel prüfen</li>
        <li>Dokumente (Führerschein, Fahrerkarte, Zertifikate) kontrollieren</li>
        <li>Bei vollständigen und korrekten Unterlagen: Fahrer freischalten</li>
        <li>Fahrer erhält automatisch Benachrichtigung über Freischaltung</li>
      </ul>
    </Section>

    <Hr style={{ borderTop: `2px solid ${colors.primary}`, margin: '30px 0' }} />

    <Text {...getTextProps({ ...textStyles.muted, fontSize: '12px', textAlign: 'center' as const })}>
      📅 Registriert am: {new Date().toLocaleString('de-DE', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
      })}
    </Text>
  </BaseEmail>
);

export default AdminDriverNotification;
