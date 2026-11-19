// Private driver offers only (offer snapshot v3). Never import into customer mail/booking paths.
// Fahrerhonorar = auftragsbezogener Fahrersatz × vergütete Einheiten; nie aus dem Kundenpreis abgeleitet.
import { formatEuro } from './kosten-uebersicht.ts';
import { listSurchargeDays } from './german-holidays.ts';

import { readAgreement } from './offer-readiness.ts';

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
  const agreed = readAgreement(assignment);
  if (agreed) {
    if (!Number.isFinite(agreed.units) || agreed.units <= 0) return null;
    if (assignment.rate_type === 'daily') {
      if (!Number.isInteger(agreed.units) || agreed.units > days) return null;
      if (job?.tarif_type === 'lkw_ce_woche' && hasWeekend(assignment)) return null;
      return { units: agreed.units, label: 'vereinbarte vergütete Einsatztage', unit: 'Einsatztag' };
    }
    if (assignment.rate_type === 'hourly') return { units: agreed.units, label: 'vereinbarte vergütete Stunden', unit: 'Stunde' };
    if (assignment.rate_type === 'weekly' && job?.tarif_type === 'fernfahrer') {
      return Number.isInteger(agreed.units) && agreed.units * 5 <= days ? { units: agreed.units, label: 'vereinbarte vergütete Wochen (je 5 Einsatztage)', unit: 'Woche' } : null;
    }
  }
  if (assignment?.rate_type === 'daily') {
    // CE-Wochentarif schließt Wochenenden aus: Kalendertage inkl. Sa/So sind dann nicht automatisch vergütete Tage.
    if (job?.tarif_type === 'lkw_ce_woche' && hasWeekend(assignment)) return null;
    // Fernverkehr: Pauschale unabhängig vom Wochentag – der vom Administrator eingetragene Zeitraum ist die vereinbarte Zahl vergüteter Einsatztage;
    // Sa/So sperren nicht pauschal, werden aber in der Vorschau ausdrücklich als vergütet angesetzt ausgewiesen.
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
      if (agreed && agreed.units !== weeks) return null;
      return { units: weeks, label: weeks === 1 ? 'Woche (Montag–Freitag)' : 'Wochen (je Montag–Freitag; dazwischenliegende Wochenenden nicht vergütet angesetzt)', unit: 'Woche' };
    }
  }
  return null;
}

/** Fernverkehr-Fahrersatz (450 € je Tag) gilt nur für Tarif Fernfahrer, nie für CE-Tages-/Wochentarife. */
export function fernverkehrRateOnCeTarif(job: Data, assignment: Data): boolean {
  return assignment?.rate_type === 'daily' && Number(assignment?.rate_value) === 450
    && (job?.tarif_type === 'lkw_ce' || job?.tarif_type === 'lkw_ce_woche');
}

export function buildDriverOfferView(job: Data, assignment: Data): DriverOfferView {
  const rate = Number(assignment?.rate_value);
  const rateCents = Number.isFinite(rate) && rate > 0 ? Math.round(rate * 100) : null;
  const pct = commissionPctForTarif(job?.tarif_type);
  const units = paidUnits(job, assignment);
  const agreed = readAgreement(assignment);
  const missing: string[] = [];
  if (rateCents === null) missing.push('Auftragsbezogen vereinbarter Fahrersatz');
  if (periodDays(assignment) === null) missing.push('Einsatzzeitraum (Kalenderdaten)');
  else if (units === null) missing.push('Vergütete Einheiten (Tage/Wochen/Stunden) nicht eindeutig bestimmbar');
  if (units === null && assignment?.rate_type === 'daily' && job?.tarif_type === 'lkw_ce_woche' && hasWeekend(assignment)) missing.push('Widerspruch: CE-Wochentarif ohne Wochenenden, Tagessatz-Zeitraum enthält Samstag/Sonntag – vergütete Tage nicht eindeutig');
  if (fernverkehrRateOnCeTarif(job, assignment)) missing.push('Tarifkonflikt: 450 € je Einsatztag ist der Fernverkehr-Fahrersatz; dieser Auftrag ist als CE-Tages-/Wochentarif gespeichert – Tarifart Fernfahrer prüfen, CE-Sätze bleiben getrennt');
  if (!String(job?.einsatzort ?? '').trim()) missing.push('Einsatzort / Treffpunkt nicht erfasst – vor verbindlichem Angebot mit dem Auftraggeber klären');
  if (job?.tarif_needs_review) missing.push('Tarifzuordnung noch zu prüfen');
  if (pct === null) missing.push('Tarifart ohne festgelegte Provisionsregel');

  const complete = missing.length === 0 && rateCents !== null && units !== null && pct !== null;
  const feeCents = complete && rateCents !== null && units ? Math.round(rateCents * units.units) : null;
  const commissionCents = feeCents !== null && pct !== null ? Math.round(feeCents * pct / 100) : null;
  const none = 'Nicht bestimmt – keine Zahl angegeben';
  const lines: [string, string][] = [
    ['Vergütete Einheiten', complete ? `${units?.units} ${units?.label} (${agreed ? 'aus ausdrücklich gespeicherten vergüteten Einheiten' : 'aus dem vereinbarten Zeitraum'}${!agreed && job?.tarif_type === 'fernfahrer' && assignment?.rate_type === 'daily' && hasWeekend(assignment) ? '; enthaltene Samstage/Sonntage sind als vergütete Fernverkehrs-Einsatztage angesetzt – nur so versenden, wenn vereinbart, sonst Zeitraum anpassen' : ''})` : 'Nicht eindeutig bestimmt'],
    ['Stand-/Ruhetage', complete && job?.tarif_type === 'lkw_ce_woche' && (units?.units ?? 0) > 1
      ? 'Dazwischenliegende Samstage/Sonntage sind nicht im Wochensatz enthalten; kein Fahrer-Tagessatz vereinbart – ein Wochenendeinsatz ist nicht Gegenstand dieses Angebots und vorab gesondert zu vereinbaren'
      : 'Nicht gesondert vereinbart – keine zusätzlichen Tage angesetzt'],
    ['Fahrerhonorar netto vor Provision (gesamter Auftrag)', complete ? `${formatEuro((rateCents ?? 0) / 100)} je ${units?.unit} × ${units?.units} = ${formatEuro((feeCents ?? 0) / 100)}` : none],
    ['Vermittlungsprovision', complete ? `${pct} % = ${formatEuro((commissionCents ?? 0) / 100)} netto` : 'Nicht festgelegt – keine Zahl angegeben'],
    ['Verbleibende Nettovergütung (gesamter Auftrag, zzgl. provisionsfreier An-/Abfahrt)', complete ? formatEuro(((feeCents ?? 0) - (commissionCents ?? 0)) / 100) : none],
    ['Antwortart', complete ? 'Verbindliche Annahme oder Ablehnung möglich' : `Nur unverbindliche Interessenbekundung – fehlend: ${missing.join('; ')}`],
  ];
  return { mode: complete ? 'binding' : 'interest', pct, lines, missing };
}
