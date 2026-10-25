import { describe, expect, it } from 'vitest';
import { parseUnterkunftObergrenze } from '../../../supabase/functions/submit-fahrer-anfrage/unterkunft-obergrenze';

describe('Serverseitige Unterkunfts-Kostenobergrenze', () => {
  it.each([undefined, null, '', ' ', 'ungueltig', true, false, [], {}, -1, '-1', NaN, Infinity, 'Infinity', 0.001, '0,001', '60,555', 60.555, '1e3', '60 €', '60,', 75.01, '75,01', 120, '120,50'])('weist fehlende, ungültige, negative oder über 75 € liegende Werte zurück: %j', (value) => {
    expect(parseUnterkunftObergrenze(value)).toBeNull();
  });
  it.each([[0, 0], ['0', 0], ['0,00', 0], [75, 75], ['75,00', 75], ['59,50', 59.5], ['59.50', 59.5], [0.01, 0.01]])('akzeptiert Beträge von 0 bis 75 €: %j', (input, expected) => {
    expect(parseUnterkunftObergrenze(input)).toBe(expected);
  });
  it('Formular und Server nutzen dieselbe Regel', async () => {
    const { parseUnterkunftObergrenze: client } = await import('../kostenUebersicht');
    for (const v of ['0', '0,00', '60', '59,50', '0,001', '1e3', '', 60, 0]) {
      expect(client(v)).toBe(parseUnterkunftObergrenze(v));
    }
  });
  });
  it('Offene Position: 0 € heißt keine Hotelkosten, sonst Budget genannt', async () => {
    const { offenePositionen, HOTELKOSTEN_KEINE } = await import('../kostenUebersicht');
    expect(offenePositionen('fahrer_organisiert', 0)).toContain(HOTELKOSTEN_KEINE);
    expect(offenePositionen('fahrer_organisiert', 60).join(' ')).toContain('60,00');
  });
});
