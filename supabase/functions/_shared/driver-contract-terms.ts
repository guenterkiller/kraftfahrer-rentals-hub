// Vertragsbedingungen für die verbindliche Fahrerannahme.
// WORTGLEICH zu src/lib/driverContractTerms.ts halten (Test prüft Gleichheit).
// Keine Imports – Datei wird auch vom Frontend-Test gelesen.

export const DRIVER_CONTRACT_VERSION = "2026-10-15";

export const BINDING_CONSENT_TEXT =
  "Ich habe die oben dargestellten Auftragsdaten und Vertragsbedingungen vollständig gelesen und nehme den Auftrag zu diesen Bedingungen als selbstständiger Unternehmer verbindlich an.";

export type CommissionPct = 20 | 25;

export function normalizeCommissionPct(v: unknown): CommissionPct {
  return Number(v) === 25 ? 25 : 20;
}

export function buildDriverContractSections(commissionPct: CommissionPct): { title: string; paragraphs: string[] }[] {
  const art = commissionPct === 25 ? "Sonderauftrag" : "normaler Auftrag";
  return [
    {
      title: "1. Vermittlungsprovision",
      paragraphs: [
        `Für diesen Auftrag (${art}) beträgt die Vermittlungsprovision ${commissionPct} %. Für normale Aufträge gilt ein Provisionssatz von 20 %, für Sonderaufträge von 25 %.`,
        "Berechnungsgrundlage sind sämtliche vereinbarten Nettovergütungen aus der Fahrleistung, einschließlich Mehrstunden und einsatzbezogener Zuschläge.",
        "An- und Abfahrtskosten sind provisionsfrei.",
      ],
    },
    {
      title: "2. Zahlungsbedingungen",
      paragraphs: [
        "Die Auszahlung an den Fahrer erfolgt grundsätzlich nach Eingang der entsprechenden Zahlung des Bestellers bei Fahrerexpress.",
        "Bei längeren Aufträgen kann eine wöchentliche Abrechnung individuell vereinbart werden.",
        "Individuelle Vereinbarungen müssen ausdrücklich dokumentiert werden.",
      ],
    },
    {
      title: "3. Leistungsbericht",
      paragraphs: [
        "Jeder Fahrer muss mit seiner Rechnung den zugehörigen Leistungsbericht einreichen.",
        "Der Leistungsbericht muss vom Besteller unterschrieben und abgestempelt sein.",
        "Ohne ordnungsgemäßen Leistungsbericht erfolgt keine Zahlungsfreigabe.",
      ],
    },
    {
      title: "4. Geltende Bedingungen",
      paragraphs: [
        "Ergänzend gelten die Fahrer-Vermittlungsbedingungen von Fahrerexpress in der zum Zeitpunkt der Annahme gültigen Fassung (https://www.kraftfahrer-mieten.com/fahrer-vermittlungsbedingungen). Der Einsatz erfolgt als selbstständiger Unternehmer; es handelt sich nicht um Arbeitnehmerüberlassung.",
      ],
    },
  ];
}

export function buildDriverContractText(commissionPct: CommissionPct): string {
  return buildDriverContractSections(commissionPct)
    .map((s) => `${s.title}\n${s.paragraphs.join("\n")}`)
    .join("\n\n");
}
