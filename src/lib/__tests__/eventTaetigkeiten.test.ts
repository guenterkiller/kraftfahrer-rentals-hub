import { describe, it, expect } from 'vitest';
import { EVENT_TAETIGKEITEN } from '../eventTaetigkeiten';
import { resolveTarif } from '../tarifZuordnung';
import { berechneKostenUebersicht } from '../kostenUebersicht';
import { resolveTarif as serverTarif } from '../../../supabase/functions/_shared/tarif-zuordnung';

describe('Eventtätigkeiten verwenden den bestehenden Spezialfahrzeugtarif', () => {
  for (const taetigkeit of EVENT_TAETIGKEITEN) {
    it(`${taetigkeit}: 489 Euro netto und identische Serverberechnung`, () => {
      const input = { kategorie: `Baumaschinenführer / Mischmeister – ${taetigkeit}`, maschinenbedienung: '' as const, taetigkeit };
      const tarif = resolveTarif(input);
      expect(tarif.netto).toBe(489);
      expect(tarif.tarif).toBe('baumaschine');
      expect(serverTarif(input)).toEqual(tarif);
      expect(berechneKostenUebersicht(tarif.tarif, '2026-11-05', '2026-11-06')).toMatchObject({ netto: 978, ust: 185.82, brutto: 1163.82 });
    });
  }
  it('keine automatische Tourneepauschale oder Fernfahrer-Umschaltung', () => {
    const tarif = resolveTarif({ kategorie: 'Baumaschinenführer / Mischmeister', maschinenbedienung: '', taetigkeit: EVENT_TAETIGKEITEN[2], longDistance: true });
    expect(tarif).toMatchObject({ tarif: 'baumaschine', netto: 489, mehrstunde: 60 });
  });
});