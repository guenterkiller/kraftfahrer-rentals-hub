import { describe, expect, it } from "vitest";
// @ts-ignore Node-Typen je nach Konfiguration nicht eingebunden; Vitest läuft unter Node.
import { readFileSync } from "node:fs";
import { getDriverCompensation } from "../driverCompensation";

const weeklyLines: [string, string][] = [
  ["Einsatzzeitraum", "16.11.2026 – 18.12.2026"],
  ["Führerscheinklasse", "CE"],
  ["Fahrzeugart", "TEST LKW CE"],
  ["Einsatzbeschreibung / Kundenanforderungen", "TEST Abrollkipper mit oder ohne Anhänger"],
  ["Einsatzort / Treffpunkt (vom Auftraggeber bestätigt)", "TEST Hafenstraße 12, 66333 Völklingen"],
  ["Vergütete Einheiten", "5 Wochen (je Montag–Freitag; dazwischenliegende Wochenenden nicht vergütet angesetzt) (aus ausdrücklich gespeicherten vergüteten Einheiten)"],
  ["Fahrerhonorar netto vor Provision (gesamter Auftrag)", "1.400,00 € je Woche × 5 = 7.000,00 €"],
  ["Vermittlungsprovision", "20 % = 1.400,00 € netto"],
  ["Verbleibende Nettovergütung (gesamter Auftrag, zzgl. provisionsfreier An-/Abfahrt)", "5.600,00 €"],
  ["Tarif", "Kundenpreis 1.645,00 € – darf nicht übernommen werden"],
];

describe("Vergütungsbox aus gespeicherter Angebotskopie", () => {
  it("Server und Website verwenden exakt dasselbe Lesemodul", () => {
    const normalize = (source: string) => source.split("\n").filter((line) => !line.startsWith("// Spiegel:")).join("\n");
    expect(normalize(readFileSync("src/lib/driverCompensation.ts", "utf8")))
      .toBe(normalize(readFileSync("supabase/functions/_shared/driver-compensation.ts", "utf8")));
  });

  it("zeigt 5.600,00 € Gesamtvergütung und 1.120,00 € je 5 Einsatztage Mo–Fr mit CE, Tätigkeit und Ort", () => {
    const result = getDriverCompensation(weeklyLines, true);
    expect(result).toMatchObject({
      totalNet: "5.600,00 €",
      unitNet: "1.120,00 €",
      unitNetLabel: "netto je Woche (5 Einsatztage, Mo–Fr)",
      billing: "5 Wochen à 5 Einsatztage (Montag bis Freitag)",
      period: "16.11.2026 – 18.12.2026",
      license: "CE",
      vehicle: "TEST LKW CE",
      activity: "TEST Abrollkipper mit oder ohne Anhänger",
      place: "TEST Hafenstraße 12, 66333 Völklingen",
    });
    expect(JSON.stringify(result)).not.toMatch(/1\.645|7\.000|20 %|Kundenpreis|Provision/);
    expect(result?.totalNet).not.toBe("1.316,00 €");
  });

  it("fehlende oder nicht freigegebene Vergütung erzeugt keine Box", () => {
    expect(getDriverCompensation(weeklyLines, false)).toBeNull();
    expect(getDriverCompensation(weeklyLines.filter(([label]) => !label.startsWith("Verbleibende Nettovergütung")), true)).toBeNull();
    expect(getDriverCompensation(weeklyLines.map(([label, value]) => [label, label.startsWith("Verbleibende") ? "Nicht bestimmt" : value]), true)).toBeNull();
  });

  it("erfundet bei nicht glatt teilbarem Gesamtbetrag keinen gerundeten Einzelbetrag", () => {
    const lines = weeklyLines.map(([label, value]) => [label, label.startsWith("Verbleibende") ? "100,00 €" : label.startsWith("Vergütete Einheiten") ? "3 Wochen (je Montag–Freitag)" : label.startsWith("Fahrerhonorar") ? "40,00 € je Woche × 3 = 120,00 €" : value]) as [string, string][];
    const result = getDriverCompensation(lines, true);
    expect(result?.totalNet).toBe("100,00 €");
    expect(result?.unitNet).toBeNull();
  });
});
