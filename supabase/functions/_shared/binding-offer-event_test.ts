import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildJobLines } from "../respond-invite/binding.ts";
import * as offer from "./binding-offer.ts";

Deno.test("Event-Fahrerannahme zeigt keine Zuschläge", () => {
  const lines = buildJobLines({ tarif_type: "event" }, {});
  assertEquals(lines.find(([k]) => k === "Zuschläge")?.[1].startsWith("Keine"), true);
  const regular = buildJobLines({ tarif_type: "baumaschine" }, {});
  assertEquals(regular.find(([k]) => k === "Zuschläge")?.[1], "Samstag 25 %, Sonn- und Feiertag 50 %");
});
Deno.test("Modul exportiert Angebotsfunktionen", () => { assert(Object.keys(offer).length > 0); });

Deno.test("Event: 489 € Pauschale je Tag, 25 % Provision, Fahrer erhält Rest", () => {
  const job = { tarif_type: "event", tarif_netto: 489, zeitraum: "06.11.2026 - 08.11.2026",
    kosten_uebersicht: { netto: 1467, positionen: [{ label: "Event-Tourneepauschale: 3 Einsatztage × 489,00 €", betrag: 1467 }] } };
  const assignment = { rate_type: "daily", rate_value: 489, start_date: "2026-11-06", end_date: "2026-11-08", commission_pct: 25 };
  const pay = offer.remuneration(job, assignment);
  assertEquals(pay.serviceCents, 146700);
  assertEquals(pay.commissionCents, 36675);
  assertEquals(pay.driverCents, 110025);
  const lines = offer.buildCompleteOfferLines(job, assignment);
  assertEquals(lines.find(([k]) => k === "Mehrstundenpreis netto")?.[1], "Pauschaltarif ohne Mehrstundenabrechnung");
});
