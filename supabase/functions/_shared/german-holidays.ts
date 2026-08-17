// Gesetzliche Feiertage (bundesweit) – reine Hilfsfunktion, keine Preislogik.
const pad = (n: number) => String(n).padStart(2, '0');

const easterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
};

const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000);
const iso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** Bundesweite gesetzliche Feiertage als ISO-Datumsliste */
export const germanHolidays = (year: number): Record<string, string> => {
  const e = easterSunday(year);
  const map: Record<string, string> = {
    [`${year}-01-01`]: 'Neujahr',
    [`${year}-05-01`]: 'Tag der Arbeit',
    [`${year}-10-03`]: 'Tag der Deutschen Einheit',
    [`${year}-12-25`]: '1. Weihnachtstag',
    [`${year}-12-26`]: '2. Weihnachtstag',
    [iso(addDays(e, -2))]: 'Karfreitag',
    [iso(addDays(e, 1))]: 'Ostermontag',
    [iso(addDays(e, 39))]: 'Christi Himmelfahrt',
    [iso(addDays(e, 50))]: 'Pfingstmontag',
  };
  return map;
};

export interface WeekendHolidayInfo {
  hasSaturday: boolean;
  hasSunday: boolean;
  holidays: string[]; // z. B. "01.05.2026 (Tag der Arbeit)"
  affected: boolean;
}

const DE_DATE = (d: Date) => `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;

/** Wochenend-/Feiertagstage eines Zeitraums mit Datum und Zuschlagssatz. */
export interface SurchargeDay {
  /** ISO-Datum */
  date: string;
  /** z. B. "Sa, 29.08.2026" oder "Fr, 01.05.2026 (Tag der Arbeit)" */
  label: string;
  /** Zuschlag in Prozent (25 oder 50) */
  percent: 25 | 50;
  kind: 'samstag' | 'sonntag' | 'feiertag';
}

/** Prüft, ob ein Einsatzzeitraum (ISO-Daten) Samstag, Sonntag oder Feiertag enthält. */
export const analyzeWeekendHoliday = (startISO: string, endISO: string): WeekendHolidayInfo => {
  const empty: WeekendHolidayInfo = { hasSaturday: false, hasSunday: false, holidays: [], affected: false };
  if (!startISO) return empty;
  const start = new Date(`${startISO}T00:00:00Z`);
  const end = new Date(`${(endISO || startISO)}T00:00:00Z`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return empty;

  const info: WeekendHolidayInfo = { hasSaturday: false, hasSunday: false, holidays: [], affected: false };
  const holidayCache: Record<number, Record<string, string>> = {};

  for (let d = start; d <= end; d = addDays(d, 1)) {
    const dow = d.getUTCDay();
    if (dow === 6) info.hasSaturday = true;
    if (dow === 0) info.hasSunday = true;
    const y = d.getUTCFullYear();
    holidayCache[y] = holidayCache[y] || germanHolidays(y);
    const name = holidayCache[y][iso(d)];
    if (name) {
      const label = `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${y} (${name})`;
      if (!info.holidays.includes(label)) info.holidays.push(label);
    }
  }
  info.affected = info.hasSaturday || info.hasSunday || info.holidays.length > 0;
  return info;
};

const DOW_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/**
 * Liefert alle Samstage, Sonntage und gesetzlichen Feiertage im Einsatzzeitraum
 * mit dem jeweils geltenden Zuschlagssatz (Sa 25 %, So/Feiertag 50 %).
 */
export const listSurchargeDays = (startISO: string, endISO: string): SurchargeDay[] => {
  if (!startISO) return [];
  const start = new Date(`${startISO}T00:00:00Z`);
  const end = new Date(`${(endISO || startISO)}T00:00:00Z`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];

  const days: SurchargeDay[] = [];
  const holidayCache: Record<number, Record<string, string>> = {};

  for (let d = start; d <= end; d = addDays(d, 1)) {
    const y = d.getUTCFullYear();
    holidayCache[y] = holidayCache[y] || germanHolidays(y);
    const holidayName = holidayCache[y][iso(d)];
    const dow = d.getUTCDay();
    const prefix = `${DOW_SHORT[dow]}, ${DE_DATE(d)}`;

    if (holidayName) {
      days.push({ date: iso(d), label: `${prefix} (${holidayName})`, percent: 50, kind: 'feiertag' });
    } else if (dow === 0) {
      days.push({ date: iso(d), label: prefix, percent: 50, kind: 'sonntag' });
    } else if (dow === 6) {
      days.push({ date: iso(d), label: prefix, percent: 25, kind: 'samstag' });
    }
  }
  return days;
};

/** Zuschlagsbetrag netto für einen Tagessatz. */
export const surchargeAmount = (netto: number, percent: number): number =>
  Math.round(netto * (1 + percent / 100) * 100) / 100;
