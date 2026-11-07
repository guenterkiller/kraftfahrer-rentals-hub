import { assertEquals, assert } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { inviteState, inviteExpiry, rejectionProfileUpdate, mayReceiveOffers, sha256Hex } from "./driver-contract-gate.ts";
import { MEDIATION_CONTRACT_VERSION, buildDecisionHashInput, buildMediationContractText } from "./driver-mediation-contract.ts";

const now = new Date("2026-10-25T12:00:00Z");
const base = { status: "pending", used_at: null, contract_version: MEDIATION_CONTRACT_VERSION };

Deno.test("Link 14 Tage gültig", () => {
  assertEquals(inviteExpiry(now), "2026-11-08T12:00:00.000Z");
  assertEquals(inviteState({ ...base, expires_at: "2026-11-08T12:00:00Z" }, now), "ok");
  assertEquals(inviteState({ ...base, expires_at: "2026-10-25T11:59:59Z" }, now), "expired");
});
Deno.test("benutzter oder veralteter Link ist ungültig", () => {
  assertEquals(inviteState({ ...base, status: "used", used_at: "x", expires_at: "2027-01-01" }, now), "used");
  assertEquals(inviteState({ ...base, contract_version: "alt", expires_at: "2027-01-01" }, now), "outdated");
});
Deno.test("Ablehnung deaktiviert und sperrt Werbe-E-Mails", () => {
  const u = rejectionProfileUpdate("t");
  assertEquals(u.is_inactive, true);
  assertEquals(u.email_opt_out, true);
  assertEquals(u.inactive_reason_code, "contract_rejected");
});
Deno.test("Stichtagsschalter: aus = Betrieb unverändert, an = nur angenommene Fassung", () => {
  assertEquals(mayReceiveOffers(false, null), true);
  assertEquals(mayReceiveOffers(true, null), false);
  assertEquals(mayReceiveOffers(true, "alt"), false);
  assertEquals(mayReceiveOffers(true, MEDIATION_CONTRACT_VERSION), true);
});
Deno.test("Hash reproduzierbar und entscheidungsabhängig", async () => {
  const p = { driverId: "d1", decision: "accept" as const, decidedAt: "2026-10-25T12:00:00Z" };
  assertEquals(await sha256Hex(buildDecisionHashInput(p)), await sha256Hex(buildDecisionHashInput(p)));
  assert(await sha256Hex(buildDecisionHashInput(p)) !== await sha256Hex(buildDecisionHashInput({ ...p, decision: "reject" })));
});
Deno.test("Vertrag ohne 2.500 €, ohne Festanstellung, mit 12 Monaten und § 7a", () => {
  const t = buildMediationContractText();
  assert(!t.includes("2.500"));
  assert(!t.includes("Festanstellung"));
  assert(t.includes("12 Monaten nach Ende des vermittelten Einsatzes"));
  assert(t.includes("§ 7a Haftung des Fahrers"));
  assert(t.includes("sofern er das Nichterscheinen oder die kurzfristige Absage zu vertreten hat"));
  assert(!t.includes("Etwaige Ansprüche des Auftraggebers bleiben hiervon unberührt"));
});
