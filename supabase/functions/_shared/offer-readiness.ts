// Explicit assignment-specific agreement evidence, stored in the existing admin_note.
// No changes to historic assignments or immutable snapshots.
const PREFIX = '[FAHRERANGEBOT_V1]';
type Data = Record<string, any>;
export type Agreement = { rate: number; unit: string; units: number; place: string; remunerationConfirmed: boolean; placeConfirmed: boolean };

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

/** Freitext der Notiz ohne die Vereinbarungszeile. */
export function noteText(assignment: Data): string {
  const lines = String(assignment?.admin_note ?? '').split('\n');
  return (lines[0].startsWith(PREFIX) ? lines.slice(1) : lines).join('\n').trim();
}

/** Vollständige gespeicherte Auftraggeberanschrift (Straße, Hausnummer, PLZ, Ort) oder null; nie ergänzt/erfunden. */
export function customerAddress(job: Data): string | null {
  const v = (k: string) => String(job?.[k] ?? '').trim();
  const street = v('customer_street'), house = v('customer_house_number'), postal = v('customer_postal_code'), city = v('customer_city');
  if (!street || !house || !/^\d{5}$/.test(postal) || !city) return null;
  const address = [v('company'), v('customer_name'), `${street} ${house}`, `${postal} ${city}`].filter(Boolean).join(', ');
  return concretePlace(address) ? address : null;
}

/**
 * Einsatz-/Treffpunkt für die Zuweisung: konkreter abweichender Treffpunkt aus der Notiz hat Vorrang,
 * sonst konkret gespeicherter Einsatzort, sonst die vollständige Auftraggeberanschrift. Fehlt alles: null (Sperre).
 */
export function resolvedPlace(job: Data, assignment: Data): { place: string; source: 'note' | 'einsatzort' | 'customer' } | null {
  const note = noteText(assignment);
  if (concretePlace(note)) return { place: note, source: 'note' };
  const stored = String(job?.einsatzort ?? '').trim();
  if (concretePlace(stored)) return { place: stored, source: 'einsatzort' };
  const address = customerAddress(job);
  return address ? { place: address, source: 'customer' } : null;
}

export function agreementErrors(job: Data, assignment: Data): string[] {
  const a = readAgreement(assignment);
  const errors: string[] = [];
  const rate = Number(assignment.rate_value);
  if (!Number.isFinite(rate) || rate <= 0 || Math.abs(rate * 100 - Math.round(rate * 100)) > 0.000001)
    errors.push('Gültigen vereinbarten Fahrer-Honorarsatz mit höchstens zwei Nachkommastellen ergänzen.');
  if (!['daily', 'weekly', 'hourly'].includes(assignment.rate_type)) errors.push('Gültige Abrechnungseinheit ergänzen.');
  if (!a || a.remunerationConfirmed !== true || a.rate !== rate || a.unit !== assignment.rate_type)
    errors.push('Fahrerhonorar und Abrechnungseinheit ausdrücklich als vereinbart bestätigen.');
  if (!a || !Number.isFinite(a.units) || a.units <= 0 || (assignment.rate_type !== 'hourly' && !Number.isInteger(a.units)))
    errors.push('Anzahl der tatsächlich vereinbarten vergüteten Einheiten ergänzen.');
  const place = resolvedPlace(job, assignment);
  if (!place) errors.push('Konkrete Einsatzanschrift oder eindeutig bezeichneten Treffpunkt ergänzen (vollständige Auftraggeberanschrift fehlt; abweichenden Treffpunkt mit Straße/Hausnummer oder Tor/Ladepunkt und Ort in die Notiz eintragen).');
  else if (!a || a.placeConfirmed !== true || a.place !== place.place)
    errors.push('Einsatz-/Treffpunkt der Zuweisung stimmt nicht mit der gespeicherten Anschrift bzw. dem Notiz-Treffpunkt überein.');
  return errors;
}