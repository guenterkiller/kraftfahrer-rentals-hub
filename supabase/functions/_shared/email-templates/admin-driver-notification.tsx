import { Heading, Text, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles, getBoxProps, getTextProps } from './base-email.tsx';

interface RejectedFile {
  field: string;
  filename: string;
  reason: string;
}

interface AdminDriverNotificationProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  regions?: string[];
  licenseClasses?: string[];
  specializations?: string[];
  specialRequirements?: string[];
  experienceYears?: number | null;
  strasse?: string | null;
  hausnummer?: string | null;
  plz?: string | null;
  ort?: string | null;
  land?: string | null;
  uploadedDocs?: Record<string, string>;
  rejectedFiles?: RejectedFile[];
}

const NOT_SET = 'nicht erfasst';

const cellLabel = { padding: '5px 0', fontSize: '14px', width: '45%' } as const;
const cellValue = { padding: '5px 0', fontSize: '14px' } as const;

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <tr>
    <td style={cellLabel} className="mobile-text"><strong>{label}:</strong></td>
    <td style={cellValue} className="mobile-text">
      {value ?? <span style={{ color: colors.muted ?? '#888888' }}>{NOT_SET}</span>}
    </td>
  </tr>
);

const val = (v?: string | null) => (v && String(v).trim() ? String(v).trim() : undefined);
const list = (v?: string[]) => (v && v.length > 0 ? v.join(', ') : undefined);

const DOC_LABELS: { field: string; label: string }[] = [
  { field: 'fuehrerschein', label: 'Führerschein' },
  { field: 'fahrerkarte', label: 'Fahrerkarte' },
  { field: 'zertifikate', label: 'Zertifikate' },
  { field: 'gewerbeanmeldung', label: 'Gewerbeanmeldung' },
];

export const AdminDriverNotification = ({
  firstName,
  lastName,
  email,
  phone,
  regions = [],
  licenseClasses = [],
  specializations = [],
  specialRequirements = [],
  experienceYears = null,
  strasse,
  hausnummer,
  plz,
  ort,
  land,
  uploadedDocs = {},
  rejectedFiles = [],
}: AdminDriverNotificationProps) => {
  const docCount = (field: string) => {
    const v = uploadedDocs[field];
    return v ? v.split(',').filter(Boolean).length : 0;
  };
  const rejectedFor = (field: string) => rejectedFiles.filter((r) => r.field === field);

  const docStatus = (field: string) => {
    const count = docCount(field);
    const rejected = rejectedFor(field);
    if (count > 0) {
      return (
        <span>
          <span style={{ color: colors.success }}>vorhanden</span>
          {count > 1 ? ` (${count} Dateien)` : ''}
          {rejected.length > 0 && (
            <span style={{ color: '#b00020' }}>
              {' '}– {rejected.length} Datei(en) abgelehnt: {rejected.map((r) => `${r.filename}: ${r.reason}`).join(' | ')}
            </span>
          )}
        </span>
      );
    }
    if (rejected.length > 0) {
      return (
        <span style={{ color: '#b00020' }}>
          abgelehnt / nicht übernommen – {rejected.map((r) => `${r.filename}: ${r.reason}`).join(' | ')}
        </span>
      );
    }
    return <span style={{ color: '#b00020' }}>nicht vorhanden</span>;
  };

  return (
    <BaseEmail previewText={`Neue Fahrer-Registrierung: ${firstName} ${lastName}`}>
      <Heading {...getTextProps({ ...textStyles.heading2, color: colors.primary }, 'heading')}>
        📥 Neue Fahrerregistrierung eingegangen
      </Heading>

      <Text {...getTextProps(textStyles.paragraph)}>
        Ein neuer Fahrer (selbstständiger Unternehmer) hat sich über das Portal registriert:
      </Text>

      <Section {...getBoxProps(boxStyles.highlightBox)}>
        <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>🧾 Persönliche Daten</Heading>
        <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
          <Row label="Vorname" value={val(firstName)} />
          <Row label="Nachname" value={val(lastName)} />
          <Row
            label="E-Mail"
            value={val(email) ? <a href={`mailto:${email}`} style={{ color: colors.primary }}>{email}</a> : undefined}
          />
          <Row
            label="Telefon"
            value={val(phone) ? <a href={`tel:${phone}`} style={{ color: colors.primary }}>{phone}</a> : undefined}
          />
        </table>
      </Section>

      <Section {...getBoxProps(boxStyles.infoBox)}>
        <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>📍 Standort Fahrer / An- und Abfahrt</Heading>
        <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
          <Row label="Straße" value={val(strasse)} />
          <Row label="Hausnummer" value={val(hausnummer)} />
          <Row label="Postleitzahl" value={val(plz)} />
          <Row label="Ort" value={val(ort)} />
          <Row label="Land" value={val(land)} />
        </table>
      </Section>

      <Section {...getBoxProps(boxStyles.infoBox)}>
        <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>🚛 Fahrerdetails</Heading>
        <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
          <Row label="Führerscheinklassen" value={list(licenseClasses)} />
          <Row
            label="Berufserfahrung"
            value={experienceYears || experienceYears === 0 ? `${experienceYears} Jahre` : undefined}
          />
          <Row label="Einsatzbereiche / Spezialisierungen" value={list(specializations)} />
          <Row label="Regionen / Einsatzgebiet" value={list(regions)} />
          <Row label="Spezialanforderungen" value={list(specialRequirements)} />
          <Row label="Gewerbeanmeldung eingereicht" value={docCount('gewerbeanmeldung') > 0 ? 'Ja' : 'Nein'} />
          <Row label="Fahrerkarte eingereicht" value={docCount('fahrerkarte') > 0 ? 'Ja' : 'Nein'} />
        </table>
      </Section>

      <Section {...getBoxProps(boxStyles.infoBox)}>
        <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>📎 Hochgeladene Dokumente</Heading>
        <table width="100%" cellPadding="0" cellSpacing="0" className="mobile-table">
          {DOC_LABELS.map(({ field, label }) => (
            <tr key={field}>
              <td style={cellLabel} className="mobile-text"><strong>{label}:</strong></td>
              <td style={cellValue} className="mobile-text">{docStatus(field)}</td>
            </tr>
          ))}
        </table>
      </Section>

      <Section {...getBoxProps(boxStyles.successBox)}>
        <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>✅ Nächste Schritte</Heading>
        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }} className="mobile-text">
          <li>Unterlagen prüfen (Führerschein, Fahrerkarte, Zertifikate, Gewerbeanmeldung)</li>
          <li>Fahrerstandort prüfen (Grundlage für An- und Abfahrt)</li>
          <li>Führerscheinklassen und Einsatzbereiche prüfen</li>
          <li>Fahrer bei Eignung freischalten</li>
          <li>Erst nach Freischaltung Aufnahme in den Verteiler für passende Auftragsangebote</li>
        </ul>
      </Section>

      <Hr style={{ borderTop: `2px solid ${colors.primary}`, margin: '30px 0' }} />

      <Text {...getTextProps({ ...textStyles.muted, fontSize: '12px', textAlign: 'center' as const })}>
        📅 Registriert am: {new Date().toLocaleString('de-DE', {
          dateStyle: 'full',
          timeStyle: 'short',
        })}
      </Text>
    </BaseEmail>
  );
};

export default AdminDriverNotification;
