import { describe, expect, it } from "vitest";
import { contractInviteState, matchesContractDriver } from "../driverContractInvites";
import { MEDIATION_CONTRACT_VERSION } from "../driverMediationContract";

const now = Date.parse("2026-10-25T15:00:00Z");
const invite = { status: "pending", used_at: null, expires_at: "2026-11-08T15:00:00Z", contract_version: MEDIATION_CONTRACT_VERSION };

describe("Lesende Vertragseinladungsübersicht", () => {
  it("erkennt offene und exakt zum Ablaufzeitpunkt abgelaufene Links ohne Änderung der Daten", () => {
    expect(contractInviteState(invite, now)).toBe("pending");
    expect(contractInviteState(invite, Date.parse(invite.expires_at))).toBe("expired");
    expect(invite.status).toBe("pending");
  });
  it("unterscheidet verwendete, ersetzte und veraltete Links statt Vertragsannahmen zu erfinden", () => {
    expect(contractInviteState({ ...invite, status: "used" }, now)).toBe("used");
    expect(contractInviteState({ ...invite, used_at: "2026-10-25T14:00:00Z" }, now)).toBe("used");
    expect(contractInviteState({ ...invite, status: "superseded" }, now)).toBe("superseded");
    expect(contractInviteState({ ...invite, contract_version: "2025-01-01" }, now)).toBe("outdated");
  });
  it("findet Vorname, Nachname und E-Mail ohne Beachtung der Großschreibung", () => {
    const driver = { vorname: "Erika", nachname: "Muster", email: "erika@example.invalid" };
    for (const term of ["ERIKA", "muster", "Erika Muster", "Muster Erika", "ERIKA@EXAMPLE.INVALID", ""]) {
      expect(matchesContractDriver(driver, term)).toBe(true);
    }
    expect(matchesContractDriver(driver, "anderer Fahrer")).toBe(false);
    expect(matchesContractDriver(null, "Erika")).toBe(false);
  });
});