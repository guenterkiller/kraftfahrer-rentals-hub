/** Isolierte Vorschau: keine Verbindung zu Versand, Tarifen oder Datenbank. */
export interface OfferRemunerationInput {
  serviceNet: unknown;
  overtimeNet: unknown;
  surchargesNet: unknown;
  travelNet: unknown;
  commissionPct: unknown;
  specialOrderAgreed: boolean;
  amountsAgreed: boolean;
}

export function parseOfferCents(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) return null;
  const [whole, fraction = ''] = value.trim().replace(',', '.').split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : null;
}

export function calculateOfferRemuneration(input: OfferRemunerationInput) {
  const errors: string[] = [];
  const service = parseOfferCents(input.serviceNet);
  const overtime = parseOfferCents(input.overtimeNet);
  const surcharges = parseOfferCents(input.surchargesNet);
  const travel = parseOfferCents(input.travelNet);
  if (service === null || service <= 0) errors.push('Vereinbarter Netto-Auftragswert der Fahrleistung fehlt oder ist ungültig.');
  if (overtime === null) errors.push('Vereinbarte Mehrstunden sind nicht beziffert; ausdrücklich 0 eintragen, wenn keine vereinbart sind.');
  if (surcharges === null) errors.push('Vereinbarte Zuschläge sind nicht beziffert; ausdrücklich 0 eintragen, wenn keine vereinbart sind.');
  if (travel === null) errors.push('Vereinbarte An- und Abfahrtskosten fehlen oder sind ungültig; ein fehlender Wert ist nicht 0 €.');
  if (input.commissionPct !== 20 && input.commissionPct !== 25) errors.push('Vereinbarte Vermittlungsprovision muss 20 % oder 25 % betragen.');
  if (input.commissionPct === 25 && !input.specialOrderAgreed) errors.push('25 % nur bei ausdrücklich vereinbartem Sonderauftrag.');
  if (!input.amountsAgreed) errors.push('Vergütungsbeträge müssen vollständig vereinbart und bezifferbar sein.');
  if (errors.length || service === null || overtime === null || surcharges === null || travel === null) return { ok: false as const, errors };
  const commissionBaseCents = service + overtime + surcharges;
  const pct = input.commissionPct as number;
  const commissionCents = Math.round(commissionBaseCents * pct / 100);
  const driverNetCents = commissionBaseCents - commissionCents;
  const totalCents = driverNetCents + travel;
  if (![commissionBaseCents, commissionBaseCents * pct, totalCents].every(Number.isSafeInteger)) return { ok: false as const, errors: ['Vergütungsbetrag außerhalb des sicher berechenbaren Bereichs.'] };
  return { ok: true as const, errors: [], serviceCents: service, overtimeCents: overtime, surchargeCents: surcharges, commissionBaseCents, commissionPct: pct, commissionCents, driverNetCents, travelCents: travel, totalCents };
}

export const formatOfferCents = (cents: number) => `${(cents / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;