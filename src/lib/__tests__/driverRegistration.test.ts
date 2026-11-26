import { describe, it, expect } from 'vitest';
import { availabilityError, serializeAvailability, displayAvailability, registrationToday, registrationDeclarationErrors } from '../driverRegistration';
import { normalizeAvailability } from '../../../preview/fahrer-registration/availability';

const today = '2026-11-26';
describe('Fahrerregistrierung: Verfügbarkeit und zwei Kenntnisnahmen', () => {
  it.each(['sofort', 'absprache'])('%s wird ohne Datum gespeichert', choice => {
    expect(availabilityError(choice, '2020-01-01', today)).toBeNull();
    expect(serializeAvailability(choice, '2020-01-01')).toBe(choice);
    expect(normalizeAvailability(choice, today)).toEqual({ ok: true, value: choice });
  });
  it('Ab Datum speichert das echte Kalenderdatum im vorhandenen Textfeld', () => {
    expect(availabilityError('ab_datum', '2026-12-01', today)).toBeNull();
    expect(serializeAvailability('ab_datum', '2026-12-01')).toBe('ab_datum:2026-12-01');
    expect(normalizeAvailability('ab_datum:2026-12-01', today)).toEqual({ ok: true, value: 'ab_datum:2026-12-01' });
    expect(displayAvailability('ab_datum:2026-12-01')).toBe('Ab 01.12.2026');
  });
  it('heute ist zulässig, gestern nicht', () => {
    expect(availabilityError('ab_datum', today, today)).toBeNull();
    expect(normalizeAvailability(`ab_datum:${today}`, today).ok).toBe(true);
    expect(availabilityError('ab_datum', '2026-11-25', today)).not.toBeNull();
    expect(normalizeAvailability('ab_datum:2026-11-25', today).ok).toBe(false);
  });
  it.each(['', '2027-02-29', '2026-02-30', '2026-13-01', '01.12.2026', '2026-12-01T00:00:00Z'])('fehlendes/unechtes Datum %s scheitert beidseitig', date => {
    expect(availabilityError('ab_datum', date, today)).not.toBeNull();
    expect(normalizeAvailability(`ab_datum:${date}`, today).ok).toBe(false);
  });
  it('Schaltjahr wird akzeptiert', () => {
    expect(availabilityError('ab_datum', '2028-02-29', today)).toBeNull();
    expect(normalizeAvailability('ab_datum:2028-02-29', today).ok).toBe(true);
  });
  it('unbekannte neue Auswahl wird zurückgewiesen', () => {
    expect(availabilityError('wochenweise', '', today)).not.toBeNull();
    expect(normalizeAvailability('wochenweise', today).ok).toBe(false);
    expect(normalizeAvailability({ date: today }, today).ok).toBe(false);
  });
  it('Altformular ohne Verfügbarkeit bleibt kompatibel', () => {
    expect(availabilityError('', '', today)).toBeNull();
    expect(serializeAvailability('', '')).toBeNull();
    expect(normalizeAvailability(undefined, today)).toEqual({ ok: true, value: null });
  });
  it.each([
    ['kurzfristig', 'kurzfristig verfügbar'], ['tageweise', 'tageweise verfügbar'],
    ['wochenweise', 'wochenweise verfügbar'], ['absprache', 'Nach Absprache'],
    ['sofort', 'Ab sofort'], ['individueller Altwert', 'individueller Altwert'],
    [null, 'Nicht angegeben'], ['ab_datum:2020-01-01', 'Ab 01.01.2020'],
  ])('Admin erhält Altwert %s unverändert', (input, output) => {
    expect(displayAvailability(input)).toBe(output);
  });
  it('Tagesgrenze richtet sich nach Berlin, nicht UTC', () => {
    expect(registrationToday(new Date('2026-11-25T23:30:00Z'))).toBe('2026-11-26');
    expect(registrationToday(new Date('2026-06-01T22:30:00Z'))).toBe('2026-06-02');
  });
  it('Datenschutzkenntnisnahme bleibt Pflicht', () => {
    expect(Object.keys(registrationDeclarationErrors(false, true))).toEqual(['datenschutz']);
  });
  it('Unternehmererklärung bleibt Pflicht', () => {
    expect(Object.keys(registrationDeclarationErrors(true, false))).toEqual(['gewerbenachweis_bestaetigt']);
  });
  it('beide Kenntnisnahmen reichen ohne Vertragsannahme oder dritte Erklärung', () => {
    expect(registrationDeclarationErrors(true, true)).toEqual({});
    expect(Object.keys(registrationDeclarationErrors(false, false))).toHaveLength(2);
  });
});