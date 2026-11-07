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
  it('Provision 20/25 % und Zahlungs-/Leistungsberichtsregel unverändert', () => {
    const t = Web.buildMediationContractText();
    expect(t).toContain('normale Aufträge 20 % und für Sonderaufträge 25 %');
    expect(t).toContain('grundsätzlich nach Eingang der entsprechenden Zahlung des Bestellers');
    expect(t).toContain('unterschrieben und abgestempelt');
  });
  it('keine 2.500-€-Pauschale und keine Festanstellung', () => {
    const t = Web.buildMediationContractText();
    expect(t).not.toContain('2.500');
    expect(t).not.toContain('Festanstellung');
  });
});
