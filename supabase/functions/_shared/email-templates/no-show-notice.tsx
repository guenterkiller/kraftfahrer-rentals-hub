import { Text, Heading, Section, Link } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, boxStyles, textStyles } from './base-email.tsx';

// Kurze No-Show-Mitteilung an den AUFTRAGGEBER. Enthält bewusst keine interne Fahrer-Ausfallpauschale
// (Angelegenheit zwischen Agentur und Fahrer) und keine Beträge.
interface NoShowNoticeProps {
  customerName: string;
  company?: string;
  einsatzort: string;
  /** Bereits formatierter Einsatzzeitraum (Europe/Berlin), sonst Freitext-Zeitraum. */
  zeitraum?: string;
  fahrzeugtyp: string;
}

const BEDINGUNGEN_URL = 'https://www.kraftfahrer-mieten.com/vermittlungsbedingungen';

export const NoShowNotice = ({ customerName, company, einsatzort, zeitraum, fahrzeugtyp }: NoShowNoticeProps) => {
  const name = (customerName || '').trim();
  return (
    <BaseEmail previewText="Mitteilung: Fahrer ist nicht erschienen">
      <Heading style={{ ...textStyles.h1, color: '#d32f2f' }}>Fahrer nicht erschienen</Heading>
      <Text style={textStyles.paragraph}>{name ? `Guten Tag ${name},` : 'Guten Tag,'}</Text>
      <Text style={textStyles.paragraph}>
        der für Ihren Einsatz vorgesehene selbstständige Fahrer ist nicht erschienen. Wir bemühen uns umgehend um eine Ersatzlösung und melden uns kurzfristig bei Ihnen.
      </Text>
      <Section style={boxStyles.info}>
        {company ? <Text style={textStyles.paragraph}><strong>Auftraggeber:</strong> {company}</Text> : null}
        <Text style={textStyles.paragraph}><strong>Einsatzort:</strong> {einsatzort || 'Nicht angegeben'}</Text>
        <Text style={textStyles.paragraph}><strong>Zeitraum:</strong> {zeitraum || 'Nicht angegeben'}</Text>
        <Text style={textStyles.paragraph}><strong>Fahrzeug:</strong> {fahrzeugtyp || 'Nicht angegeben'}</Text>
      </Section>
      <Text style={textStyles.muted}>
        Für diesen Einsatz entstehen Ihnen keine Kosten für nicht erbrachte Einsatztage. Weitere Regelungen: <Link href={BEDINGUNGEN_URL}>Vermittlungsbedingungen</Link>.
      </Text>
    </BaseEmail>
  );
};

export default NoShowNotice;
