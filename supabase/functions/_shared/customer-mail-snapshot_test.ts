import { assertEquals, assertMatch } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { buildCustomerMailSnapshotRow } from "./customer-mail-snapshot.ts";
import { berechneKostenUebersicht, gebuchteZuschlagstage, wochenendarbeitGebucht } from "./kosten-uebersicht.ts";
import { listSurchargeDays } from "./german-holidays.ts";

Deno.test("Versandkopie speichert exakt den übergebenen Inhalt mit Status und Kennung", async () => {
  const row = await buildCustomerMailSnapshotRow({
    jobId: "11111111-1111-1111-1111-111111111111", template: "customer_booking_confirmation",
    payload: { from: "A <a@x.de>", to: "k@x.de", subject: "Betreff", html: "<p>Netto 8.883,00 €</p>" },
    result: { ok: true, messageId: "msg-1" }, sentAt: new Date("2026-11-16T08:00:00Z"),
  });
  assertEquals(row.html, "<p>Netto 8.883,00 €</p>");
  assertEquals(row.status, "sent");
  assertEquals(row.provider_message_id, "msg-1");
  assertEquals(row.sent_at, "2026-11-16T08:00:00.000Z");
  assertMatch(row.content_sha256, /^[0-9a-f]{64}$/);
});

Deno.test("Fehlgeschlagener Versand wird als failed ohne Versandzeit gespeichert", async () => {
  const row = await buildCustomerMailSnapshotRow({
    template: "no_show_notice", payload: { from: "a", to: "b", subject: "s", html: "h" },
    result: { ok: false, error: "rejected" },
  });
  assertEquals([row.status, row.sent_at, row.error_message, row.provider_message_id], ["failed", null, "rejected", null]);
});

Deno.test("Server: Völklingen-Zeitraum ohne Wochenendarbeit 8.883 €, mit 13.681,75 €", () => {
  assertEquals(berechneKostenUebersicht("lkw_ce_woche", "2026-11-17", "2026-12-23")?.netto, 8883);
  assertEquals(berechneKostenUebersicht("lkw_ce_woche", "2026-11-17", "2026-12-23", { wochenendarbeit: wochenendarbeitGebucht(["Wochenendarbeit"]) })?.netto, 13681.75);
  assertEquals(gebuchteZuschlagstage(listSurchargeDays("2026-11-17", "2026-12-23"), wochenendarbeitGebucht([])).length, 0);
});
