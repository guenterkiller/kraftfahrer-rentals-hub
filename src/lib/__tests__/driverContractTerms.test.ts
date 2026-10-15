import { describe, it, expect } from 'vitest';
import * as Web from '../driverContractTerms';
import * as Mail from '../../../supabase/functions/_shared/driver-contract-terms';

describe('Vertragsbedingungen verbindliche Fahrerannahme', () => {
  it('Webseite und E-Mail/Server sind wortgleich', () => {
    expect(Web.DRIVER_CONTRACT_VERSION).toBe(Mail.DRIVER_CONTRACT_VERSION);
    expect(Web.BINDING_CONSENT_TEXT).toBe(Mail.BINDING_CONSENT_TEXT);
    expect(Web.buildDriverContractText(20)).toBe(Mail.buildDriverContractText(20));
    expect(Web.buildDriverContractText(25)).toBe(Mail.buildDriverContractText(25));
  });
  it('setzt den Provisionssatz korrekt ein', () => {
    expect(Mail.buildDriverContractText(20)).toContain('(normaler Auftrag) beträgt die Vermittlungsprovision 20 %');
    expect(Mail.buildDriverContractText(25)).toContain('(Sonderauftrag) beträgt die Vermittlungsprovision 25 %');
  });
  it('enthält Mehrstunden/Zuschläge und provisionsfreie Anfahrt', () => {
    const t = Mail.buildDriverContractText(20);
    expect(t).toContain('einschließlich Mehrstunden und einsatzbezogener Zuschläge');
    expect(t).toContain('An- und Abfahrtskosten sind provisionsfrei.');
    expect(t).toContain('unterschrieben und abgestempelt');
    expect(t).toContain('nach Eingang der entsprechenden Zahlung des Bestellers');
  });
  it('unbekannte Werte fallen auf 20 % zurück', () => {
    expect(Mail.normalizeCommissionPct(undefined)).toBe(20);
    expect(Mail.normalizeCommissionPct('25')).toBe(25);
    expect(Mail.normalizeCommissionPct(30)).toBe(20);
  });
});
