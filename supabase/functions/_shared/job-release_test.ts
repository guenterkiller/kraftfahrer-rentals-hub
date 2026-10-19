import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { isJobReleased, isDriverActive } from "./job-release.ts";

Deno.test("neuer offener Auftrag ohne Freigabe ist nicht freigegeben", () => {
  assertEquals(isJobReleased({ status: "open", approved_at: null }), false);
});
Deno.test("ausdrücklich freigegebener Auftrag ist versendbar", () => {
  assertEquals(isJobReleased({ status: "approved", approved_at: "2026-10-19T08:00:00Z" }), true);
  assertEquals(isJobReleased({ status: "sent", approved_at: "2026-10-19T08:00:00Z" }), true);
});
Deno.test("abgelehnte, stornierte, erledigte, zugewiesene Aufträge nie", () => {
  for (const s of ["rejected", "cancelled", "completed", "assigned", "confirmed"]) {
    assertEquals(isJobReleased({ status: s, approved_at: "2026-10-19T08:00:00Z" }), false, s);
  }
});
Deno.test("deaktivierte oder gesperrte Fahrer sind nicht aktiv", () => {
  assertEquals(isDriverActive({ status: "approved", is_blocked: false, is_inactive: false }), true);
  assertEquals(isDriverActive({ status: "approved", is_inactive: true }), false);
  assertEquals(isDriverActive({ status: "approved", is_blocked: true }), false);
  assertEquals(isDriverActive({ status: "pending" }), false);
  assertEquals(isDriverActive(null), false);
});
