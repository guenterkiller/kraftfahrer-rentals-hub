// Vermittlungsvertrag Fahrerexpress ↔ selbstständiger Fahrer (persönliches Zustimmungsverfahren).
// WORTGLEICH zu supabase/functions/_shared/driver-mediation-contract.ts halten (Test prüft Gleichheit).
// Keine Imports – Datei wird auch vom Frontend-Test gelesen.

export const MEDIATION_CONTRACT_VERSION = "2026-10-25";
export const CONTRACT_LINK_VALID_DAYS = 14;

export const MEDIATION_ACCEPT_TEXT =
  "Ich habe den vollständigen Vermittlungsvertrag gelesen und nehme ihn als selbstständiger Unternehmer verbindlich an.";
export const MEDIATION_REJECT_TEXT =
  "Ich lehne den Vermittlungsvertrag ab. Mir ist bekannt, dass ich dann keine Vermittlungsangebote mehr erhalte.";
export const REGISTRATION_CONTRACT_NOTICE =
  "Ich habe zur Kenntnis genommen, dass ich den Vermittlungsvertrag nach der Registrierung per persönlichem Link erhalte und dort annehmen oder ablehnen kann.";

export const MEDIATION_CONTRACT_TITLE =
  "Vermittlungsvertrag zwischen Fahrerexpress und dem selbstständigen Fahrer";

export const MEDIATION_CONTRACT_PARTIES =
  "Vertragspartner: Fahrerexpress, Günter Killer, Walther-von-Cronberg-Platz 12, 60594 Frankfurt am Main („Fahrerexpress“) und der registrierte selbstständige Fahrer („Fahrer“).";

