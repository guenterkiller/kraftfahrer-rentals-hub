import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { agreementErrors, agreementNote } from '../offerReadiness';
import { buildAutomaticAssignment } from '../automaticAssignment';
import { buildDriverOfferView } from '../driverOfferRemuneration';

const place = 'TEST Hafenstraße 12, Tor 3, 12345 Musterstadt';
const job = (overrides: Record<string, unknown> = {}) => ({
  tarif_type: 'lkw_ce_woche', tarif_netto: 1645, tarif_needs_review: false,
  zeitraum: '16.11.2026 – 20.11.2026', einsatzort: place, besonderheiten: '',
  kosten_uebersicht: { netto: 1645, positionen: [{ label: 'LKW-Fahrer CE – Wochenpreis: 1 Woche (Mo–Fr) × 1.645,00 €', betrag: 1645 }] },
  ...overrides,
});
const assignment = (auto: ReturnType<typeof buildAutomaticAssignment>, start = '2026-11-16', end = '2026-11-20') => ({
  rate_type: auto.rateType, rate_value: auto.rateValue,
  start_date: `${start}T00:00:00.000Z`, end_date: `${end}T00:00:00.000Z`,
  admin_note: auto.agreement ? agreementNote('', auto.agreement) : '',
});
const net = (value: ReturnType<typeof buildDriverOfferView>) => value.lines.find(([label]) => label.startsWith('Verbleibende Nettovergütung'))?.[1];

describe('Automatische Fahrerzuweisung', () => {
  it('Website und Server verwenden exakt dieselbe Buchungslogik', () => {
    const normalize = (source: string) => source.split('\n').filter((line) => !line.startsWith('import ') && !line.startsWith('// Spiegel:')).join('\n');
    expect(normalize(readFileSync('src/lib/automaticAssignment.ts', 'utf8')))
      .toBe(normalize(readFileSync('supabase/functions/_shared/automatic-assignment.ts', 'utf8')));
  });

  it('CE-Woche: Kundenkalkulation 1.645 € ergibt genau einmal 20 % Abzug und 1.316 € netto', () => {
    const auto = buildAutomaticAssignment(job(), '2026-11-16', '2026-11-20');
    expect(auto.errors).toEqual([]);
    expect(auto.driverNetCents).toBe(131600);
    expect(auto.driverNetCents).not.toBe(105280);
    expect(auto.unitNetCents).toBe(131600);
    expect(auto.agreement?.units).toBe(1);
    const a = assignment(auto);
    expect(agreementErrors(job(), a)).toEqual([]);
    const view = buildDriverOfferView(job(), a);
    expect(view.mode).toBe('binding');
    expect(net(view)).toBe('1.316,00 €');
  });

  it('Völklingen-Kalkulation: 5 Wochen + 2 Tage = 8.883 €, Fahrer netto 7.106,40 € ohne manuelle Wochenzahl', () => {
    const j = job({
      zeitraum: '17.11.2026 – 23.12.2026',
      kosten_uebersicht: { netto: 8883, positionen: [
        { label: 'LKW-Fahrer CE – Wochenpreis: 5 Wochen (Mo–Fr) × 1.645,00 €', betrag: 8225 },
        { label: '2 Einsatztage (Mo–Fr) × 329,00 €', betrag: 658 },
      ] },
    });
    const auto = buildAutomaticAssignment(j, '2026-11-17', '2026-12-23');
    expect(auto.driverNetCents).toBe(710640);
    expect(auto.agreement?.units).toBe(5);
    expect(net(buildDriverOfferView(j, assignment(auto, '2026-11-17', '2026-12-23')))).toBe('7.106,40 €');
  });

  it('Samstag und Sonntag ohne ausdrückliche Buchung werden nicht aus dem Kalender abgeleitet', () => {
    const j = job({ zeitraum: '16.11.2026 – 22.11.2026', kosten_uebersicht: null });
    const auto = buildAutomaticAssignment(j, '2026-11-16', '2026-11-22');
    expect(auto.driverNetCents).toBe(131600);
    expect(auto.billing).not.toMatch(/Sa,|So,/);
  });

  it('ausdrücklich gebuchtes Wochenende wird mit vorhandenen Zuschlägen berücksichtigt', () => {
    const j = job({ zeitraum: '16.11.2026 – 22.11.2026', kosten_uebersicht: null, besonderheiten: 'Wochenendarbeit' });
    const auto = buildAutomaticAssignment(j, '2026-11-16', '2026-11-22');
    expect(auto.agreement?.serviceCents).toBe(260475);
    expect(auto.driverNetCents).toBe(208380);
    expect(auto.billing).toMatch(/Sa,|So,/);
    const view = buildDriverOfferView(j, assignment(auto, '2026-11-16', '2026-11-22'));
    expect(view.mode).toBe('binding');
    expect(net(view)).toBe('2.083,80 €');
  });

  it('ausdrücklich gespeicherte Wochenendtage werden ebenfalls als Buchung erkannt', () => {
    const j = job({ zeitraum: '16.11.2026 – 22.11.2026', kosten_uebersicht: null, besonderheiten: '', weekend_days: ['2026-11-21'] });
    const auto = buildAutomaticAssignment(j, '2026-11-16', '2026-11-22');
    expect(auto.driverNetCents).toBe(208380);
  });

  it('geänderter Zeitraum verwendet den bestehenden Tarifrechner statt einer unpassenden alten Kalkulation', () => {
    const j = job({ kosten_uebersicht: { netto: 9999, positionen: [{ label: 'Alt', betrag: 9999 }] } });
    const auto = buildAutomaticAssignment(j, '2026-11-23', '2026-11-27');
    expect(auto.errors).toEqual([]);
    expect(auto.agreement?.serviceCents).toBe(164500);
    expect(auto.driverNetCents).toBe(131600);
  });

  it('unstimmige Originalkalkulation oder fehlende konkrete Einsatzanschrift bleiben verständlich gesperrt', () => {
    const invalid = buildAutomaticAssignment(job({ kosten_uebersicht: { netto: 1645, positionen: [] } }), '2026-11-16', '2026-11-20');
    expect(invalid.agreement).toBeNull();
    expect(invalid.errors.join(' ')).toMatch(/unvollständig|nicht stimmig/);
    const missingPlace = buildAutomaticAssignment(job({ einsatzort: 'Musterstadt' }), '2026-11-16', '2026-11-20');
    expect(agreementErrors(job({ einsatzort: 'Musterstadt' }), assignment(missingPlace)).join(' ')).toMatch(/Einsatzanschrift|Treffpunkt/);
  });
});
