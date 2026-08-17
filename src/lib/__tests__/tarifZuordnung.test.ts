import { describe, it, expect } from 'vitest';
import { resolveTarif } from '../tarifZuordnung';
import { listSurchargeDays, analyzeWeekendHoliday } from '../germanHolidays';

describe('resolveTarif', () => {
  it('setzt Baumaschinentarif bei bestätigter Maschinenbedienung, auch wenn LKW CE gewählt wurde', () => {
    const r = resolveTarif({ kategorie: 'LKW CE', maschinenbedienung: 'ja' });
    expect(r.tarif).toBe('baumaschine');
    expect(r.netto).toBe(489);
    expect(r.mehrstunde).toBe(60);
    expect(r.needsReview).toBe(false);
  });

  it('ordnet Estrichpumpe/Pumptruck im Freitext dem Baumaschinentarif zu', () => {
    const r = resolveTarif({
      kategorie: 'LKW CE',
      maschinenbedienung: 'nein',
      beschreibung: 'Fahren eines Estrich-Pumptrucks, Estrichpumpe vor Ort',
    });
    expect(r.tarif).toBe('baumaschine');
    expect(r.netto).toBe(489);
    expect(r.mehrstunde).toBe(60);
    expect(r.needsReview).toBe(false);
  });

  it('markiert unklare Angabe zur Prüfung und nennt keinen Fahrertyp', () => {
    const r = resolveTarif({ kategorie: 'LKW CE', maschinenbedienung: 'unklar' });
    expect(r.tarif).toBe('pruefung');
    expect(r.netto).toBeNull();
    expect(r.label).not.toMatch(/LKW|Baumaschinenführer \/ Mischmeister \(/);
  });

  it('verlangt Tarifzuordnung, wenn Kategorie Baumaschinenführer ohne beschriebene Anlagenbedienung gewählt wird', () => {
    const r = resolveTarif({ kategorie: 'Baumaschinenführer / Mischmeister', maschinenbedienung: 'nein' });
    expect(r.tarif).toBe('pruefung');
  });

  it('behält LKW-CE-, Wochen- und Fernfahrertarif bei reinem Transport', () => {
    expect(resolveTarif({ kategorie: 'LKW CE', maschinenbedienung: 'nein' })).toMatchObject({ tarif: 'lkw_ce', netto: 349 });
    expect(resolveTarif({ kategorie: 'LKW CE Wochenpreis', maschinenbedienung: 'nein' })).toMatchObject({ tarif: 'lkw_ce_woche', netto: 1645 });
    expect(resolveTarif({ kategorie: 'LKW CE', maschinenbedienung: 'nein', longDistance: true })).toMatchObject({ tarif: 'fernfahrer', netto: 450 });
  });
});

describe('Wochenend- und Feiertagserkennung', () => {
  it('erkennt Samstag mit 25 % und Sonntag mit 50 % im Zeitraum 28.08.-04.09.2026', () => {
    const days = listSurchargeDays('2026-08-28', '2026-09-04');
    const sa = days.filter((d) => d.kind === 'samstag');
    const so = days.filter((d) => d.kind === 'sonntag');
    expect(sa.length).toBe(1);
    expect(so.length).toBe(1);
    expect(sa[0].percent).toBe(25);
    expect(so[0].percent).toBe(50);
    expect(sa[0].label).toContain('29.08.2026');
    expect(so[0].label).toContain('30.08.2026');
    expect(analyzeWeekendHoliday('2026-08-28', '2026-09-04').affected).toBe(true);
  });

  it('erkennt gesetzliche Feiertage mit 50 %', () => {
    const days = listSurchargeDays('2026-05-01', '2026-05-01');
    expect(days).toHaveLength(1);
    expect(days[0].kind).toBe('feiertag');
    expect(days[0].percent).toBe(50);
    expect(days[0].label).toContain('Tag der Arbeit');
  });

  it('liefert keine Zuschlagstage für reine Werktage', () => {
    expect(listSurchargeDays('2026-08-31', '2026-09-02')).toHaveLength(0);
  });
});