export const MEDIATION_CONTRACT_SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "§ 1 Gegenstand und Rechtsverhältnis",
    paragraphs: [
      "1. Fahrerexpress vermittelt Einsätze zwischen Auftraggebern und selbstständigen Fahrern. Es entsteht kein Arbeitsverhältnis und keine Arbeitnehmerüberlassung.",
      "2. Der Fahrer ist als selbstständiger Unternehmer tätig und verfügt über eine Gewerbeanmeldung.",
    ],
  },
  {
    title: "§ 2 Auftragsangebote",
    paragraphs: [
      "1. Jeder Einsatz wird dem Fahrer vorab einzeln angeboten. Dabei erhält er die wichtigen Informationen zu Einsatzort, Zeitraum, Fahrzeug, Tätigkeit, besonderen Anforderungen und zur vorgesehenen Vergütung. Der Fahrer entscheidet bei jedem Angebot frei, ob er den Einsatz übernehmen möchte.",
      "2. Eine Rückmeldung „Ich kann übernehmen“ gilt ausschließlich als Interessens- und Verfügbarkeitsmeldung. Ein Anspruch auf Vermittlung oder Durchführung eines bestimmten Auftrags besteht nicht.",
      "3. Fahrerexpress berücksichtigt bei der Vermittlung vorrangig Fahrer in räumlicher Nähe zum Einsatzort sowie die objektiven Anforderungen des Auftrags (z. B. Qualifikation, Führerscheinklassen, Zusatzqualifikationen) und die tatsächliche Verfügbarkeit.",
      "4. Ein einzelner Auftrag wird erst durch die ausdrückliche Annahme über den persönlichen Bestätigungslink verbindlich. Dafür gelten zusätzlich die dort angezeigten Auftragsbedingungen.",
    ],
  },
  {
    title: "§ 3 Vermittlungsprovision",
    paragraphs: [
      "1. Die Vermittlungsprovision beträgt für normale Aufträge 20 % und für Sonderaufträge 25 %. Maßgeblich ist der im jeweiligen Auftragsangebot ausgewiesene Satz.",
      "2. Berechnungsgrundlage sind sämtliche vereinbarten Nettovergütungen aus der Fahrleistung, einschließlich Mehrstunden und einsatzbezogener Zuschläge. Ausschließlich die vereinbarten An- und Abfahrtskosten sind provisionsfrei.",
    ],
  },
  {
    title: "§ 4 Rechnung und Zahlung",
    paragraphs: [
      "1. Der Fahrer stellt seine Rechnung nach Einsatzende an Fahrerexpress – bereits nach Abzug des vereinbarten Vermittlungsanteils. Bei längerfristigen Aufträgen kann ausdrücklich eine wöchentliche Abrechnung vereinbart werden.",
      "2. Der Fahrer sendet den Gewerbenachweis spätestens mit seiner ersten Rechnung an Fahrerexpress. Ohne vorliegenden Gewerbenachweis erfolgt keine Auszahlung.",
      "3. Die Auszahlung an den Fahrer erfolgt grundsätzlich nach Eingang der entsprechenden Zahlung des Bestellers bei Fahrerexpress.",
      "4. Individuelle Vereinbarungen müssen ausdrücklich dokumentiert werden.",
    ],
  },
  {
    title: "§ 5 Leistungsbericht",
    paragraphs: [
      "Jeder Fahrer muss mit seiner Rechnung den zugehörigen Leistungsbericht einreichen. Der Leistungsbericht muss vom Besteller unterschrieben und abgestempelt sein. Ohne ordnungsgemäßen Leistungsbericht erfolgt keine Zahlungsfreigabe.",
    ],
  },
  {
    title: "§ 6 Keine Direktabrechnung, Kundenschutz",
    paragraphs: [
      "1. Es darf nicht direkt mit dem Auftraggeber abgerechnet werden, und es dürfen keine eigenen Preisabsprachen mit Auftraggebern getroffen werden. Die gesamte Abrechnung läuft über Fahrerexpress.",
      "2. Für Folgeaufträge mit demselben Auftraggeber, die auf die Vermittlung durch Fahrerexpress zurückgehen, ist die Provision nach § 3 für einen Zeitraum von 12 Monaten nach Ende des vermittelten Einsatzes ebenfalls fällig – unabhängig davon, ob die Beauftragung direkt oder über Fahrerexpress erfolgt. Nicht provisionspflichtig sind Direktaufträge mit anderen Auftraggebern, die nicht durch Fahrerexpress vermittelt wurden.",
      "3. Direkt vereinbarte Folgeaufträge im Sinne von Nr. 2 sind Fahrerexpress unaufgefordert mitzuteilen.",
    ],
  },
  {
    title: "§ 7 Mitteilungspflicht und Nichterscheinen",
    paragraphs: [
      "1. Der Fahrer informiert Fahrerexpress unverzüglich, wenn absehbar ist, dass er einen angenommenen Einsatz nicht, nicht rechtzeitig oder nicht vollständig durchführen kann.",
      "2. Bei Nichterscheinen oder Absage weniger als 24 Stunden vor Einsatzbeginn schuldet der Fahrer, sofern er das Nichterscheinen oder die kurzfristige Absage zu vertreten hat, Fahrerexpress einen pauschalierten Schadensersatz in Höhe von 150,00 €, sofern er nicht nachweist, dass kein oder ein wesentlich geringerer Schaden entstanden ist. Weitergehende Schäden sind nur nach § 7a ersatzfähig; die Pauschale wird darauf angerechnet.",
    ],
  },
  {
    title: "§ 7a Haftung des Fahrers",
    paragraphs: [
      "1. Der Fahrer haftet gegenüber Fahrerexpress nach den gesetzlichen Vorschriften für Schäden, die Fahrerexpress dadurch entstehen, dass der Fahrer einen verbindlich angenommenen Einzelauftrag schuldhaft nicht antritt, vorzeitig abbricht oder nicht ordnungsgemäß ausführt. Eine Haftung besteht nur, wenn der Fahrer die Pflichtverletzung zu vertreten hat (§ 280 Abs. 1 BGB).",
      "2. Zu ersetzen ist nur der tatsächlich entstandene und von Fahrerexpress nachgewiesene Schaden. Dazu können auch Forderungen des Auftraggebers gegen Fahrerexpress gehören, soweit sie rechtlich begründet sind und auf der Pflichtverletzung des Fahrers beruhen.",
      "3. Fahrerexpress prüft Forderungen des Auftraggebers vor einer Weitergabe an den Fahrer auf ihre Berechtigung. Es gibt keine automatische Übernahme von Kundenforderungen. Fahrerexpress informiert den Fahrer unverzüglich über eine geltend gemachte Forderung und gibt ihm Gelegenheit zur Stellungnahme.",
      "4. Gesetzliche Einwendungen und Rechte des Fahrers bleiben unberührt, insbesondere der Einwand eines Mitverschuldens (§ 254 BGB) und der Nachweis, dass kein oder ein geringerer Schaden entstanden ist.",
      "5. Eine Verrechnung mit Vergütungsansprüchen des Fahrers erfolgt nicht automatisch, sondern nur nach den gesetzlichen Voraussetzungen.",
    ],
  },
  {
    title: "§ 8 Abmeldung und Vertragsende",
    paragraphs: [
      "Der Fahrer kann sich jederzeit formlos per E-Mail an info@kraftfahrer-mieten.com vom Erhalt weiterer Auftragsangebote abmelden. Die Angabe eines Grundes ist freiwillig. Bereits verbindlich angenommene Einzelaufträge bleiben davon unberührt.",
    ],
  },
  {
    title: "§ 9 Änderungen",
    paragraphs: [
      "Änderungen dieser Bedingungen werden dem Fahrer rechtzeitig per E-Mail mitgeteilt. Sie gelten erst nach erneuter ausdrücklicher Zustimmung im persönlichen Zustimmungsverfahren.",
    ],
  },
  {
    title: "§ 10 Vertraulichkeit",
    paragraphs: [
      "Diese Bedingungen sind nicht öffentlich. Sie werden dem Fahrer ausschließlich im persönlichen Zustimmungsverfahren bereitgestellt.",
    ],
  },
];

export function buildMediationContractText(): string {
  return [
    MEDIATION_CONTRACT_TITLE,
    `Fassung ${MEDIATION_CONTRACT_VERSION}`,
    MEDIATION_CONTRACT_PARTIES,
    ...MEDIATION_CONTRACT_SECTIONS.map((s) => `${s.title}\n${s.paragraphs.join("\n")}`),
  ].join("\n\n");
}

export type ContractDecision = "accept" | "reject";

/** Text, der für eine Entscheidung zu hashen und zu speichern ist. */
export function buildDecisionHashInput(p: {
  driverId: string;
  decision: ContractDecision;
  decidedAt: string;
}): string {
  const consent = p.decision === "accept" ? MEDIATION_ACCEPT_TEXT : MEDIATION_REJECT_TEXT;
  return [
    `driver:${p.driverId}`,
    `version:${MEDIATION_CONTRACT_VERSION}`,
    `decision:${p.decision}`,
    `decided_at:${p.decidedAt}`,
    `consent:${consent}`,
    buildMediationContractText(),
  ].join("\n");
}
