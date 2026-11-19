// Mirror of the function-local readiness module; equality tested.
// Explicit assignment-specific agreement evidence, stored in the existing admin_note.
// No changes to historic assignments or immutable snapshots.
const PREFIX = '[FAHRERANGEBOT_V1]';
type Data = Record<string, any>;
export type Agreement = {
  rate: number; unit: string; units: number; place: string;
  remunerationConfirmed: boolean; placeConfirmed: boolean;
  source?: 'booking_calculation_v1';
  serviceCents?: number;
  positions?: { label: string; betrag: number }[];
  startDate?: string; endDate?: string;
};

export function agreementNote(note: string, agreement: Agreement): string {
  return `${PREFIX}${JSON.stringify(agreement)}\n${note}`;
}

export function readAgreement(assignment: Data): Agreement | null {
  const line = String(assignment?.admin_note ?? '').split('\n')[0];
  if (!line.startsWith(PREFIX)) return null;
  try { return JSON.parse(line.slice(PREFIX.length)); } catch { return null; }
}

export function concretePlace(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const place = value.trim();
  return place.length >= 12 && /\d/.test(place) && /[a-zäöüß]{3}/i.test(place)
    && (/[a-zäöüß]{3,}\s+\d{1,4}\b/i.test(place) || /(?:tor|ladepunkt|zufahrt|halle|terminal)\s*[a-z]?\d+/i.test(place))
    && !/nicht (erfasst|bestätigt|bekannt)|unbestätigt|nachzutragen|nach (absprache|vereinbarung)|wird .*bekannt|siehe |^[-—–]+$|bitte wählen|noch (offen|zu klären)/i.test(place);
}

const day = (value: unknown) => typeof value === 'string' && !isNaN(Date.parse(value)) ? value.slice(0, 10) : '';

export function agreementErrors(job: Data, assignment: Data): string[] {
  const a = readAgreement(assignment);
  const automatic = a?.source === 'booking_calculation_v1';
  const errors: string[] = [];
  const rate = Number(assignment.rate_value);
  if (!Number.isFinite(rate) || rate <= 0 || Math.abs(rate * 100 - Math.round(rate * 100)) > 0.000001)
    errors.push('Gültigen vereinbarten Fahrer-Honorarsatz mit höchstens zwei Nachkommastellen ergänzen.');
  if (!['daily', 'weekly', 'hourly'].includes(assignment.rate_type)) errors.push('Gültige Abrechnungseinheit ergänzen.');
  if (!a || a.rate !== rate || a.unit !== assignment.rate_type)
    errors.push('Honorarsatz und Abrechnungseinheit stimmen nicht mit dem Zuweisungsnachweis überein.');
  if (!automatic && (!a || a.remunerationConfirmed !== true))
    errors.push('Fahrerhonorar und Abrechnungseinheit ausdrücklich als vereinbart bestätigen.');
  if (!automatic && (!a || !Number.isFinite(a.units) || a.units <= 0 || (assignment.rate_type !== 'hourly' && !Number.isInteger(a.units))))
    errors.push('Anzahl der tatsächlich vereinbarten vergüteten Einheiten ergänzen.');
  if (automatic) {
    const positions = Array.isArray(a?.positions) ? a.positions : [];
    const validPositions = positions.length > 0 && positions.every((p) => typeof p?.label === 'string' && Number.isFinite(p?.betrag));
    const sum = validPositions ? Math.round(positions.reduce((total, p) => total + p.betrag * 100, 0)) : null;
    if (!Number.isInteger(a?.serviceCents) || Number(a?.serviceCents) <= 0 || sum !== a?.serviceCents)
      errors.push('Die automatisch gespeicherte Fahrleistungskalkulation ist unvollständig oder nicht stimmig.');
    if (a?.startDate !== day(assignment.start_date) || a?.endDate !== day(assignment.end_date))
      errors.push('Einsatzzeitraum und automatischer Zuweisungsnachweis stimmen nicht überein.');
  }
  if (!concretePlace(job.einsatzort)) errors.push('Die tatsächliche Einsatzanschrift oder ein eindeutig bezeichneter Treffpunkt fehlt im Auftrag. Bitte zuerst in den vorhandenen Auftragsdaten ergänzen.');
  if (!a || a.place !== String(job.einsatzort ?? '').trim())
    errors.push('Einsatzort und Zuweisungsnachweis stimmen nicht überein.');
  if (!automatic && (!a || a.placeConfirmed !== true))
    errors.push('Tatsächlichen Einsatzort mit dem Auftraggeber prüfen und ausdrücklich bestätigen; Firmenanschrift nicht ungeprüft übernehmen.');
  return errors;
}
