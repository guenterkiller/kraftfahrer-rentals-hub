// Einsatzzeiten in deutscher Ortszeit (Europe/Berlin), geräteunabhängig.
// Identische Kopie: src/lib/berlinTime.ts (Gleichheit per Test geprüft).

const TZ = "Europe/Berlin";

/** Versatz von Europe/Berlin zu UTC in Minuten für einen Zeitpunkt. */
function berlinOffsetMinutes(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - utcMs) / 60000);
}

/** "YYYY-MM-DDTHH:mm" als deutsche Ortszeit → ISO-Zeitpunkt (UTC). null bei ungültiger Eingabe. */
export function berlinLocalToUtcIso(local: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(local ?? "").trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  let ts = wall - berlinOffsetMinutes(wall) * 60000;
  ts = wall - berlinOffsetMinutes(ts) * 60000;
  return new Date(ts).toISOString();
}

/** ISO-Zeitpunkt → "YYYY-MM-DDTHH:mm" in deutscher Ortszeit (für Eingabefelder). */
export function utcIsoToBerlinLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  return new Date(t + berlinOffsetMinutes(t) * 60000).toISOString().slice(0, 16);
}

/** "22.10.2026, 07:00 Uhr" in deutscher Ortszeit. */
export function formatBerlinDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.toLocaleString("de-DE", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })} Uhr`;
}

/** Altbestand ohne Uhrzeit: nur das eingegebene Kalenderdatum (gespeichert als UTC-Tagesbeginn). */
function formatLegacyDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("de-DE", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
}

export const TIME_NOT_ENTERED_NOTE = "Uhrzeit nicht erfasst – Einsatzzeit nach Absprache";

/** Einheitliche Darstellung Einsatzbeginn/-ende für E-Mails, Annahmeseite, Nachweis und PDF. */
export function formatAssignmentPeriod(
  start: string | null | undefined,
  end: string | null | undefined,
  timesEntered: boolean | null | undefined,
): string | null {
  if (!start && !end) return null;
  if (timesEntered === true) {
    const s = formatBerlinDateTime(start), e = formatBerlinDateTime(end);
    if (s && e) return `${s} – ${e}`;
    if (s) return `ab ${s}`;
    return e ? `bis ${e}` : null;
  }
  const s = formatLegacyDate(start), e = formatLegacyDate(end);
  const range = s && e ? `${s} – ${e}` : s ? `ab ${s}` : `bis ${e}`;
  return `${range} (${TIME_NOT_ENTERED_NOTE})`;
}

/**
 * Maßgeblicher Einsatzbeginn für Fristen (Annahmelink).
 * Mit erfasster Uhrzeit: tatsächlicher Beginn. Altbestand ohne Uhrzeit: Beginn des
 * Einsatztages in deutscher Ortszeit (00:00 Uhr Berlin), kein künstlicher Uhrzeitwert.
 */
export function deadlineStartIso(start: string | null | undefined, timesEntered: boolean | null | undefined): string | null {
  if (!start) return null;
  if (timesEntered === true) return start;
  const d = new Date(start);
  if (isNaN(d.getTime())) return null;
  return berlinLocalToUtcIso(`${d.toISOString().slice(0, 10)}T00:00`);
}
