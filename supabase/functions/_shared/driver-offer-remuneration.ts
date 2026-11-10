// Private driver offers only (offer snapshot v3). Never import into customer mail/booking paths.
// Fahrerhonorar = auftragsbezogener Fahrersatz × vergütete Einheiten; nie aus dem Kundenpreis abgeleitet.
import { formatEuro } from './kosten-uebersicht.ts';
import { listSurchargeDays } from './german-holidays.ts';

type Data = Record<string, any>;
export type DriverOfferView = { mode: 'binding' | 'interest'; pct: 20 | 25 | null; lines: [string, string][]; missing: string[] };

/** Provisionssatz nach gespeicherter Tarifart; unbekannt/„Prüfung nötig“ → null (nie geraten). */
/** Zuschlagszeile für neue Fahrerangebote: Fernfahrer- und Eventpauschale ohne Sa-/So-/Feiertagszuschläge; übrige Tarife unverändert. */
export function driverSurchargeText(tarifType: unknown): string {
  if (tarifType === 'event') return 'Keine – Event-Tourneepauschale ohne Mehrstunden und ohne Wochenend-/Feiertagszuschläge';
  if (tarifType === 'fernfahrer') return 'Keine – Fernfahrerpauschale ohne Samstags-, Sonntags- oder Feiertagszuschläge und ohne Mehrstundenabrechnung';
  return 'Samstag 25 %, Sonn- und Feiertag 50 %';
}

export function commissionPctForTarif(tarifType: unknown): 20 | 25 | null {
  switch (String(tarifType ?? '')) {
    case 'lkw_ce': case 'lkw_ce_woche': case 'fernfahrer': return 20;
    case 'baumaschine': case 'event': case 'ueberfuehrung': case 'Überführung': return 25;
    default: return null;
  }
}

const day = (v: unknown) => typeof v === 'string' && !isNaN(Date.parse(v)) ? v.slice(0, 10) : '';

/** Kalendertage des vereinbarten Zeitraums (bisherige Tageszählung). */
export function periodDays(assignment: Data): number | null {
  const s = day(assignment?.start_date), e = day(assignment?.end_date);
  if (!s || !e) return null;
  const n = Math.round((Date.parse(e) - Date.parse(s)) / 86400000) + 1;
  return n > 0 ? n : null;
}

/**
 * Vergütete Einheiten nach bestehender Tariflogik:
 * - Tagessatz: jeder Kalendertag des Zeitraums (bisherige Zählung).
 * - Wochensatz Fernfahrer: je 5 abrechenbare Tage eine Woche, nur bei vollen Blöcken.
 * - Wochensatz CE: eine Woche = Montag–Freitag; nur exakt eine solche Woche ist eindeutig
 *   (Wochenendtage und Resttage haben keinen gespeicherten Fahrer-Tagessatz).
 * - Stunden: keine gespeicherte Stundenzahl → unbestimmt.
 */
/** Enthält der vereinbarte Zeitraum einen Samstag oder Sonntag? */
export function hasWeekend(assignment: Data): boolean {
  const s = day(assignment?.start_date), e = day(assignment?.end_date);
  if (!s || !e) return false;
  for (let t = Date.parse(s); t <= Date.parse(e); t += 86400000) { const wd = new Date(t).getUTCDay(); if (wd === 0 || wd === 6) return true; }
  return false;
}

