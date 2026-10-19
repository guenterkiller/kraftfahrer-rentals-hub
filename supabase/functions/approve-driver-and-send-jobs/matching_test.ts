import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { selectOfferableJobs, inviteDecision, MAX_INVITES } from "./matching.ts";

// Beispieldaten – keine Datenbank, keine E-Mails.
const fahrer = { id: "d1", fuehrerscheinklassen: ["CE"] };
const zukunft = "26.10.2030 bis 31.10.2030";
const job = (id: string, extra: Record<string, unknown> = {}) => ({
  id, status: "sent", approved_at: "2026-10-19T08:00:00Z", fuehrerscheinklasse: "C+E", zeitraum: zukunft, ...extra,
});

Deno.test("1 neuer offener Auftrag ohne Freigabe wird nicht angeboten", () => {
  const r = selectOfferableJobs(fahrer, [job("a", { status: "open", approved_at: null })]);
  assertEquals(r.matchingJobs.length, 0);
});

Deno.test("2+3 freigegebener passender Auftrag wird neuem Fahrer angeboten", () => {
  const r = selectOfferableJobs(fahrer, [job("a")]);
  assertEquals(r.matchingJobs.map((j) => j.id), ["a"]);
});

Deno.test("abgelehnte, stornierte, erledigte, zugewiesene Aufträge nie", () => {
  const r = selectOfferableJobs(fahrer, ["rejected", "cancelled", "completed", "assigned"].map((s) => job(s, { status: s })));
  assertEquals(r.matchingJobs.length, 0);
});

Deno.test("abgelaufener Zeitraum und unklarer Zeitraum werden übersprungen", () => {
  const r = selectOfferableJobs(fahrer, [job("alt", { zeitraum: "01.01.2024 bis 05.01.2024" }), job("unklar", { zeitraum: "nach Absprache" })]);
  assertEquals(r.matchingJobs.length, 0);
  assertEquals(r.skippedExpired, 2);
});

Deno.test("Führerscheinklasse muss passen (CE deckt C ab, C deckt CE nicht ab)", () => {
  assertEquals(selectOfferableJobs(fahrer, [job("c", { fuehrerscheinklasse: "C" })]).matchingJobs.length, 1);
  const r = selectOfferableJobs({ fuehrerscheinklassen: ["C"] }, [job("ce")]);
  assertEquals(r.matchingJobs.length, 0);
  assertEquals(r.skippedNoMatch, 1);
  assertEquals(selectOfferableJobs({ fuehrerscheinklassen: [] }, [job("x")]).matchingJobs.length, 0);
});

Deno.test("5 bereits abgelehnter oder vorhandener Auftrag wird nicht erneut gesendet", () => {
  assertEquals(inviteDecision({ id: "i", status: "declined" }, 0), "duplicate");
  assertEquals(inviteDecision({ id: "i", status: "expired" }, 0), "duplicate");
  assertEquals(inviteDecision(null, 0), "create");
});

Deno.test("höchstens 5 Angebote je Freischaltung", () => {
  assertEquals(inviteDecision(null, MAX_INVITES - 1), "create");
  assertEquals(inviteDecision(null, MAX_INVITES), "limit");
});
