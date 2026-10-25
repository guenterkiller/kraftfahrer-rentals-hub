import { describe, expect, it } from 'vitest';
import * as web from '../customerConfirmation';
import * as server from '../../../supabase/functions/_shared/customer-confirmation';

describe('Kundenbestätigung', () => {
  it('speichert die ausdrückliche Bestätigung mit exaktem freigegebenem Wortlaut', () => {
    const result = server.validateCustomerConfirmation({ bedingungen_akzeptiert: true, bedingungen_fassung: web.CUSTOMER_TERMS_VERSION });
    expect(result.ok).toBe(true);
    if (result.ok === false) throw new Error(result.error);
    expect(result.evidence.customer_confirmation_given).toBe(true);
    expect(result.evidence.customer_confirmation_text).toBe('Ich bestätige, dass meine Angaben vollständig und richtig sind, und akzeptiere die Vermittlungsbedingungen einschließlich der Preis- und Zuschlagsregelungen. Mir ist bekannt, dass ein kostenpflichtiger Auftrag erst nach Bestätigung durch Fahrerexpress und erfolgreicher Fahrerzuteilung entsteht.');
    expect(result.evidence.customer_terms_text).toBe(web.CUSTOMER_TERMS_TEXT);
    expect(result.evidence.customer_confirmation_at).toBeNull();
    expect(Object.keys(result.evidence)).toHaveLength(5);
  });
  it('weist fehlende oder falsche Pflichtbestätigung strikt ab', () => {
    for (const value of [undefined, false, null, 'true', 1]) {
      expect(server.validateCustomerConfirmation({ bedingungen_akzeptiert: value, bedingungen_fassung: web.CUSTOMER_TERMS_VERSION }).ok).toBe(false);
    }
  });
  it('weist fehlende und unbekannte Fassung ab', () => {
    for (const value of [undefined, '', 'alt', 1]) expect(server.validateCustomerConfirmation({ bedingungen_akzeptiert: true, bedingungen_fassung: value }).ok).toBe(false);
  });
  it('erhält den Altformularweg ohne erfundenen Nachweis', () => {
    const result = server.validateCustomerConfirmation({ datenschutz: true });
    expect(result.ok).toBe(true);
    if (result.ok === false) throw new Error(result.error);
    expect(Object.values(result.evidence)).toEqual([null, null, null, null, null]);
    expect(server.validateCustomerConfirmation({ bedingungen_akzeptiert: false, datenschutz: true }).ok).toBe(false);
    expect(server.validateCustomerConfirmation({ datenschutz: 'true' }).ok).toBe(false);
  });
  it('übernimmt keine clientseitigen Texte oder Zeitangaben', () => {
    const input = { bedingungen_akzeptiert: true, bedingungen_fassung: web.CUSTOMER_TERMS_VERSION, customer_terms_text: 'FALSCH', customer_confirmation_at: '2000-01-01', ip: 'TEST' };
    const result = server.validateCustomerConfirmation(input);
    if (result.ok === false) throw new Error(result.error);
    expect(result.evidence.customer_terms_text).toBe(web.CUSTOMER_TERMS_TEXT);
    expect(result.evidence.customer_confirmation_at).toBeNull();
    expect(result.evidence).not.toHaveProperty('ip');
  });
  it('zeigt nur vollständige gespeicherte Nachweise als Bestätigung', () => {
    const result = server.validateCustomerConfirmation({ bedingungen_akzeptiert: true, bedingungen_fassung: web.CUSTOMER_TERMS_VERSION });
    if (result.ok === false) throw new Error(result.error);
    expect(web.hasCustomerConfirmation({})).toBe(false);
    expect(web.hasCustomerConfirmation(result.evidence)).toBe(false);
    expect(web.hasCustomerConfirmation({ ...result.evidence, customer_confirmation_at: '2026-10-25T17:00:00Z' })).toBe(true);
    expect(web.hasCustomerConfirmation({ ...result.evidence, customer_confirmation_at: 'ungültig' })).toBe(false);
  });
  it('Frontend und Server verwenden identische Fassungen und Texte', () => {
    expect(web.CUSTOMER_TERMS_VERSION).toBe(server.CUSTOMER_TERMS_VERSION);
    expect(web.CUSTOMER_CONFIRMATION_TEXT).toBe(server.CUSTOMER_CONFIRMATION_TEXT);
    expect(web.CUSTOMER_TERMS_TEXT).toBe(server.CUSTOMER_TERMS_TEXT);
    expect(web.CUSTOMER_TERMS_SECTIONS).toEqual(server.CUSTOMER_TERMS_SECTIONS);
  });
});