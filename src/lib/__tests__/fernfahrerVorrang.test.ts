import { describe, it, expect } from 'vitest';
import { resolveTarif } from '../tarifZuordnung';
import { berechneKostenUebersicht, tarifOhneZuschlaege } from '../kostenUebersicht';
import { TARIF_TEXTE } from '../tarifTexte';

describe('Fernfahrer-Pauschale hat Vorrang vor CE-Wochenpreis', () => {
  it('CE-Wochenpreis + Fernverkehr ergibt Fernfahrer-Pauschale 450 €', () => {
    const r = resolveTarif({ kategorie: 'LKW CE Wochenpreis', maschinenbedienung: '', longDistance: true });
    expect(r).toMatchObject({ tarif: 'fernfahrer', netto: 450, mehrstunde: null });
  });
  it('CE-Wochenpreis ohne Fernverkehr bleibt 1.645 €', () => {
    expect(resolveTarif({ kategorie: 'LKW CE Wochenpreis', maschinenbedienung: '' })).toMatchObject({ tarif: 'lkw_ce_woche', netto: 1645 });
  });
  it('Spezialfahrzeuge bleiben auch mit Fernverkehr beim eigenen Tarif', () => {
    expect(resolveTarif({ kategorie: 'Baumaschinenführer / Mischmeister', maschinenbedienung: '', longDistance: true }).tarif).toBe('baumaschine');
  });
});

describe('Fernfahrer-Pauschale ohne Wochenend-/Feiertagszuschläge', () => {
  it('Beispiel 16.–23.11.2026: 8 abrechenbare Tage = 3.600 € netto / 4.284 € brutto', () => {
    const k = berechneKostenUebersicht('fernfahrer', '2026-11-16', '2026-11-23')!;
    expect(k.netto).toBe(3600);
    expect(k.brutto).toBe(4284);
    expect(k.positionen).toHaveLength(1);
    expect(k.positionen[0].label).not.toMatch(/Zuschlag/);
  });
  it('Feiertag 25.12.2026 kostet 450 € ohne Zuschlag', () => {
    expect(berechneKostenUebersicht('fernfahrer', '2026-12-25', '2026-12-25')!.netto).toBe(450);
  });
  it('andere Tarife behalten ihre Zuschläge', () => {
    expect(tarifOhneZuschlaege('fernfahrer')).toBe(true);
    expect(tarifOhneZuschlaege('lkw_ce')).toBe(false);
    // Sa 21.11. + So 22.11.2026 bei 349 €: 436,25 + 523,50
    expect(berechneKostenUebersicht('lkw_ce', '2026-11-21', '2026-11-22')!.netto).toBe(959.75);
    // Wochenpreis MIAG-Zeitraum unverändert 2.933,75 € netto
    expect(berechneKostenUebersicht('lkw_ce_woche', '2026-11-16', '2026-11-23')!.netto).toBe(2933.75);
    expect(berechneKostenUebersicht('baumaschine', '2026-11-21', '2026-11-21')!.netto).toBe(611.25);
  });
  it('Preistext nennt keine Zuschläge mehr als Zusatz', () => {
    const t = JSON.stringify(TARIF_TEXTE.fernfahrer);
    expect(t).toContain('keine Samstags-, Sonntags- oder Feiertagszuschläge');
    expect(t).not.toContain('gegebenenfalls veröffentlichter Zuschläge');
  });
});
