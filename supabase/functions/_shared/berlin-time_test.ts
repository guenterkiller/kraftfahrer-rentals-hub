import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  berlinLocalToUtcIso, utcIsoToBerlinLocal, formatAssignmentPeriod, deadlineStartIso, TIME_NOT_ENTERED_NOTE,
} from "./berlin-time.ts";
import { buildJobLines } from "../respond-invite/binding.ts";

Deno.test("Sommerzeit: 07:00 Berlin = 05:00 UTC", () => {
  assertEquals(berlinLocalToUtcIso("2026-07-15T07:00"), "2026-07-15T05:00:00.000Z");
});

Deno.test("Winterzeit: 07:00 Berlin = 06:00 UTC", () => {
  assertEquals(berlinLocalToUtcIso("2026-12-15T07:00"), "2026-12-15T06:00:00.000Z");
});

Deno.test("Einsatz über Mitternacht wird identisch dargestellt", () => {
  const s = berlinLocalToUtcIso("2026-10-22T22:00")!, e = berlinLocalToUtcIso("2026-10-23T06:00")!;
  assertEquals(formatAssignmentPeriod(s, e, true), "22.10.2026, 22:00 Uhr – 23.10.2026, 06:00 Uhr");
});

Deno.test("Einsatz über die Zeitumstellung (25.10.2026)", () => {
  const s = berlinLocalToUtcIso("2026-10-24T20:00")!, e = berlinLocalToUtcIso("2026-10-25T08:00")!;
  assertEquals(s, "2026-10-24T18:00:00.000Z");
  assertEquals(e, "2026-10-25T07:00:00.000Z");
  assertEquals((new Date(e).getTime() - new Date(s).getTime()) / 3600000, 13);
  assertEquals(formatAssignmentPeriod(s, e, true), "24.10.2026, 20:00 Uhr – 25.10.2026, 08:00 Uhr");
});

Deno.test("Umstellung auf Sommerzeit (28.03.2027)", () => {
  assertEquals(berlinLocalToUtcIso("2027-03-28T01:00"), "2027-03-28T00:00:00.000Z");
  assertEquals(berlinLocalToUtcIso("2027-03-28T04:00"), "2027-03-28T02:00:00.000Z");
});

Deno.test("Rückumwandlung für Eingabefelder", () => {
  assertEquals(utcIsoToBerlinLocal("2026-10-25T07:00:00.000Z"), "2026-10-25T08:00");
  assertEquals(utcIsoToBerlinLocal("2026-07-15T05:00:00.000Z"), "2026-07-15T07:00");
});

Deno.test("Altbestand ohne Uhrzeit: nur Datum, gesondert gekennzeichnet", () => {
  assertEquals(
    formatAssignmentPeriod("2026-10-22T00:00:00+00:00", "2026-10-23T00:00:00+00:00", null),
    `22.10.2026 – 23.10.2026`,
  );
});

Deno.test("Frist: tatsächlicher Beginn bzw. Tagesbeginn Berlin bei Altbestand", () => {
  assertEquals(deadlineStartIso("2026-10-22T05:00:00.000Z", true), "2026-10-22T05:00:00.000Z");
  assertEquals(deadlineStartIso("2026-10-22T00:00:00+00:00", null), "2026-10-21T22:00:00.000Z");
  assertEquals(deadlineStartIso("2026-12-22T00:00:00+00:00", null), "2026-12-21T23:00:00.000Z");
});

Deno.test("Annahmeseite/Nachweis/PDF nutzen dieselbe Darstellung", () => {
  const s = berlinLocalToUtcIso("2026-10-22T22:00")!, e = berlinLocalToUtcIso("2026-10-23T06:00")!;
  const lines = buildJobLines({}, { start_date: s, end_date: e, times_entered: true, rate_value: 349, rate_type: "daily" });
  assertEquals(lines.find(([k]) => k === "Einsatzbeginn und -dauer")![1], formatAssignmentPeriod(s, e, true));
});

Deno.test("Frontend-Kopie ist identisch", async () => {
  const a = await Deno.readTextFile(new URL("./berlin-time.ts", import.meta.url));
  const b = await Deno.readTextFile(new URL("../../../src/lib/berlinTime.ts", import.meta.url));
  assertEquals(a, b);
});
