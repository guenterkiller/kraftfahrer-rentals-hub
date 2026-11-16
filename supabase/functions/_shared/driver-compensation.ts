// Liest ausschließlich die gespeicherte Angebotskopie. Keine Kundenpreise und keine Neuberechnung der Provision.
// Spiegel: src/lib/driverCompensation.ts (Gleichheit durch Tests geprüft).
export type DriverCompensation = {
  totalNet: string;
  unitNet: string | null;
  unitNetLabel: string | null;
  billing: string | null;
  period: string;
  license: string;
  vehicle: string;
  activity: string;
  place: string;
};

type Line = [string, string];

const NET_SOURCE = /^(Verbleibende Nettovergütung|Verbleibende Fahrervergütung netto|Nettovergütung des selbstständigen Fahrers)/;
const EURO_AMOUNT = /^-?[\d.]+,\d{2}\s?€$/;
const pick = (lines: Line[], prefix: string) => lines.find(([label]) => label.startsWith(prefix))?.[1]?.trim() ?? "";

function euroCents(value: string): number | null {
  const normalized = value.replace(/\u00a0/g, " ").replace(/\s?€$/, "").replace(/\./g, "").replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? Math.round(amount * 100) : null;
}

function formatEuro(cents: number): string {
  return `${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/** Gesamtbetrag kommt aus der Angebotskopie; der Einzelbetrag ist nur eine exakt teilbare Ausweisung desselben Betrags. */
export function getDriverCompensation(lines: Line[], bindingAllowed: boolean): DriverCompensation | null {
  const totalNet = lines.find(([label]) => NET_SOURCE.test(label))?.[1]?.trim().replace(/\u00a0/g, " ") ?? "";
  if (!bindingAllowed || !EURO_AMOUNT.test(totalNet)) return null;

  const unitsLine = pick(lines, "Vergütete Einheiten");
  const rateLine = pick(lines, "Fahrerhonorar netto vor Provision");
  const unit = rateLine.match(/ je (Einsatztag|Woche|Stunde) ×/)?.[1] ?? "";
  const unitsRaw = rateLine.match(/×\s*(\d+(?:[.,]\d+)?)\s*=/)?.[1] ?? unitsLine.match(/^(\d+(?:[.,]\d+)?)/)?.[1] ?? "";
  const units = Number(unitsRaw.replace(",", "."));
  const totalCents = euroCents(totalNet);
  const perUnitCents = totalCents !== null && Number.isFinite(units) && units > 0 ? totalCents / units : null;
  const unitNet = perUnitCents !== null && Number.isInteger(perUnitCents) ? formatEuro(perUnitCents) : null;
  const mondayFriday = /Montag[–-]Freitag/.test(unitsLine);
  const fiveBillableDays = /je 5 (abrechenbare|abrechenbaren) Tage/.test(unitsLine);

  let billing: string | null = null;
  let unitNetLabel: string | null = null;
  if (Number.isFinite(units) && units > 0 && unit === "Woche") {
    const weekWord = units === 1 ? "Woche" : "Wochen";
    billing = `${units} ${weekWord} à 5 Einsatztage${mondayFriday ? " (Montag bis Freitag)" : fiveBillableDays ? " (abrechenbare Einsatztage)" : ""}`;
    unitNetLabel = `netto je Woche (5 Einsatztage${mondayFriday ? ", Mo–Fr" : ""})`;
  } else if (Number.isFinite(units) && units > 0 && unit === "Einsatztag") {
    billing = `${units} vergütete ${units === 1 ? "Einsatztag" : "Einsatztage"}`;
    unitNetLabel = "netto je Einsatztag";
  } else if (Number.isFinite(units) && units > 0 && unit === "Stunde") {
    billing = `${units} vergütete ${units === 1 ? "Stunde" : "Stunden"}`;
    unitNetLabel = "netto je Stunde";
  } else if (unitsLine) {
    billing = unitsLine.split(" (aus ")[0];
  }

  return {
    totalNet,
    unitNet,
    unitNetLabel: unitNet ? unitNetLabel : null,
    billing,
    period: pick(lines, "Einsatzzeitraum"),
    license: pick(lines, "Führerscheinklasse"),
    vehicle: pick(lines, "Fahrzeugart"),
    activity: pick(lines, "Einsatzbeschreibung"),
    place: pick(lines, "Einsatzort / Treffpunkt"),
  };
}
