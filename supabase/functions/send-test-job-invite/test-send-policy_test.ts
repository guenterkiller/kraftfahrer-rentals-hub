import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { decideTestSend } from "./test-send-policy.ts";

const offen = { status: "open", approved_at: null };
const frei = { status: "sent", approved_at: "2026-10-19T08:00:00Z" };

Deno.test("interne Testadresse erhält auch nicht freigegebene Aufträge – nur als Vorschau", () => {
  assertEquals(decideTestSend("Guenter.Killer@t-online.de", offen), { allowed: true, createInvite: false });
});
Deno.test("andere Fahrer erhalten keine nicht freigegebenen Aufträge", () => {
  assertEquals(decideTestSend("fahrer@example.com", offen).allowed, false);
  assertEquals(decideTestSend("fahrer@example.com", null).allowed, false);
});
Deno.test("Testversand erzeugt nie Antwortlinks, auch bei freigegebenen Aufträgen", () => {
  assertEquals(decideTestSend("fahrer@example.com", frei), { allowed: true, createInvite: false });
  assertEquals(decideTestSend("guenter.killer@t-online.de", frei), { allowed: true, createInvite: false });
});
