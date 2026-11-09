import { describe, it, expect } from 'vitest';
import { resolveTarif } from '../tarifZuordnung';
import { berechneKostenUebersicht, tarifOhneZuschlaege } from '../kostenUebersicht';

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
  it('8 Tage: Wochenpreis 2.121,06 € plus 3 × 450 €', () => {
    const k = berechneKostenUebersicht('fernfahrer', '2026-11-16', '2026-11-23');
    expect(k?.netto).toBe(3471.06);
    expect(k?.brutto).toBe(4130.56);
    expect(k?.positionen.map(p => p.betrag)).toEqual([2121.06, 1350]);
  });
  it('Feiertag 25.12.2026 kostet 450 € ohne Zuschlag', () => {
    expect(berechneKostenUebersicht('fernfahrer', '2026-12-25', '2026-12-25')?.netto).toBe(450);
  });
  it('andere Tarife behalten ihre Zuschläge', () => {
    expect(tarifOhneZuschlaege('fernfahrer')).toBe(true);
    expect(tarifOhneZuschlaege('lkw_ce')).toBe(false);
    // Sa 21.11. + So 22.11.2026 bei 349 €: 436,25 + 523,50
    expect(berechneKostenUebersicht('lkw_ce', '2026-11-21', '2026-11-22')?.netto).toBe(959.75);
    // Wochenpreis MIAG-Zeitraum unverändert 2.933,75 € netto
    expect(berechneKostenUebersicht('lkw_ce_woche', '2026-11-16', '2026-11-23').netto).toBe(2933.75);
    expect(berechneKostenUebersicht('baumaschine', '2026-11-21', '2026-11-21')?.netto).toBe(611.25);
  });
  it('5 Einsatztage kosten exakt 2.121,06 € statt 2.250 € oder 2.120 €', () => {
    expect(berechneKostenUebersicht('fernfahrer', '2026-11-19', '2026-11-23')?.netto).toBe(2121.06);
  });
  it('zusätzlicher sechster Einsatztag kostet 450 €', () => {
    expect(berechneKostenUebersicht('fernfahrer', '2026-11-16', '2026-11-21')?.netto).toBe(2571.06);
  });
  it('weniger als 5 Einsatztage kosten je 450 €', () => {
    expect(berechneKostenUebersicht('fernfahrer', '2026-11-20', '2026-11-23')?.netto).toBe(1800);
  });
  it('10 abrechenbare Tage erhalten zwei Wochenpreise', () => {
    expect(berechneKostenUebersicht('fernfahrer', '2026-11-16', '2026-11-25')?.netto).toBe(4242.12);
  });
  it('5 Tage einschließlich Weihnachten erhalten denselben Wochenpreis ohne Zuschlag', () => {
    expect(berechneKostenUebersicht('fernfahrer', '2026-12-24', '2026-12-28')?.netto).toBe(2121.06);
  });
});
