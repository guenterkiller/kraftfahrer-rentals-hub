import { describe, expect, it } from 'vitest';
import { parseUnterkunftObergrenze } from '../../../supabase/functions/submit-fahrer-anfrage/unterkunft-obergrenze';

describe('Serverseitige Unterkunfts-Kostenobergrenze', () => {
  it.each([undefined, null, '', ' ', 'ungueltig', true, false, [], {}, -1, '-1', 0, '0', '0,00', NaN, Infinity, 'Infinity', 0.001, '0,001', '60,555', 60.555, '1e3', '60 €', '60,'])('weist fehlende, ungültige oder nicht positive Werte zurück: %j', (value) => {
    expect(parseUnterkunftObergrenze(value)).toBeNull();
  });
  it.each([[120, 120], ['120,50', 120.5], ['120.50', 120.5], [0.01, 0.01]])('akzeptiert positive Beträge: %j', (input, expected) => {
    expect(parseUnterkunftObergrenze(input)).toBe(expected);
  });
  it('Formular und Server nutzen dieselbe Regel', async () => {
    const { parseUnterkunftObergrenze: client } = await import('../kostenUebersicht');
    for (const v of ['0', '0,00', '60', '59,50', '0,001', '1e3', '', 60, 0]) {
      expect(client(v)).toBe(parseUnterkunftObergrenze(v));
    }
  });
});