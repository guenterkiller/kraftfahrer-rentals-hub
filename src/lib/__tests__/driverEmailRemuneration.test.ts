import { describe, expect, it } from 'vitest';
import { calculateOfferRemuneration, parseOfferCents } from '../driverEmailRemuneration';

const fixture = { serviceNet: '1000', overtimeNet: '100', surchargesNet: '200', travelNet: '80', commissionPct: 20, specialOrderAgreed: false, amountsAgreed: true };
describe('Isolierte vereinbarte Angebotsvergütung (ausschließlich künstliche Rechenwerte)', () => {
  it('20 % regulär auf Fahrleistung einschließlich Mehrstunden und Zuschlägen', () => {
    expect(calculateOfferRemuneration(fixture)).toMatchObject({ ok: true, commissionBaseCents: 130000, commissionCents: 26000, driverNetCents: 104000, totalCents: 112000 });
  });
  it('25 % nur beim vereinbarten Sonderauftrag', () => {
    expect(calculateOfferRemuneration({ ...fixture, commissionPct: 25, specialOrderAgreed: true })).toMatchObject({ ok: true, commissionCents: 32500, driverNetCents: 97500, totalCents: 105500 });
    expect(calculateOfferRemuneration({ ...fixture, commissionPct: 25 }).ok).toBe(false);
  });
  it('Fahrtkosten bleiben vollständig provisionsfrei', () => {
    expect(calculateOfferRemuneration({ ...fixture, travelNet: '180' })).toMatchObject({ commissionCents: 26000, driverNetCents: 104000, totalCents: 122000 });
  });
  it.each(['serviceNet', 'overtimeNet', 'surchargesNet', 'travelNet'] as const)('fehlendes %s sperrt vollständiges Angebot', field => {
    expect(calculateOfferRemuneration({ ...fixture, [field]: '' }).ok).toBe(false);
  });
  it('ausdrücklich vereinbarte null Euro Fahrtkosten akzeptiert', () => {
    expect(calculateOfferRemuneration({ ...fixture, travelNet: '0' })).toMatchObject({ ok: true, travelCents: 0, totalCents: 104000 });
  });
  it('nicht bestätigte Beträge sind keine vereinbarte Vergütung', () => {
    expect(calculateOfferRemuneration({ ...fixture, amountsAgreed: false }).ok).toBe(false);
  });
  it.each([undefined, 15, 21, '20'])('keine erfundene oder andere Provision: %s', commissionPct => {
    expect(calculateOfferRemuneration({ ...fixture, commissionPct }).ok).toBe(false);
  });
  it.each(['-1', '1.001', 'abc', 'Infinity', '', '1e3'])('ungültiger Betrag %s wird abgewiesen', value => {
    expect(parseOfferCents(value)).toBeNull();
  });
  it('rechnet centgenau und rundet Provision einmal kaufmännisch', () => {
    expect(calculateOfferRemuneration({ ...fixture, serviceNet: '1,03', overtimeNet: '0', surchargesNet: '0', travelNet: '0', commissionPct: 25, specialOrderAgreed: true })).toMatchObject({ commissionCents: 26, driverNetCents: 77, totalCents: 77 });
  });
});