export function paidUnits(job: Data, assignment: Data): { units: number; label: string; unit: string } | null {
  const days = periodDays(assignment);
  if (!days) return null;
  if (assignment?.rate_type === 'daily') {
    // CE-Wochentarif schließt Wochenenden aus: Kalendertage inkl. Sa/So sind dann nicht automatisch vergütete Tage.
    if (job?.tarif_type === 'lkw_ce_woche' && hasWeekend(assignment)) return null;
    return { units: days, label: days === 1 ? 'Einsatztag' : 'Einsatztage', unit: 'Einsatztag' };
  }
  if (assignment?.rate_type === 'weekly') {
    if (job?.tarif_type === 'fernfahrer') return days % 5 === 0 ? { units: days / 5, label: days === 5 ? 'Woche (5 abrechenbare Tage)' : 'Wochen (je 5 abrechenbare Tage)', unit: 'Woche' } : null;
    if (job?.tarif_type === 'lkw_ce_woche') {
      // Nur vollständige Wochen Montag–Freitag (Beginn Montag, Ende Freitag) ohne Feiertag Mo–Fr sind eindeutig.
      // Dazwischenliegende Wochenenden sind nicht im Wochensatz enthalten und ohne vereinbarten Fahrer-Tagessatz.
      // Resttage, Wochenendbeginn/-ende oder Feiertage → kein eindeutiger Anspruch (null).
      const s = day(assignment.start_date), e = day(assignment.end_date);
      const monday = new Date(`${s}T00:00:00Z`).getUTCDay() === 1;
      if (!monday || (days + 2) % 7 !== 0) return null;
      if (listSurchargeDays(s, e).some((d: any) => { const wd = new Date(`${d.date}T00:00:00Z`).getUTCDay(); return wd >= 1 && wd <= 5; })) return null;
      const weeks = (days + 2) / 7;
      return { units: weeks, label: weeks === 1 ? 'Woche (Montag–Freitag)' : 'Wochen (je Montag–Freitag; dazwischenliegende Wochenenden nicht vergütet angesetzt)', unit: 'Woche' };
    }
  }
  return null;
}

export function buildDriverOfferView(job: Data, assignment: Data): DriverOfferView {
  const rate = Number(assignment?.rate_value);
  const rateCents = Number.isFinite(rate) && rate > 0 ? Math.round(rate * 100) : null;
  const pct = commissionPctForTarif(job?.tarif_type);
  const units = paidUnits(job, assignment);
  const missing: string[] = [];
  if (rateCents === null) missing.push('Auftragsbezogen vereinbarter Fahrersatz');
  if (periodDays(assignment) === null) missing.push('Einsatzzeitraum (Kalenderdaten)');
  else if (units === null) missing.push('Vergütete Einheiten (Tage/Wochen/Stunden) nicht eindeutig bestimmbar');
  if (units === null && assignment?.rate_type === 'daily' && job?.tarif_type === 'lkw_ce_woche' && hasWeekend(assignment)) missing.push('Widerspruch: CE-Wochentarif ohne Wochenenden, Tagessatz-Zeitraum enthält Samstag/Sonntag – vergütete Tage nicht eindeutig');
  if (job?.tarif_needs_review) missing.push('Tarifzuordnung noch zu prüfen');
  if (pct === null) missing.push('Tarifart ohne festgelegte Provisionsregel');

  const complete = missing.length === 0;
  const feeCents = complete ? rateCents! * units!.units : null;
  const commissionCents = complete ? Math.round(feeCents! * pct! / 100) : null;
  const none = 'Nicht bestimmt – keine Zahl angegeben';
  const lines: [string, string][] = [
    ['Vergütete Einheiten', complete ? `${units!.units} ${units!.label} (aus dem vereinbarten Zeitraum)` : 'Nicht eindeutig bestimmt'],
    ['Stand-/Ruhetage', complete && job?.tarif_type === 'lkw_ce_woche' && units!.units > 1
      ? 'Dazwischenliegende Samstage/Sonntage sind nicht im Wochensatz enthalten; kein Fahrer-Tagessatz vereinbart – ein Wochenendeinsatz ist nicht Gegenstand dieses Angebots und vorab gesondert zu vereinbaren'
      : 'Nicht gesondert vereinbart – keine zusätzlichen Tage angesetzt'],
    ['Fahrerhonorar netto vor Provision (gesamter Auftrag)', complete ? `${formatEuro(rateCents! / 100)} je ${units!.unit} × ${units!.units} = ${formatEuro(feeCents! / 100)}` : none],
    ['Vermittlungsprovision', complete ? `${pct} % = ${formatEuro(commissionCents! / 100)} netto` : 'Nicht festgelegt – keine Zahl angegeben'],
    ['Verbleibende Nettovergütung (gesamter Auftrag, zzgl. provisionsfreier An-/Abfahrt)', complete ? formatEuro((feeCents! - commissionCents!) / 100) : none],
    ['Antwortart', complete ? 'Verbindliche Annahme oder Ablehnung möglich' : `Nur unverbindliche Interessenbekundung – fehlend: ${missing.join('; ')}`],
  ];
  return { mode: complete ? 'binding' : 'interest', pct, lines, missing };
}
