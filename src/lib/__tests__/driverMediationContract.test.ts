import { describe, it, expect } from 'vitest';
import * as Web from '../driverMediationContract';
import * as Srv from '../../../supabase/functions/_shared/driver-mediation-contract';

describe('Vermittlungsvertrag Fahrer', () => {
  it('Webseite und Server sind wortgleich', () => {
    expect(Web.MEDIATION_CONTRACT_VERSION).toBe(Srv.MEDIATION_CONTRACT_VERSION);
    expect(Web.MEDIATION_ACCEPT_TEXT).toBe(Srv.MEDIATION_ACCEPT_TEXT);
    expect(Web.MEDIATION_REJECT_TEXT).toBe(Srv.MEDIATION_REJECT_TEXT);
    expect(Web.REGISTRATION_CONTRACT_NOTICE).toBe(Srv.REGISTRATION_CONTRACT_NOTICE);
    expect(Web.buildMediationContractText()).toBe(Srv.buildMediationContractText());
  });
  it('Link ist 14 Tage gültig', () => {
    expect(Web.CONTRACT_LINK_VALID_DAYS).toBe(14);
  });
  it('Provision 20/25 % unverändert, Zahlung 14 Tage (Fassung 2026-11-07)', () => {
    const t = Web.buildMediationContractText();
    expect(t).toContain('normale Aufträge 20 % und für Sonderaufträge 25 %');
    expect(t).not.toContain('Eingang der entsprechenden Zahlung des Bestellers');
    expect(t).toContain('innerhalb von 14 Kalendertagen zur Zahlung fällig');
    expect(t).toContain('keine Voraussetzung für die Fälligkeit');
    expect(t).toContain('unterschrieben und abgestempelt');
  });
  it('keine 2.500-€-Pauschale und keine Festanstellung', () => {
    const t = Web.buildMediationContractText();
    expect(t).not.toContain('2.500');
    expect(t).not.toContain('Festanstellung');
  });
  it('neue Fassung eindeutig gekennzeichnet, § 6 Abs. 2 neu, § 9 Zustimmung', () => {
    const t = Web.buildMediationContractText();
    expect(Web.MEDIATION_CONTRACT_VERSION).toBe('2026-11-07');
    expect(t).toContain('Fassung 2026-11-07');
    expect(t).toContain('innerhalb von zwölf Monaten nach Beendigung');
    expect(t).toContain('bereits zuvor bestehenden Geschäftsbeziehung');
    expect(t).not.toContain('unabhängig davon, ob die Beauftragung direkt');
    expect(t).toContain('erst nach erneuter ausdrücklicher Zustimmung');
  });
});
