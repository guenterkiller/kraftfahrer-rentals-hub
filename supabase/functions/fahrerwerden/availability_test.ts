import { assertEquals } from 'https://deno.land/std@0.190.0/testing/asserts.ts';
import { normalizeAvailability } from './availability.ts';

const today = '2026-11-26';
for (const value of ['sofort', 'absprache', 'ab_datum:2026-12-01', 'ab_datum:2026-11-26', 'ab_datum:2028-02-29']) {
  Deno.test(`Verfügbarkeit speichert ${value} unverändert`, () => {
    assertEquals(normalizeAvailability(value, today), { ok: true, value });
  });
}
for (const value of [undefined, null, '']) {
  Deno.test(`Alte Registrierung ohne Auswahl (${String(value)}) bleibt kompatibel`, () => {
    assertEquals(normalizeAvailability(value, today), { ok: true, value: null });
  });
}
for (const value of ['ab_datum:', 'ab_datum:2026-11-25', 'ab_datum:2027-02-29', 'ab_datum:2026-13-01', 'ab_datum:01.12.2026', 'ab_datum:2026-12-01T00:00:00Z', 'wochenweise', { date: today }]) {
  Deno.test(`Ungültige neue Verfügbarkeit wird abgelehnt (${JSON.stringify(value)})`, () => {
    assertEquals(normalizeAvailability(value, today).ok, false);
  });
}