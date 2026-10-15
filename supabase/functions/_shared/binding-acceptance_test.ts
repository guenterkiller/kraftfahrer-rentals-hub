import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { checkBindingInvite, computeBindingExpiry, generateToken, sha256Hex, stableStringify } from "./binding-acceptance.ts";
import { buildBindingAcceptancePdf } from "./binding-acceptance-pdf.ts";

const now = new Date("2026-10-15T12:00:00Z");
const inv = (o: Record<string, unknown> = {}) => ({
  purpose: "binding", status: "pending", token_expires_at: "2026-10-16T12:00:00Z",
  driver_id: "d1", assignment_id: "a1", ...o,
});
const asg = (o: Record<string, unknown> = {}) => ({ id: "a1", driver_id: "d1", status: "confirmed", ...o });

Deno.test("Link gültig", () => assertEquals(checkBindingInvite(inv(), asg(), now), "ok"));
Deno.test("Link abgelaufen", () => assertEquals(checkBindingInvite(inv({ token_expires_at: "2026-10-15T11:59:00Z" }), asg(), now), "expired"));
Deno.test("Link schon genutzt", () => assertEquals(checkBindingInvite(inv({ status: "accepted" }), asg(), now), "already_answered"));
Deno.test("falscher Fahrer", () => assertEquals(checkBindingInvite(inv(), asg({ driver_id: "d2" }), now), "invalid"));
Deno.test("Interessens-Link wird nicht akzeptiert", () => assertEquals(checkBindingInvite(inv({ purpose: "interest" }), asg(), now), "invalid"));
Deno.test("stornierte Zuteilung", () => assertEquals(checkBindingInvite(inv(), asg({ status: "cancelled" }), now), "cancelled"));

Deno.test("Frist 48 h, längstens bis Einsatzbeginn", () => {
  assertEquals(computeBindingExpiry(now, null).toISOString(), "2026-10-17T12:00:00.000Z");
  assertEquals(computeBindingExpiry(now, "2026-10-16T06:00:00Z").toISOString(), "2026-10-16T06:00:00.000Z");
  assertEquals(computeBindingExpiry(now, "2026-11-01T06:00:00Z").toISOString(), "2026-10-17T12:00:00.000Z");
});

Deno.test("Link-Code 32 Byte, eindeutig", () => {
  const a = generateToken(), b = generateToken();
  assertEquals(a.length, 64); assert(a !== b);
});

Deno.test("Fingerabdruck stabil bei Schlüsselreihenfolge", async () => {
  assertEquals(await sha256Hex(stableStringify({ b: 1, a: [1, { y: 2, x: 1 }] })), await sha256Hex(stableStringify({ a: [1, { x: 1, y: 2 }], b: 1 })));
});

Deno.test("PDF wird mit Umlauten und Euro erzeugt", async () => {
  const pdf = await buildBindingAcceptancePdf({
    acceptedAtLocal: "15.10.2026, 14:00:00", driverName: "Jörg Müßig", driverId: "d1", jobId: "j1", assignmentId: "a1",
    contractVersion: "2026-10-15", commissionPct: 25, jobLines: [["Vereinbarte Vergütung", "349,00 € netto je Einsatztag"]],
    contractText: "1. Vermittlungsprovision\nÄußerst „wichtig“ – 25 %", consentText: "Ich stimme zu.", contentHash: "abc",
  });
  assert(pdf.length > 1000);
  await Deno.writeFile("/tmp/binding-test.pdf", pdf).catch(() => {});
});
