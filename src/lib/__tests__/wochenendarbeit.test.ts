import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  berechneKostenUebersicht, wochenendarbeitGebucht, gebuchteZuschlagstage, altbestandWochenendeOhneBuchung,
} from '../kostenUebersicht';
import { listSurchargeDays } from '../germanHolidays';

const labels = (k: ReturnType<typeof berechneKostenUebersicht>) => (k?.positionen ?? []).map((p) => p.label);

describe('Wochenendtage nur bei gebuchter Wochenendarbeit', () => {
  it('Völklingen-Fall 17.11.–23.12.2026 CE-Woche ohne Wochenendarbeit: 8.883,00 € netto', () => {
    const k = berechneKostenUebersicht('lkw_ce_woche', '2026-11-17', '2026-12-23');
    expect(k?.netto).toBe(8883);
    expect(k?.positionen.map((p) => p.betrag)).toEqual([8225, 658]);
    expect(labels(k).some((l) => /^(Sa|So),/.test(l))).toBe(false);
  });
  it('derselbe Fall mit ausdrücklicher Wochenendarbeit: 13.681,75 € netto', () => {
    const k = berechneKostenUebersicht('lkw_ce_woche', '2026-11-17', '2026-12-23', { wochenendarbeit: true });
    expect(k?.netto).toBe(13681.75);
    expect(k?.brutto).toBe(16281.28);
  });
  it('CE-Woche Mo–Fr genau 5 Tage: 1.645 €', () => {
    expect(berechneKostenUebersicht('lkw_ce_woche', '2026-11-16', '2026-11-20')?.netto).toBe(1645);
  });
  it('CE-Woche Mo–So ohne Wochenendarbeit: weiterhin 1.645 €', () => {
    expect(berechneKostenUebersicht('lkw_ce_woche', '2026-11-16', '2026-11-22')?.netto).toBe(1645);
  });
  it('nur Sa–So ohne Wochenendarbeit: keine Vorkalkulation', () => {
    expect(berechneKostenUebersicht('lkw_ce_woche', '2026-11-21', '2026-11-22')).toBeNull();
    expect(berechneKostenUebersicht('lkw_ce', '2026-11-21', '2026-11-22')).toBeNull();
  });
  it('CE-Tag Mo–So ohne Wochenendarbeit: 5 × 349 €; mit: plus Sa 436,25 € und So 523,50 €', () => {
    expect(berechneKostenUebersicht('lkw_ce', '2026-11-16', '2026-11-22')?.netto).toBe(1745);
    expect(berechneKostenUebersicht('lkw_ce', '2026-11-16', '2026-11-22', { wochenendarbeit: true })?.netto).toBe(2704.75);
  });
  it('Baumaschine Mo–So ohne Wochenendarbeit: 5 × 489 €', () => {
    expect(berechneKostenUebersicht('baumaschine', '2026-11-16', '2026-11-22')?.netto).toBe(2445);
  });
  it('Feiertag an Werktag bleibt unverändert (3.10.2025, Fr) mit Zuschlag', () => {
    const k = berechneKostenUebersicht('lkw_ce', '2025-10-03', '2025-10-03');
    expect(k?.netto).toBe(523.5);
  });
  it('Event- und Fernfahrer-Pauschale unverändert (jeder Kalendertag, ohne Zuschläge)', () => {
    expect(berechneKostenUebersicht('event', '2026-11-16', '2026-11-22')?.netto).toBe(7 * 489);
    expect(berechneKostenUebersicht('event', '2026-11-16', '2026-11-22', { wochenendarbeit: true })?.netto).toBe(7 * 489);
    expect(berechneKostenUebersicht('fernfahrer', '2026-11-16', '2026-11-22')?.netto)
      .toBe(berechneKostenUebersicht('fernfahrer', '2026-11-16', '2026-11-22', { wochenendarbeit: true })?.netto);
  });
  it('Anforderung wird nur bei exakter Checkbox-Bezeichnung erkannt', () => {
    expect(wochenendarbeitGebucht(['Wochenendarbeit'])).toBe(true);
    expect(wochenendarbeitGebucht(['Nachtschicht'])).toBe(false);
    expect(wochenendarbeitGebucht(undefined)).toBe(false);
  });
  it('Zuschlagstage ohne Wochenendarbeit enthalten keine Sa/So', () => {
    const tage = gebuchteZuschlagstage(listSurchargeDays('2026-11-17', '2026-12-23'), false);
    expect(tage).toEqual([]);
    expect(gebuchteZuschlagstage(listSurchargeDays('2026-11-17', '2026-12-23'), true)).toHaveLength(10);
  });
  it('Altbestand wird erkannt, aber nicht neu berechnet', () => {
    const alt = { positionen: [{ label: 'Sa, 21.11.2026: 349,00 € + 25 % Zuschlag' }] };
    expect(altbestandWochenendeOhneBuchung(alt, null)).toBe(true);
    expect(altbestandWochenendeOhneBuchung(alt, 'ADR-Schein, Wochenendarbeit')).toBe(false);
  });
  it('Frontend- und Servermodul sind inhaltlich identisch', () => {
    const norm = (s: string) => s.replace(/\.ts'/g, "'").replace(/german-holidays|germanHolidays/g, 'H')
      .replace(/supabase\/functions\/_shared\/kosten-uebersicht|src\/lib\/kostenUebersicht/g, 'X');
    expect(norm(readFileSync('src/lib/kostenUebersicht.ts', 'utf8')))
      .toBe(norm(readFileSync('supabase/functions/_shared/kosten-uebersicht.ts', 'utf8')));
  });
});
