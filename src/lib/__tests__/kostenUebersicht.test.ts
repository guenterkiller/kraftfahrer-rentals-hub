import { describe, it, expect } from 'vitest';
import {
  berechneKostenUebersicht,
  offenePositionen,
  UNTERKUNFT_OPTIONEN,
  VORKALKULATION_HINWEIS,
  OFFENE_KOSTEN_HINWEIS,
  FAHRTKOSTEN_OFFEN,
} from '../kostenUebersicht';
import {
  berechneKostenUebersicht as berechneKostenUebersichtFn,
  offenePositionen as offenePositionenFn,
  UNTERKUNFT_OPTIONEN as UNTERKUNFT_OPTIONEN_FN,
  VORKALKULATION_HINWEIS as VORKALKULATION_HINWEIS_FN,
  OFFENE_KOSTEN_HINWEIS as OFFENE_KOSTEN_HINWEIS_FN,
  FAHRTKOSTEN_OFFEN as FAHRTKOSTEN_OFFEN_FN,
} from '../../../supabase/functions/_shared/kosten-uebersicht';

describe('Kostenübersicht – Modulgleichheit Frontend/Function', () => {
  it('Texte und Optionen sind identisch', () => {
    expect(UNTERKUNFT_OPTIONEN).toEqual(UNTERKUNFT_OPTIONEN_FN);
    expect(VORKALKULATION_HINWEIS).toBe(VORKALKULATION_HINWEIS_FN);
    expect(OFFENE_KOSTEN_HINWEIS).toBe(OFFENE_KOSTEN_HINWEIS_FN);
    expect(FAHRTKOSTEN_OFFEN).toBe(FAHRTKOSTEN_OFFEN_FN);
  });

  it('Berechnungen sind identisch', () => {
    const faelle: Array<[string, string, string]> = [
      ['lkw_ce', '2026-10-19', '2026-10-23'],
      ['lkw_ce', '2026-10-19', '2026-10-25'],
      ['lkw_ce_woche', '2026-10-19', '2026-10-23'],
      ['lkw_ce_woche', '2026-10-19', '2026-10-28'],
      ['fernfahrer', '2026-10-19', '2026-10-21'],
      ['baumaschine', '2026-12-24', '2026-12-26'],
      ['ueberfuehrung', '2026-10-19', '2026-10-20'],
      ['pruefung', '2026-10-19', '2026-10-20'],
    ];
    for (const [tarif, von, bis] of faelle) {
      expect(berechneKostenUebersicht(tarif, von, bis)).toEqual(berechneKostenUebersichtFn(tarif, von, bis));
    }
    expect(offenePositionen('fahrer_organisiert', 120)).toEqual(offenePositionenFn('fahrer_organisiert', 120));
  });
});

describe('Kostenübersicht – Berechnung', () => {
  it('LKW CE: 5 Werktage ohne Zuschlag', () => {
    // 19.10.2026 (Mo) bis 23.10.2026 (Fr)
    const k = berechneKostenUebersicht('lkw_ce', '2026-10-19', '2026-10-23');
    expect(k).not.toBeNull();
    expect(k!.netto).toBe(5 * 349);
    expect(k!.ust).toBeCloseTo(1745 * 0.19, 2);
    expect(k!.brutto).toBeCloseTo(1745 * 1.19, 2);
  });

  it('LKW CE: Samstag +25 %, Sonntag +50 %', () => {
    // 24.10.2026 = Samstag, 25.10.2026 = Sonntag
    const k = berechneKostenUebersicht('lkw_ce', '2026-10-24', '2026-10-25');
    expect(k!.netto).toBeCloseTo(349 * 1.25 + 349 * 1.5, 2);
  });

  it('Wochenpreis: volle Mo–Fr-Woche zu 1.645 €', () => {
    const k = berechneKostenUebersicht('lkw_ce_woche', '2026-10-19', '2026-10-23');
    expect(k!.netto).toBe(1645);
  });

  it('Wochenpreis: Woche + Resttag + Samstag', () => {
    // 19.10.–24.10.2026: 5 Werktage (1.645) + Samstag 349 × 1,25
    const k = berechneKostenUebersicht('lkw_ce_woche', '2026-10-19', '2026-10-24');
    expect(k!.netto).toBeCloseTo(1645 + 349 * 1.25, 2);
  });

  it('Wochenpreis: Feiertag Mo–Fr wird separat zu 349 € + 50 % berechnet', () => {
    // 25.12.2026 (Fr, 1. Weihnachtstag)
    const k = berechneKostenUebersicht('lkw_ce_woche', '2026-12-25', '2026-12-25');
    expect(k!.netto).toBeCloseTo(349 * 1.5, 2);
  });

  it('Fernfahrer: 3 Einsatztage à 450 €', () => {
    const k = berechneKostenUebersicht('fernfahrer', '2026-10-19', '2026-10-21');
    expect(k!.netto).toBe(1350);
  });

  it('Baumaschine: 2 Einsatztage à 489 €', () => {
    const k = berechneKostenUebersicht('baumaschine', '2026-10-19', '2026-10-20');
    expect(k!.netto).toBe(978);
  });

  it('Überführung und Prüfung liefern keine Vorkalkulation', () => {
    expect(berechneKostenUebersicht('ueberfuehrung', '2026-10-19', '2026-10-20')).toBeNull();
    expect(berechneKostenUebersicht('pruefung', '2026-10-19', '2026-10-20')).toBeNull();
  });

  it('Ungültiger Zeitraum liefert null', () => {
    expect(berechneKostenUebersicht('lkw_ce', '', '')).toBeNull();
    expect(berechneKostenUebersicht('lkw_ce', '2026-10-23', '2026-10-19')).toBeNull();
  });

  it('Offene Positionen: Fahrtkosten immer offen, Unterkunft nur bei Fahrer-Organisation', () => {
    expect(offenePositionen('gestellt', null)).toHaveLength(1);
    expect(offenePositionen('keine', null)).toHaveLength(1);
    const mit = offenePositionen('fahrer_organisiert', 150);
    expect(mit).toHaveLength(2);
    expect(mit[1]).toContain('150,00 €');
  });
});
