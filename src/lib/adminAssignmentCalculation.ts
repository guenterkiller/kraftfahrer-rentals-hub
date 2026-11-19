import { germanHolidays } from "./germanHolidays";

const DAY_MS = 86_400_000;
const CE_WEEKLY_RATE = 1645;
const CE_REMAINING_DAY_RATE = 329;
const CE_COMMISSION_PCT = 20;

const isoDate = (value: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
};

const isoOf = (date: Date): string => date.toISOString().slice(0, 10);

export function calendarDayCount(startDate: string, endDate: string): number | null {
  const start = isoDate(startDate);
  const end = isoDate(endDate);
  if (!start || !end || end < start) return null;
  return Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
}

/** Reguläre Einsatztage: Montag–Freitag ohne bundesweite gesetzliche Feiertage. */
export function countRegularMondayFridayDays(startDate: string, endDate: string): number | null {
  const start = isoDate(startDate);
  const end = isoDate(endDate);
  if (!start || !end || end < start) return null;

  let count = 0;
  for (let time = start.getTime(); time <= end.getTime(); time += DAY_MS) {
    const date = new Date(time);
    const weekday = date.getUTCDay();
    if (weekday >= 1 && weekday <= 5 && !germanHolidays(date.getUTCFullYear())[isoOf(date)]) count += 1;
  }
  return count;
}

/** Nur vollständige, feiertagsfreie Mo–Fr-Wochen erhalten den CE-Wochensatz. */
export function fullMondayFridayWeeks(startDate: string, endDate: string): number | null {
  const start = isoDate(startDate);
  const end = isoDate(endDate);
  const days = calendarDayCount(startDate, endDate);
  if (!start || !end || days === null) return null;
  if (start.getUTCDay() !== 1 || end.getUTCDay() !== 5 || (days + 2) % 7 !== 0) return 0;

  const weeks = (days + 2) / 7;
  return countRegularMondayFridayDays(startDate, endDate) === weeks * 5 ? weeks : 0;
}

export interface CeAssignmentCalculation {
  regularDays: number;
  rateType: "daily" | "weekly";
  rateValue: number;
  paidUnits: number;
  grossCents: number;
  commissionCents: number;
  totalNetCents: number;
  weeklyNetCents: number;
  dailyNetCents: number;
}

/**
 * CE-Fahrerhonorar aus der vorhandenen Vergütungsgrundlage; Provision genau einmal.
 * Volle Mo–Fr-Wochen: 1.645 € vor 20 %. Restzeiträume: 329 € je regulärem Tag vor 20 %.
 */
export function calculateCeAssignmentRemuneration(startDate: string, endDate: string): CeAssignmentCalculation | null {
  const regularDays = countRegularMondayFridayDays(startDate, endDate);
  if (regularDays === null || regularDays === 0) return null;

  const fullWeeks = fullMondayFridayWeeks(startDate, endDate) ?? 0;
  const rateType = fullWeeks > 0 ? "weekly" : "daily";
  const rateValue = fullWeeks > 0 ? CE_WEEKLY_RATE : CE_REMAINING_DAY_RATE;
  const paidUnits = fullWeeks > 0 ? fullWeeks : regularDays;
  const grossCents = Math.round(rateValue * 100) * paidUnits;
  const commissionCents = Math.round(grossCents * CE_COMMISSION_PCT / 100);

  return {
    regularDays,
    rateType,
    rateValue,
    paidUnits,
    grossCents,
    commissionCents,
    totalNetCents: grossCents - commissionCents,
    weeklyNetCents: Math.round(CE_WEEKLY_RATE * 100 * (100 - CE_COMMISSION_PCT) / 100),
    dailyNetCents: Math.round(CE_REMAINING_DAY_RATE * 100 * (100 - CE_COMMISSION_PCT) / 100),
  };
}

/** Vorhandene Einheiten für die übrigen Dialogtarife; Stunden bleiben manuell erforderlich. */
export function automaticPaidUnits(
  tarifType: unknown,
  rateType: "hourly" | "daily" | "weekly",
  startDate: string,
  endDate: string,
): number | null {
  if (tarifType === "lkw_ce_woche") return calculateCeAssignmentRemuneration(startDate, endDate)?.paidUnits ?? null;
  if (rateType === "weekly") {
    const weeks = fullMondayFridayWeeks(startDate, endDate);
    return weeks && weeks > 0 ? weeks : null;
  }
  if (rateType !== "daily") return null;
  if (tarifType === "fernfahrer" || tarifType === "event") return calendarDayCount(startDate, endDate);
  return countRegularMondayFridayDays(startDate, endDate);
}

/** Liest ausschließlich vorhandene Datumsangaben aus dem gespeicherten Auftragszeitraum. */
export function parseAssignmentPeriod(value: unknown): { startDate: string; endDate: string } {
  const text = String(value ?? "");
  const german = [...text.matchAll(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g)].map((match) =>
    `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`);
  const iso = text.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? [];
  const dates = german.length > 0 ? german : iso;
  const startDate = dates[0] && isoDate(dates[0]) ? dates[0] : "";
  const endCandidate = dates[1] ?? dates[0] ?? "";
  const endDate = endCandidate && isoDate(endCandidate) ? endCandidate : "";
  return { startDate, endDate };
}
