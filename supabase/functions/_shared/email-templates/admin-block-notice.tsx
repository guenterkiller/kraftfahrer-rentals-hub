import { Text, Heading, Section, Hr } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, boxStyles, textStyles, colors } from './base-email.tsx';

interface AdminBlockNoticeProps {
  driverName: string;
  driverEmail: string;
  driverId: string;
  reason: string;
  blockedAt: string;
}

export const AdminBlockNotice = ({
  driverName,
  driverEmail,
  driverId,
  reason,
  blockedAt,
}: AdminBlockNoticeProps) => {
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('de-DE', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    });
  };

  return (
    <BaseEmail previewText={`Fahrersperrung: ${driverName}`}>
      <Heading style={{ ...textStyles.h1, color: '#d32f2f' }}>
        🚫 Fahrersperrung durchgeführt
      </Heading>
      
      <Text style={{ ...textStyles.paragraph, fontSize: '12px', color: colors.muted }}>
        Admin-Benachrichtigung
      </Text>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* FAHRER-DETAILS Section */}
      <Section style={boxStyles.warning}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          👤 Gesperrter Fahrer
        </Heading>
        <Text style={textStyles.paragraph}>
          <strong>Name:</strong> {driverName}
        </Text>
        <Text style={textStyles.paragraph}>
          <strong>E-Mail:</strong> {driverEmail}
        </Text>
        <Text style={textStyles.paragraph}>
          <strong>Fahrer-ID:</strong> <code style={{ 
            backgroundColor: '#f3f4f6', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontFamily: 'monospace' 
          }}>{driverId}</code>
        </Text>
        <Text style={textStyles.paragraph}>
          <strong>Gesperrt am:</strong> {formatDateTime(blockedAt)}
        </Text>
      </Section>
      
      {/* GRUND Section */}
      <Section style={boxStyles.info}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          📋 Grund der Sperrung
        </Heading>
        <Text style={textStyles.paragraph}>
          {reason}
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* AUTOMATISCHE BENACHRICHTIGUNG Section */}
      <Section style={boxStyles.success}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          ✅ Automatische Benachrichtigung
        </Heading>
        <Text style={textStyles.paragraph}>
          Der Fahrer wurde automatisch per E-Mail über die Sperrung informiert, inklusive:
        </Text>
        <Text style={textStyles.paragraph}>
          • Grund der Sperrung<br />
          • Auswirkungen der Sperrung<br />
          • Rechte des Fahrers (Stellungnahme, Entsperrung)<br />
          • Kontaktmöglichkeiten
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      {/* NÄCHSTE SCHRITTE Section */}
      <Section style={boxStyles.highlight}>
        <Heading style={{ ...textStyles.h3, marginTop: 0 }}>
          📌 Empfohlene nächste Schritte
        </Heading>
        <Text style={textStyles.paragraph}>
          1. Dokumentation des Vorfalls im Admin-System vervollständigen<br />
          2. Bei Bedarf Rücksprache mit dem Fahrer<br />
          3. Entsperrung prüfen, sobald die Gründe entfallen sind<br />
          4. Gegebenenfalls rechtliche Schritte einleiten (z. B. No-Show-Gebühr)
        </Text>
      </Section>

      <Hr style={{ margin: '24px 0', borderTop: '1px solid #e5e7eb' }} />
      
      <Text style={{ ...textStyles.muted, fontSize: '11px', textAlign: 'center' }}>
        Diese E-Mail wurde automatisch vom fahrerexpress Admin-System generiert.
      </Text>
    </BaseEmail>
  );
};

export default AdminBlockNotice;
