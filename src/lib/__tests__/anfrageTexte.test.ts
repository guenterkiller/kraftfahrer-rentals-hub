import { describe, it, expect } from 'vitest';
import { gebuchteFeiertage, zuschlagHinweis, ANFRAGE_FORMULAR_TEXT, ANFRAGE_EINGANG_TEXT } from '@/lib/kostenUebersicht';

describe('Anfragetexte und Zuschlagshinweis', () => {
  it('Anfrage ist unverbindlich, keine „verbindliche Anfrage“', () => {
    for (const t of [ANFRAGE_FORMULAR_TEXT, ANFRAGE_EINGANG_TEXT]) {
      expect(t).toContain('unverbindliche Fahreranfrage');
      expect(t).not.toMatch(/(?<![Uu]n)verbindliche Anfrage/);
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
