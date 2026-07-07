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
    <Heading {...getTextProps(textStyles.heading2, 'heading')}>
      Hallo {driverName},
    </Heading>

    <Text {...getTextProps(textStyles.paragraph)}>
      willkommen bei der Fahrerexpress-Agentur – schön, dass Sie dabei sind!
      Ihre Registrierung als selbstständige/r Fahrer/in ist bei uns eingegangen.
    </Text>

    <Section {...getBoxProps(boxStyles.successBox)}>
      <Heading {...getTextProps({ ...textStyles.heading3, color: colors.success }, 'small-heading')}>So geht es weiter</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, margin: '0' })}>
        Wir prüfen Ihr Profil zeitnah. Sobald ein passender Einsatz vorliegt, erhalten Sie von uns
        ein konkretes Auftragsangebot mit allen wichtigen Informationen (Einsatzort, Zeitraum,
        Vergütung). Sie entscheiden frei, ob Sie das Angebot annehmen.
      </Text>
    </Section>

    <Section {...getBoxProps({ ...boxStyles.highlightBox, backgroundColor: '#f0fdf4', borderColor: '#16a34a' })}>
      <Heading {...getTextProps(textStyles.heading3, 'small-heading')}>Fahrer-Vermittlungsbedingungen</Heading>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px', marginBottom: '0' })}>
        <strong>Vermittlungsmodell:</strong> Die Fahrerexpress-Agentur vermittelt Einsätze zwischen Auftraggebern und selbstständigen Fahrern. Es entsteht <strong>kein Arbeitsverhältnis</strong> und keine Arbeitnehmerüberlassung.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px', marginBottom: '0' })}>
        <strong>Auftragsangebot:</strong> Jedes Auftragsangebot ist lediglich ein Vermittlungsangebot. Ihre Rückmeldung „Ich kann übernehmen" gilt ausschließlich als Interessens- und Verfügbarkeitsmeldung. Ein Anspruch auf Erteilung oder Durchführung des Einsatzes entsteht dadurch nicht. Die endgültige Vergabe erfolgt ausschließlich durch Fahrerexpress.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px', marginBottom: '0' })}>
        <strong>Vergabe der Einsätze:</strong> Fahrerexpress berücksichtigt bei der Vergabe vorrangig Fahrer, die sich in räumlicher Nähe zum Einsatzort befinden, um Anfahrtszeiten und Kosten gering zu halten. Zusätzlich können Qualifikation, Verfügbarkeit, Zuverlässigkeit, bisherige Zusammenarbeit und konkrete Kundenanforderungen berücksichtigt werden. Ein Anspruch auf Zuteilung eines bestimmten Auftrags besteht nicht.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px', marginBottom: '0' })}>
        <strong>Vermittlungsanteil / Vergütung:</strong> Grundlage ist die zwischen Fahrerexpress und dem Auftraggeber vereinbarte Netto-Vergütung für die Fahrerdienstleistung. Der Fahrer erhält die vereinbarte Netto-Vergütung abzüglich des im jeweiligen Auftragsangebot ausgewiesenen Vermittlungsanteils. Maßgeblich sind ausschließlich die Angaben im konkreten Auftragsangebot vor Einsatzbeginn.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px', marginBottom: '0' })}>
        <strong>Rechnungsstellung &amp; Zahlung:</strong> Der Fahrer stellt seine Rechnung an Fahrerexpress – <strong>bereits nach Abzug des Vermittlungsanteils</strong>. Die Zahlung erfolgt nach vollständiger und ordnungsgemäßer Durchführung des Einsatzes; soweit im konkreten Auftragsangebot nichts anderes vereinbart ist, nach Zahlungseingang des Auftraggebers bei Fahrerexpress.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px', marginBottom: '0' })}>
        <strong>Auslagen:</strong> Fahrtkosten, An-/Abfahrt, Diesel, Maut, Parkgebühren, Bahn- und Hotelkosten sind <strong>nicht provisionspflichtig</strong> und werden separat behandelt.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px', marginBottom: '0' })}>
        <strong>Keine Direktabrechnung:</strong> Es darf <strong>nicht direkt mit dem Auftraggeber abgerechnet</strong> werden, und es dürfen keine eigenen Preisabsprachen mit Auftraggebern getroffen werden. Die gesamte Abrechnung läuft über Fahrerexpress.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '8px', marginBottom: '0' })}>
        <strong>Abmeldung:</strong> Sie können sich jederzeit formlos per E-Mail an info@kraftfahrer-mieten.com vom Erhalt weiterer Auftragsangebote abmelden. Die Angabe eines Abmeldegrundes ist freiwillig.
      </Text>
      <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '12px', marginBottom: '0', fontStyle: 'italic' })}>
        Bitte vor dem ersten Einsatz einmal in Ruhe durchlesen. Änderungen dieser Bedingungen werden Ihnen rechtzeitig per E-Mail mitgeteilt.
      </Text>
    </Section>

    <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '20px' })}>
      Bei Fragen erreichen Sie uns jederzeit unter{' '}
      <a href="mailto:info@kraftfahrer-mieten.com" style={{ color: colors.primary }}>info@kraftfahrer-mieten.com</a>
      {' '}oder telefonisch unter <strong>01577 1442285</strong>.
    </Text>

    <Text {...getTextProps({ ...textStyles.paragraph, marginTop: '20px', marginBottom: '0' })}>
      Wir freuen uns auf die Zusammenarbeit!<br />
      <strong>Ihr Fahrerexpress-Team</strong>
    </Text>
  </BaseEmail>
);

export default DriverRegistrationConfirmation;
