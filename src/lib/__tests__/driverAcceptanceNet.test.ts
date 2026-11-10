import { describe, expect, it } from "vitest";
import { acceptancePageLines, NET_LABEL } from "../driverAcceptanceNet";

const v3: [string, string][] = [
  ["Fahrzeugart", "LKW CE"],
  ["Vereinbarter Satz netto", "1.400,00 € je Woche"],
  ["Fahrerhonorar netto vor Provision (gesamter Auftrag)", "1.400,00 € je Woche × 2 = 2.800,00 €"],
  ["Vermittlungsprovision", "20 % = 560,00 € netto"],
  ["Verbleibende Nettovergütung (gesamter Auftrag, zzgl. provisionsfreier An-/Abfahrt)", "2.240,00 €"],
  ["Mehrstundenpreis netto", "30,00 € je angefangene Mehrstunde"],
  ["Unterkunftsregelung", "Hotel"],
];

describe("Annahmeseite zeigt nur Nettovergütung", () => {
  it("übernimmt exakt den Endbetrag des Angebots", () => {
    const out = acceptancePageLines(v3, true);
    expect(out).toContainEqual([NET_LABEL, "2.240,00 €"]);
  });
  it("blendet Honorar vor Provision, Satz, Provision und Preise aus", () => {
    const text = JSON.stringify(acceptancePageLines(v3, true));
    expect(text).not.toMatch(/2\.800|560|1\.400|20 %|30,00/);
    expect(text).toContain("Unterkunftsregelung");
  });
  it("zeigt bei unvollständiger Vergütung keinen Betrag", () => {
    const incomplete = v3.map(([k, v]) => [k, k.startsWith("Verbleibende") ? "Nicht bestimmt – keine Zahl angegeben" : v]) as [string, string][];
    expect(acceptancePageLines(incomplete, true).some(([k]) => k === NET_LABEL)).toBe(false);
    expect(acceptancePageLines(v3, false).some(([k]) => k === NET_LABEL)).toBe(false);
  });
  it("übernimmt Altangebote (Event) mit gespeichertem Betrag", () => {
    const out = acceptancePageLines([["Agenturprovision Fahrerexpress (25 %)", "366,75 € netto"], ["Nettovergütung des selbstständigen Fahrers", "1.100,25 €"]], true);
    expect(out).toEqual([[NET_LABEL, "1.100,25 €"]]);
  });
});
