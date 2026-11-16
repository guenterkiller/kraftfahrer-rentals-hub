import { describe, it, expect } from 'vitest';
import { gebuchteFeiertage, zuschlagHinweis, ANFRAGE_FORMULAR_TEXT, ANFRAGE_EINGANG_TEXT, ANFRAGE_AUFTRAG_ENTSTEHUNG, ANFRAGE_NAECHSTER_SCHRITT, EINSATZBESTAETIGUNG_TITEL, EINSATZBESTAETIGUNG_TEXT } from '@/lib/kostenUebersicht';

describe('Anfragetexte und Zuschlagshinweis', () => {
  it('Anfrage ist unverbindlich, keine „verbindliche Anfrage“', () => {
    for (const t of [ANFRAGE_FORMULAR_TEXT, ANFRAGE_EINGANG_TEXT]) {
      expect(t).toContain('unverbindlich');
      expect(t).not.toMatch(/(?<![Uu]n)verbindliche Anfrage/);
    }
  });
  it('nur zwei externe Status; Zuweisung statt Fahrerannahme', () => {
    expect(ANFRAGE_EINGANG_TEXT).toContain('Ihre Fahreranfrage ist eingegangen');
    expect(ANFRAGE_EINGANG_TEXT).toContain('keine Kosten');
    expect(ANFRAGE_AUFTRAG_ENTSTEHUNG).toContain('Einsatzbestätigung durch Fahrerexpress');
    expect(ANFRAGE_AUFTRAG_ENTSTEHUNG).toContain('Fahrer verbindlich zugewiesen');
    expect(ANFRAGE_NAECHSTER_SCHRITT).toContain('Nach der verbindlichen Zuweisung');
    expect(EINSATZBESTAETIGUNG_TITEL).toBe('Einsatzbestätigung durch Fahrerexpress');
    expect(EINSATZBESTAETIGUNG_TEXT).toContain('Fahrerexpress hat');
    for (const t of [ANFRAGE_FORMULAR_TEXT, ANFRAGE_EINGANG_TEXT, ANFRAGE_AUFTRAG_ENTSTEHUNG, ANFRAGE_NAECHSTER_SCHRITT, EINSATZBESTAETIGUNG_TEXT]) {
      expect(t).not.toMatch(/Annahme durch einen Fahrer|Fahrer (hat )?(angenommen|abgelehnt)|Interessenanfrage|Kandidaten|Verfügbarkeitsprüfung/);
    }
  });
  it('Völklingen-Zeitraum ohne Wochenendarbeit: kein Hinweis', () => {
    expect(gebuchteFeiertage('2026-11-17', '2026-12-23', false)).toEqual([]);
    expect(zuschlagHinweis(false, [])).toBeNull();
  });
  it('Feiertag am Samstag ohne Wochenendarbeit zählt nicht (26.12.2026)', () => {
    expect(gebuchteFeiertage('2026-12-21', '2026-12-27', false)).toEqual(['Fr, 25.12.2026 (1. Weihnachtstag)']);
    expect(gebuchteFeiertage('2026-12-21', '2026-12-27', true)).toHaveLength(2);
  });
  it('Werktags-Feiertag: Hinweis nur mit 50 % bei tatsächlichem Einsatz', () => {
    const h = zuschlagHinweis(false, ['Fr, 25.12.2026 (1. Weihnachtstag)']);
    expect(h).toContain('50 %');
    expect(h).not.toContain('25 %');
  });
  it('Mit Wochenendarbeit: Samstag 25 %, Sonntag 50 %', () => {
    expect(zuschlagHinweis(true, [])).toContain('Samstagen ein Zuschlag von 25 %');
  });
});
