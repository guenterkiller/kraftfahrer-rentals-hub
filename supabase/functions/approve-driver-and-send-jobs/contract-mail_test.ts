import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { contractMailAction, interpretSendResult } from "./contract-mail.ts";

Deno.test("Resend-Fehler im Rückgabewert gilt als fehlgeschlagen", () => {
  const r = interpretSendResult({ data: null, error: { name: "validation_error", message: "Domain not verified" } });
  assertEquals(r, { ok: false, error: "Domain not verified" });
});

Deno.test("Antwort ohne Versand-ID gilt als fehlgeschlagen", () => {
  assertEquals(interpretSendResult({ data: null, error: null }).ok, false);
  assertEquals(interpretSendResult(undefined).ok, false);
});

Deno.test("Angenommener Versand mit ID gilt als erfolgreich", () => {
  assertEquals(interpretSendResult({ data: { id: "abc" }, error: null }), { ok: true, messageId: "abc" });
});

Deno.test("Vorhandene Vertragsentscheidung: keine Änderung, kein Versand", () => {
  assertEquals(contractMailAction({ hasDecision: true, hasValidInvite: true, inviteMailSucceeded: false }), "none_decided");
  assertEquals(contractMailAction({ hasDecision: true, hasValidInvite: false, inviteMailSucceeded: false }), "none_decided");
});

Deno.test("Gültiger Link nach fehlgeschlagenem Versand wird erneut versendet (kein neuer Link)", () => {
  assertEquals(contractMailAction({ hasDecision: false, hasValidInvite: true, inviteMailSucceeded: false }), "resend_existing");
});

Deno.test("Gültiger, erfolgreich versandter Link wird nicht erneut versendet", () => {
  assertEquals(contractMailAction({ hasDecision: false, hasValidInvite: true, inviteMailSucceeded: true }), "skip");
});

Deno.test("Ohne gültigen Link wird genau ein neuer angelegt", () => {
  assertEquals(contractMailAction({ hasDecision: false, hasValidInvite: false, inviteMailSucceeded: false }), "create_and_send");
});
