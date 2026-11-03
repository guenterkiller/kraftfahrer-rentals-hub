import { describe, it, expect } from 'vitest';
import { EVENT_TAETIGKEITEN } from '../eventTaetigkeiten';
import { resolveTarif } from '../tarifZuordnung';
import { berechneKostenUebersicht } from '../kostenUebersicht';
import { resolveTarif as serverTarif } from '../../../supabase/functions/_shared/tarif-zuordnung';
import { berechneKostenUebersicht as serverKosten } from '../../../supabase/functions/_shared/kosten-uebersicht';
import { overnightParagraphs } from '../../../supabase/functions/_shared/overnight-costs';

// 2026-11-07 = Samstag, 2026-11-08 = Sonntag, 2026-12-25 = Feiertag
describe('Event-Tourneepauschale (nur vier Eventtätigkeiten)', () => {
  for (const taetigkeit of EVENT_TAETIGKEITEN) {
    it(`${taetigkeit}: 489 € netto Pauschale, keine Mehrstunde, Server identisch`, () => {
      const input = { kategorie: `Baumaschinenführer / Mischmeister – ${taetigkeit}`, maschinenbedienung: '' as const, taetigkeit };
      const tarif = resolveTarif(input);
      expect(tarif).toMatchObject({ tarif: 'event', netto: 489, mehrstunde: null });
      // Server erhält nur die gespeicherte Kategorie (ohne taetigkeit)
      expect(serverTarif({ kategorie: input.kategorie, maschinenbedienung: '' })).toEqual(tarif);
    });
  }
  it('keine Samstags-, Sonntags- oder Feiertagszuschläge', () => {
    expect(berechneKostenUebersicht('event', '2026-11-06', '2026-11-08')).toMatchObject({ netto: 1467, ust: 278.73, brutto: 1745.73 });
    expect(berechneKostenUebersicht('event', '2026-12-25', '2026-12-25')?.netto).toBe(489);
    expect(serverKosten('event', '2026-11-06', '2026-11-08')).toEqual(berechneKostenUebersicht('event', '2026-11-06', '2026-11-08'));
  });
  it('Hotel organisiert und bezahlt der Auftraggeber', () => {
    expect(overnightParagraphs('event')[0]).toBe('Erforderliche Hotelübernachtungen organisiert und bezahlt der Auftraggeber.');
  });
  it('übrige Spezialfahrzeuge bleiben beim Baumaschinentarif mit 60 € Mehrstunde und Zuschlägen', () => {
    const tarif = resolveTarif({ kategorie: 'Baumaschinenführer / Mischmeister – Betonpumpe', maschinenbedienung: '', taetigkeit: 'Betonpumpe' });
    expect(tarif).toMatchObject({ tarif: 'baumaschine', netto: 489, mehrstunde: 60 });
    // Samstag 25 %: 489 + 611,25
    expect(berechneKostenUebersicht('baumaschine', '2026-11-06', '2026-11-07')?.netto).toBe(1100.25);
  });
  it('LKW CE und Fernfahrer unverändert', () => {
    expect(resolveTarif({ kategorie: 'LKW-Fahrer CE', maschinenbedienung: '' })).toMatchObject({ tarif: 'lkw_ce', netto: 349, mehrstunde: 45 });
    expect(resolveTarif({ kategorie: 'LKW-Fahrer CE', maschinenbedienung: '', longDistance: true })).toMatchObject({ tarif: 'fernfahrer', netto: 450 });
  });
});
