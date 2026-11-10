import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { agreementNote, agreementErrors } from '../offerReadiness';
import { buildDriverOfferView } from '../driverOfferRemuneration';

const job = { tarif_type: 'fernfahrer', einsatzort: 'TEST Hafenstraße 12, Tor 3, 12345 Musterstadt' };
const assignment = (o: Record<string, unknown> = {}, evidence: Record<string, unknown> = {}) => ({
  rate_type: 'daily', rate_value: 450, start_date: '2026-11-16T00:00:00Z', end_date: '2026-11-23T00:00:00Z',
  admin_note: agreementNote('TEST', { rate: 450, unit: 'daily', units: 6, place: job.einsatzort, remunerationConfirmed: true, placeConfirmed: true, ...evidence }), ...o,
});
describe('Versandfreigabe', () => {
  it('UI und Server verwenden identische Regeln', () => {
    const server = readFileSync('supabase/functions/_shared/offer-readiness.ts', 'utf8');
    const ui = readFileSync('src/lib/offerReadiness.ts', 'utf8').split('\n').slice(1).join('\n');
    expect(ui).toBe(server);
  });
  it('fehlender Fahrerhonorarsatz sperrt', () => expect(agreementErrors(job, assignment({ rate_value: null })).length).toBeGreaterThan(0));
  it('fehlende vergütete Einheiten sperren', () => expect(agreementErrors(job, assignment({}, { units: 0 })).length).toBeGreaterThan(0));
  it('bloßer Zeitraum ohne ausdrückliche Vereinbarung sperrt', () => expect(agreementErrors(job, assignment({ admin_note: '' })).length).toBeGreaterThan(0));
  it('fehlender Einsatzort sperrt auch bei vorhandener Firmenanschrift', () => expect(agreementErrors({ ...job, einsatzort: '', customer_street: 'Firmenstraße 1' }, assignment()).length).toBeGreaterThan(0));
  it('unbestätigter Treffpunkt sperrt', () => expect(agreementErrors(job, assignment({}, { placeConfirmed: false })).length).toBeGreaterThan(0));
  it('Platzhalter und bloße Stadt sperren', () => {
    for (const einsatzort of ['nicht erfasst', 'nicht bestätigt 12345 Musterstadt', '12345 Musterstadt'])
      expect(agreementErrors({ ...job, einsatzort }, assignment()).length).toBeGreaterThan(0);
  });
  it('sechs ausdrücklich vergütete Tage in acht Kalendertagen ergeben 2.160 € statt 2.880 €', () => {
    const a = assignment(); expect(agreementErrors(job, a)).toEqual([]);
    expect(buildDriverOfferView(job, a).lines.find(([l]) => l.startsWith('Verbleibende Netto'))?.[1]).toBe('2.160,00 €');
  });
  it('Änderung des Honorars erfordert erneute Vereinbarung', () => expect(agreementErrors(job, assignment({ rate_value: 400 })).length).toBeGreaterThan(0));
  it('neue Zuteilung mit acht bestätigten Tagen ergibt 2.880 €, alte bleibt unverändert', () => {
    const old = assignment(); const frozen = JSON.stringify(old);
    const next = assignment({}, { units: 8 }); expect(agreementErrors(job, next)).toEqual([]);
    expect(buildDriverOfferView(job, next).lines.find(([l]) => l.startsWith('Verbleibende Netto'))?.[1]).toBe('2.880,00 €');
    expect(JSON.stringify(old)).toBe(frozen);
  });
});