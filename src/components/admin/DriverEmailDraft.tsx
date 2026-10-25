import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { calculateOfferRemuneration, formatOfferCents, type OfferRemunerationInput } from '@/lib/driverEmailRemuneration';

export type DriverEmailKind = 'registration-admin' | 'registration-driver' | 'approval-driver' | 'offer' | 'approval-admin';
export const EMAIL_DRAFT_NAMES: Record<DriverEmailKind, string> = {
  'registration-admin': 'Neue Registrierung · Verwaltung',
  'registration-driver': 'Registrierungsbestätigung · Fahrer',
  'approval-driver': 'Manuelle Freischaltung · Fahrer',
  offer: 'Auftragsangebot · Fahrer',
  'approval-admin': 'Erfolgte Freischaltung · Verwaltung',
};
export type OfferReplyMode = 'availability' | 'broadcast' | 'phone';

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return <table className="w-full text-sm"><tbody>{rows.map(([label, value]) => <tr className="border-b border-border last:border-0" key={label}><th scope="row" className="w-3/5 py-2 pr-3 text-left align-top font-medium break-words">{label}</th><td className="py-2 text-right align-top break-words">{value}</td></tr>)}</tbody></table>;
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-t border-border pt-4 space-y-2"><h3 className="text-base font-semibold">{title}</h3>{children}</section>;
}
function InertAction({ children }: { children: ReactNode }) {
  return <Button type="button" aria-disabled="true" onClick={event => event.preventDefault()} className="h-auto min-h-10 whitespace-normal w-full sm:w-auto">{children}</Button>;
}
export function DriverEmailDraft({ kind, input, mode = 'availability', matching = true }: { kind: DriverEmailKind; input: OfferRemunerationInput; mode?: OfferReplyMode; matching?: boolean }) {
  const result = calculateOfferRemuneration(input);
  if (kind === 'offer' && !result.ok) return <div role="alert" className="border-l-4 border-destructive bg-muted p-5 space-y-3"><h2 className="text-lg font-semibold">Auftragsangebot nicht freigegeben</h2><ul className="list-disc pl-5 text-sm space-y-2">{result.errors.map(error => <li key={error}>{error}</li>)}</ul></div>;
  return <article aria-label={EMAIL_DRAFT_NAMES[kind]} className="max-w-[640px] mx-auto border border-border rounded-md overflow-hidden bg-card text-card-foreground">
    <header className="px-5 py-4 border-b-4 border-primary bg-secondary"><p className="font-bold text-lg">Fahrerexpress-Agentur – Günter Killer</p><p className="text-sm text-muted-foreground">Vermittlung selbstständiger Fahrer</p></header>
    <div className="p-5 space-y-4 text-sm leading-relaxed">
      <h2 className="text-xl font-semibold">{EMAIL_DRAFT_NAMES[kind]}</h2>
      {kind === 'registration-driver' && <>
        <p>Hallo {'{{Vorname}}'},</p><p>willkommen bei der Fahrerexpress-Agentur – schön, dass Sie dabei sind! Ihre Registrierung als selbstständige/r Fahrer/in ist bei uns eingegangen.</p>
        <Section title="So geht es weiter"><p>Fahrerexpress prüft Ihr Profil und Ihre Unterlagen. Ausschließlich der Administrator schaltet Sie nach erfolgreicher Prüfung manuell frei. Registrierung und Vertragsannahme bedeuten keine Freischaltung. Erst danach können Sie passende Auftragsangebote per E-Mail mit Einsatzort, Zeitraum und Vergütung erhalten. Sie entscheiden frei, ob Sie ein Angebot annehmen oder ablehnen möchten.</p></Section>
        <Section title="Ihr persönlicher Vermittlungsvertrag"><p>Bitte lesen Sie den vollständigen Vermittlungsvertrag auf Ihrer persönlichen Seite und nehmen Sie ihn dort an oder lehnen Sie ihn ab. Der Link ist 14 Tage gültig. Ein Klick in dieser E-Mail allein entscheidet nichts.</p><InertAction>Vermittlungsvertrag prüfen</InertAction></Section>
        <p>Bei Fragen erreichen Sie uns jederzeit unter <a className="underline" href="mailto:info@kraftfahrer-mieten.com">info@kraftfahrer-mieten.com</a> oder telefonisch unter <a className="underline" href="tel:+4915771442285">01577 1442285</a>.</p><p>Wir freuen uns auf die Zusammenarbeit!<br />Ihr Fahrerexpress-Team</p>
      </>}
      {kind === 'registration-admin' && <>
        <p>Ein neuer Fahrer (selbstständiger Unternehmer) hat sich über das Portal registriert.</p>
        <Section title="Kontaktdaten"><Rows rows={['Vorname', 'Nachname', 'E-Mail', 'Telefon'].map(label => [label, `{{${label}}}`])} /></Section>
        <Section title="Standort Fahrer / An- und Abfahrt"><Rows rows={['Straße', 'Hausnummer', 'Postleitzahl', 'Ort', 'Land'].map(label => [label, `{{${label} / nicht erfasst}}`])} /></Section>
        <Section title="Fahrerdetails"><Rows rows={['Führerscheinklassen', 'Berufserfahrung (Jahre)', 'Einsatzbereiche / Spezialisierungen', 'Regionen / Einsatzgebiet', 'Spezialanforderungen', 'Gewerbeanmeldung eingereicht', 'Fahrerkarte eingereicht'].map(label => [label, `{{${label} / nicht erfasst}}`])} /></Section>
        <Section title="Hochgeladene Dokumente"><Rows rows={['Führerschein', 'Fahrerkarte', 'Zertifikate', 'Gewerbeanmeldung'].map(label => [label, '{{Status, Anzahl; abgelehnte Dateinamen und Gründe}}'])} /></Section>
        <Section title="Nächste Schritte"><ul className="list-disc pl-5"><li>Unterlagen prüfen (Führerschein, Fahrerkarte, Zertifikate, Gewerbeanmeldung).</li><li>Fahrerstandort als Grundlage für An- und Abfahrt prüfen.</li><li>Führerscheinklassen und Einsatzbereiche prüfen.</li><li>Fahrer bei Eignung manuell freischalten.</li><li>Erst danach Aufnahme in den Verteiler für passende Auftragsangebote.</li></ul></Section><p>Registriert am: {'{{Registrierungszeitpunkt}}'}</p>
      </>}
      {kind === 'approval-driver' && <>
        <p>Hallo {'{{Vorname}}'}, Ihr Fahrerprofil wurde freigeschaltet.</p><p>{matching ? 'Es wurden passende offene Fahrergesuche gefunden. Sie erhalten dazu separate Auftragsangebote per E-Mail mit direkter Antwortmöglichkeit.' : 'Derzeit sind keine passenden offenen Fahrergesuche verfügbar. Wir melden uns, sobald passende Anfragen eingehen.'}</p>
        <Section title="Wichtig: Vermittlungsbedingungen"><p>Für die Zusammenarbeit gelten die Vermittlungsbedingungen für Fahrer. Jeder Einsatz wird Ihnen vorab einzeln angeboten – mit Einsatzort, Zeitraum, Fahrzeug, Tätigkeit, besonderen Anforderungen und vorgesehener Vergütung. Sie entscheiden bei jedem Angebot frei, ob Sie den Einsatz übernehmen möchten oder nicht.</p><p>Die konkrete Vergütung und der Vermittlungsanteil ergeben sich ausschließlich aus dem jeweiligen Auftragsangebot vor Einsatzbeginn.</p><p>Sie stellen Ihre Rechnung nach Einsatzabschluss direkt an Fahrerexpress – bereits nach Abzug des im Auftragsangebot vereinbarten Vermittlungsanteils. Dieser wird nicht nachträglich von einer vollen Fahrerrechnung einbehalten, sondern vor Rechnungsstellung vom Netto-Auftragswert der reinen Fahrer-Dienstleistung abgezogen. Ausschließlich vereinbarte An- und Abfahrtskosten sind provisionsfrei.</p></Section>
        <p>Bei Fragen: +49-1577-1442285 · info@kraftfahrer-mieten.com</p><InertAction>Keine weiteren Auftragsangebote erhalten</InertAction>
      </>}
      {kind === 'approval-admin' && <>
        <p>Ein neuer Fahrer wurde erfolgreich freigeschaltet und hat die Willkommens-E-Mail mit aktuellen Aufträgen erhalten.</p><Rows rows={['Fahrer', 'E-Mail', 'Fahrer-ID', 'Freigeschaltet am', 'Gesendete Aufträge'].map(label => [label, `{{${label}}}`])} /><p className="text-xs text-muted-foreground">Diese Benachrichtigung wurde automatisch vom Fahrerexpress-Admin-System generiert.</p>
      </>}
      {kind === 'offer' && result.ok && <>
        <p>Hallo {'{{Vorname}}'}, für Sie liegt ein passendes Auftragsangebot vor.</p>
        <Section title="Einsatzdetails"><Rows rows={['Einsatzort', 'Zeitraum', 'Fahrzeugtyp', 'Führerschein', 'Besonderheiten'].map(label => [label, `{{${label}}}`])} /></Section>
        <Section title="Aufgabenbeschreibung laut Auftrag"><p className="whitespace-pre-wrap">{'{{Auftragsbeschreibung unverändert}}'}</p>{mode !== 'availability' && <p>Die Auftragsbeschreibung wurde vom Auftraggeber übermittelt. Fahrerexpress gibt diese im Rahmen der Auftragsvermittlung unverändert weiter.</p>}</Section>
        {mode === 'broadcast' && <Section title="Anhänge zum Auftrag"><InertAction>{'{{Vorhandener Anhang}} öffnen'}</InertAction><p>Die Links sind aus Sicherheitsgründen zeitlich begrenzt gültig.</p></Section>}
        <Section title="Vorgesehene Vergütung · netto"><Rows rows={[
          ['Vereinbarte Fahrleistung', formatOfferCents(result.serviceCents)],
          ['Vereinbarte Mehrstunden', formatOfferCents(result.overtimeCents)],
          ['Vereinbarte Zuschläge', formatOfferCents(result.surchargeCents)],
          ['Provisionspflichtiger Netto-Auftragswert', formatOfferCents(result.commissionBaseCents)],
          [`Vermittlungsprovision (${result.commissionPct} %)`, `− ${formatOfferCents(result.commissionCents)}`],
          ['Nettovergütung nach Provision', formatOfferCents(result.driverNetCents)],
          ['An- und Abfahrt · provisionsfrei', formatOfferCents(result.travelCents)],
          ['Gesamte vorgesehene Nettovergütung', <strong>{formatOfferCents(result.totalCents)}</strong>],
        ]} /></Section>
        <Section title="Ihre Rückmeldung">
          {mode === 'phone' ? <><p>Rufen Sie uns an oder schreiben Sie per SMS/WhatsApp: +49-1577-1442285.</p><p>Nennen Sie kurz Ihren Namen und dass Sie den Auftrag in {'{{Einsatzort}}'} annehmen oder ablehnen möchten.</p></> : <>
            {mode === 'broadcast' && <><p>Vorrangig werden geeignete selbstständige Fahrer aus der Nähe des Einsatzortes berücksichtigt. Erst wenn sich keine geeigneten ortsnahen Fahrer melden, werden Interessenbekundungen aus anderen Regionen berücksichtigt. Bitte bekunden Sie Ihr Interesse nur, wenn Sie den Einsatzort wirtschaftlich erreichen können.</p><p>Bitte prüfen Sie die Einsatztätigkeiten und Anforderungen sorgfältig. Mit Annahme bestätigen Sie die Übernahme zu den dargestellten Einsatzdaten, Tätigkeiten, Anforderungen und Konditionen als selbstständiger Unternehmer. Auf der Bestätigungsseite bestätigen Sie die Auftragsbeschreibung erneut, bevor die Annahme wirksam wird.</p></>}
            <div className="flex flex-col gap-2 items-start"><InertAction>{mode === 'broadcast' ? 'Auftrag zu diesen Bedingungen annehmen' : 'Ich kann den Auftrag übernehmen'}</InertAction><InertAction>Ich kann nicht übernehmen</InertAction></div>
            <p>{mode === 'availability' ? 'Ihre Rückmeldung dient der Verfügbarkeitsprüfung. Die endgültige Einsatzbestätigung erfolgt separat durch Fahrerexpress.' : 'Die Annahme wird von Fahrerexpress geprüft und organisatorisch bestätigt. Maßgeblich bleiben die im Auftragsangebot dargestellten Einsatzdaten, Einsatztätigkeiten, Anforderungen und Konditionen.'}</p>
            {mode === 'availability' && <p>Diese Links sind 48 Stunden gültig.</p>}
          </>}
        </Section>
        {mode !== 'availability' && <Section title="Wichtiger Hinweis"><p>Bitte kontaktieren Sie den Auftraggeber nicht direkt. Vermittlung und Einsatzkoordination erfolgen ausschließlich über Fahrerexpress. Direkte Absprachen mit dem Auftraggeber sind nicht gestattet.</p><p>Die geltenden Fahrer-Vermittlungsbedingungen wurden Ihnen per E-Mail übermittelt. Maßgeblich ist zusätzlich das konkrete Auftragsangebot vor Einsatzbeginn.</p><InertAction>Keine weiteren Auftragsangebote erhalten</InertAction></Section>}
        <p>Rückfragen: +49 1577 1442285 · info@kraftfahrer-mieten.com</p>
      </>}
    </div>
    <footer className="px-5 py-4 bg-secondary border-t border-border text-xs leading-relaxed"><strong>Fahrerexpress-Agentur</strong><p>Inhaber: Günter Killer · Walther-von-Cronberg-Platz 12 · 60594 Frankfurt am Main</p><p>Telefon: 01577 1442285 · E-Mail: info@kraftfahrer-mieten.com · Web: www.kraftfahrer-mieten.com</p></footer>
  </article>;
}