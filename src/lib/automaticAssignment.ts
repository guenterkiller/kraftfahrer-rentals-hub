// Automatische Fahrerzuweisung aus vorhandenem Auftragstarif und Buchungszeitraum.
// Spiegel: supabase/functions/_shared/automatic-assignment.ts (Gleichheit durch Tests geprüft).
import { berechneKostenUebersicht, wochenendarbeitGebucht, altbestandWochenendeOhneBuchung, type KostenUebersicht } from './kostenUebersicht';
import { commissionPctForTarif } from './driverOfferCommission';

export const AUTOMATIC_ASSIGNMENT_SOURCE = 'booking_calculation_v1';

type Data = Record<string, any>;
export type AutomaticAgreement = {
  rate: number;
  unit: 'daily' | 'weekly';
  units: number;
  place: string;
  remunerationConfirmed: boolean;
  placeConfirmed: boolean;
  source: typeof AUTOMATIC_ASSIGNMENT_SOURCE;
  serviceCents: number;
  positions: { label: string; betrag: number }[];
  startDate: string;
  endDate: string;
};
export type AutomaticAssignment = {
  rateType: 'daily' | 'weekly';
  rateValue: number | null;
  agreement: AutomaticAgreement | null;
  driverNetCents: number | null;
  unitNetCents: number | null;
  unitLabel: string | null;
  billing: string;
  errors: string[];
};

const iso = (value: string) => value.includes('-') ? value : value.split('.').reverse().map((part) => part.padStart(2, '0')).join('-');
const validDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export function jobPeriod(job: Data): { startDate: string; endDate: string } {
  const dates = String(job?.zeitraum ?? '').match(/\d{4}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}\.\d{4}/g) ?? [];
  const startDate = dates[0] ? iso(dates[0]) : '';
  const endDate = dates[1] ? iso(dates[1]) : startDate;
  return { startDate, endDate };
}

function validCosts(costs: any): costs is KostenUebersicht {
  const positions = costs?.positionen;
  return costs && typeof costs.netto === 'number' && Number.isFinite(costs.netto) && costs.netto > 0 &&
    Array.isArray(positions) && positions.length > 0 && positions.every((p: any) =>
      typeof p?.label === 'string' && typeof p?.betrag === 'number' && Number.isFinite(p.betrag)) &&
    Math.round(positions.reduce((sum: number, p: any) => sum + p.betrag * 100, 0)) === Math.round(costs.netto * 100);
}

/** Kundenbeträge werden aus der internen Abrechnungsbeschreibung entfernt. */
export function automaticPositionLabel(label: string): string {
  return label.replace(/\s*×\s*[\d.]+,\d{2}\s?€/g, '')
    .replace(/:?\s*[\d.]+,\d{2}\s?€\s*\+\s*/g, ': Tagessatz + ')
    .replace(/\s*[\d.]+,\d{2}\s?€/g, '').trim();
}

export function buildAutomaticAssignment(job: Data, startDate: string, endDate: string): AutomaticAssignment {
  const rateType = job?.tarif_type === 'lkw_ce_woche' ? 'weekly' : 'daily';
  const rawRate = Number(job?.tarif_netto);
  const rateValue = Number.isFinite(rawRate) && rawRate > 0 ? rawRate : null;
  const errors: string[] = [];
  if (!job) errors.push('Auftragsdaten werden geladen.');
  if (!validDate(startDate) || !validDate(endDate)) errors.push('Bitte gültigen Einsatzbeginn und Einsatzende wählen.');
  else if (endDate < startDate) errors.push('Das Einsatzende darf nicht vor dem Einsatzbeginn liegen.');
  if (!job?.tarif_type || commissionPctForTarif(job?.tarif_type) === null) errors.push('Die gespeicherte Tarifart hat keine festgelegte Provisionsregel.');
  if (job?.tarif_needs_review) errors.push('Die Tarifzuordnung ist noch zu prüfen.');
  if (rateValue === null || Math.abs(rawRate * 100 - Math.round(rawRate * 100)) > 0.000001) errors.push('Der gespeicherte Auftragstarif fehlt oder ist ungültig.');

  let costs: KostenUebersicht | null = null;
  if (errors.length === 0) {
    const original = jobPeriod(job);
    const samePeriod = original.startDate === startDate && original.endDate === endDate;
    const stored = job?.kosten_uebersicht;
    if (samePeriod && stored != null && !validCosts(stored)) {
      errors.push('Die gespeicherte Kalkulation ist unvollständig oder rechnerisch nicht stimmig.');
    } else if (samePeriod && validCosts(stored) && altbestandWochenendeOhneBuchung(stored, job?.besonderheiten)) {
      errors.push('Die gespeicherte Kalkulation enthält Wochenendposten, obwohl Wochenendarbeit nicht gebucht ist.');
    } else {
      costs = samePeriod && validCosts(stored)
        ? stored
        : berechneKostenUebersicht(String(job.tarif_type), startDate, endDate, { wochenendarbeit: wochenendarbeitGebucht(job?.besonderheiten) || String(job?.besonderheiten ?? '').split(',').some((entry) => entry.trim() === 'Wochenendarbeit') || (Array.isArray(job?.weekend_days) && job.weekend_days.length > 0) });
      if (!costs || !validCosts(costs)) errors.push('Für diesen Zeitraum ist keine eindeutige Fahrleistungskalkulation aus den vorhandenen Tarifdaten möglich.');
    }
  }

  const pct = commissionPctForTarif(job?.tarif_type);
  const serviceCents = costs ? Math.round(costs.netto * 100) : null;
  const driverNetCents = serviceCents !== null && pct !== null ? serviceCents - Math.round(serviceCents * pct / 100) : null;
  const rateCents = rateValue !== null ? Math.round(rateValue * 100) : null;
  const unitNetCents = rateCents !== null && pct !== null ? rateCents - Math.round(rateCents * pct / 100) : null;
  const positions = costs?.positionen.map((p) => ({ label: String(p.label), betrag: Number(p.betrag) })) ?? [];
  const days = validDate(startDate) && validDate(endDate) && endDate >= startDate
    ? Math.round((Date.parse(endDate) - Date.parse(startDate)) / 86400000) + 1 : 0;
  const weekPosition = positions.map((p) => p.label.match(/(\d+)\s+Wochen?\b/)?.[1]).find(Boolean);
  const units = rateType === 'weekly' ? Number(weekPosition ?? 0) : days;
  const agreement = errors.length === 0 && rateValue !== null && serviceCents !== null && driverNetCents !== null
    ? {
        rate: rateValue, unit: rateType, units, place: String(job.einsatzort ?? '').trim(),
        remunerationConfirmed: false, placeConfirmed: false,
        source: AUTOMATIC_ASSIGNMENT_SOURCE, serviceCents, positions, startDate, endDate,
      } as AutomaticAgreement
    : null;
  return {
    rateType, rateValue, agreement, driverNetCents, unitNetCents,
    unitLabel: unitNetCents === null ? null : rateType === 'weekly' ? 'netto je Mo–Fr-Woche' : 'netto je Einsatztag',
    billing: positions.map((p) => automaticPositionLabel(p.label)).join(' · '), errors,
  };
}
