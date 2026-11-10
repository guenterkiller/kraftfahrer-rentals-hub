import { describe, it, expect } from 'vitest';
// @ts-ignore Node-Typen je nach Konfiguration nicht eingebunden; Vitest läuft unter Node.
import { readFileSync } from 'node:fs';
import { buildDriverOfferView } from '../driverOfferRemuneration';

const norm = (s: string) => s.split('\n').filter(l => !/^import |^\/\/ Spiegel/.test(l)).join('\n');
const net = (v: ReturnType<typeof buildDriverOfferView>) => v.lines.find(([l]) => l.startsWith('Verbleibende Nettovergütung'))?.[1];

describe('Verwaltungsvorschau Fahrer-Nettovergütung', () => {
  it('ist identisch mit der Serverberechnung', () => {
    expect(norm(readFileSync('src/lib/driverOfferRemuneration.ts', 'utf8')))
      .toBe(norm(readFileSync('supabase/functions/_shared/driver-offer-remuneration.ts', 'utf8')));
  });
  it('manuell 450 € je Tag, Fernfahrer, 8 Tage: 20 % Abzug → 2.880,00 €', () => {
    const v = buildDriverOfferView({ tarif_type: 'fernfahrer' }, { rate_type: 'daily', rate_value: 450, start_date: '2026-11-16T00:00:00.000Z', end_date: '2026-11-23T00:00:00.000Z' });
    expect(v.mode).toBe('binding'); expect(v.pct).toBe(20); expect(net(v)).toMatch(/2\.880,00/);
  });
  it('korrigierter Satz 500 € je Tag Baumaschine, 2 Tage: 25 % Abzug → 750,00 €', () => {
    const v = buildDriverOfferView({ tarif_type: 'baumaschine' }, { rate_type: 'daily', rate_value: 500, start_date: '2026-11-16T00:00:00.000Z', end_date: '2026-11-17T00:00:00.000Z' });
    expect(v.pct).toBe(25); expect(net(v)).toMatch(/750,00/);
  });
  it('Stundensatz ohne Stundenzahl: kein Betrag, nur Interessenbekundung', () => {
    const v = buildDriverOfferView({ tarif_type: 'lkw_ce' }, { rate_type: 'hourly', rate_value: 30, start_date: '2026-11-16T00:00:00.000Z', end_date: '2026-11-16T00:00:00.000Z' });
    expect(v.mode).toBe('interest'); expect(net(v)).not.toMatch(/\d/);
  });
});
