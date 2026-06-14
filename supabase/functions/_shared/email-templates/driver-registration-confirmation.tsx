import { Heading, Text, Section } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { BaseEmail, colors, boxStyles, textStyles, getBoxProps, getTextProps } from './base-email.tsx';

interface DriverRegistrationConfirmationProps {
  driverName: string;
}

export const DriverRegistrationConfirmation = ({
  driverName,
}: DriverRegistrationConfirmationProps) => (
  <BaseEmail previewText="Willkommen bei der Fahrerexpress-Agentur – Registrierung bestätigt">
    <Text {...getTextProps({ ...textStyles.paragraph, fontSize: '16px', marginBottom: '10px' })}>🚛 Willkommen bei der Fahrerexpress-Agentur</Text>

    <Heading {...getTextProps(textStyles.heading2, 'heading')}>
      Sehr geehrte/r {driverName},
    </Heading>

    <Text {...getTextProps(textStyles.paragraph)}>
      vielen Dank für Ihre Registrierung als selbstständige/r Kraftfahrer/in bei der Fahrerexpress-Agentur.
      <strong> Ihre Registrierung war erfolgreich.</strong>
    </Text>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>✅ So geht es weiter</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Wir prüfen Ihr Profil. Sobald ein passender Einsatz verfügbar ist, erhalten Sie von uns ein konkretes Auftragsangebot mit allen wichtigen Informationen.
      </Text>
    </Section>

    <Section {...getBoxProps(boxStyles.infoBox)}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>📌 Vergütung & Vermittlungsanteil</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Die konkrete Vergütung und der Vermittlungsanteil ergeben sich immer aus dem jeweiligen Auftragsangebot vor Einsatzbeginn.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        Bei regulären Standardaufträgen beträgt der Vermittlungsanteil in der Regel 20 % der vereinbarten Netto-Arbeitsvergütung. Der Fahreranteil beträgt entsprechend 80 %.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        Die Arbeitsvergütung umfasst insbesondere Tagessätze, Überstunden und einsatzbezogene Zuschläge.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        Bei Sonder-, Projekt-, Pauschal-, kurzfristigen oder besonders aufwendigen Einsätzen (z. B. Express-, Event-, Wochenend- oder Überführungsaufträgen) kann der Vermittlungsanteil bis zu 25 % betragen. Der Fahreranteil beträgt entsprechend mindestens 75 %.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        Bei Pauschal- oder Sonderaufträgen kann sich diese Aufteilung auf den vereinbarten Gesamt-Einsatzwert oder die Gesamtpauschale beziehen, wenn dies im konkreten Auftragsangebot so mitgeteilt wird.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        Fahrtkosten, Übernachtungskosten, Maut, Parkgebühren oder sonstige Auslagen werden gesondert behandelt und nur berücksichtigt, wenn sie vorab vereinbart oder freigegeben wurden.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        Nachweisbare und freigegebene Auslagen können separat erstattet oder in das konkrete Auftragsangebot eingerechnet werden.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        Der Vermittlungsanteil wird vom vereinbarten Netto-Auftragswert der reinen Fahrerdienstleistung abgezogen. Sie stellen Fahrerexpress Ihre Rechnung bereits nach Abzug dieses Vermittlungsanteils – der Anteil wird also nicht nachträglich von einer vollen Fahrerrechnung einbehalten. Auslagen werden gesondert behandelt und nicht vom Vermittlungsanteil gekürzt.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        Maßgeblich ist immer das konkrete Auftragsangebot vor Einsatzbeginn. Ein Anspruch auf einen bestimmten Prozentsatz eines öffentlich sichtbaren Webseitenpreises besteht nicht.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        Sie entscheiden als selbstständige/r Unternehmer/in eigenverantwortlich, ob Sie das konkrete Angebot zu den genannten Konditionen annehmen.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0', fontStyle: 'italic' })}>
        Diese Informationen sind ausschließlich für registrierte Fahrer bestimmt und nicht für Auftraggeber oder öffentliche Preisangaben vorgesehen.
      </Text>
    </Section>

    <Section {...getBoxProps({ ...boxStyles.highlightBox, backgroundColor: '#f0fdf4', borderColor: '#16a34a' })}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: '#16a34a' }, 'small-heading')}>📄 Rechtsgrundlage</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Für die Zusammenarbeit gelten unsere Vermittlungsbedingungen für Fahrer.
        Bitte lesen Sie diese vor Annahme des ersten Einsatzes.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '10px', marginBottom: '0' })}>
        👉 <a href="https://www.kraftfahrer-mieten.com/fahrer-vermittlungsbedingungen" style={{ color: colors.primary, textDecoration: 'underline' }}>
          Vermittlungsbedingungen für Fahrer ansehen
        </a>
      </Text>
    </Section>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>📞 Kontakt</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        E-Mail: info@kraftfahrer-mieten.com<br />
        Telefon: 01577 1442285
      </Text>
    </Section>

    <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '30px', marginBottom: '0' })}>
      Mit freundlichen Grüßen<br />
      <strong>Ihr Fahrerexpress-Team</strong>
    </Text>
  </BaseEmail>
);

export default DriverRegistrationConfirmation;
