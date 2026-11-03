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

Deno.test("Annahmesperre: Event nur mit vollständiger Vergütung und 25 %", () => {
  const job = { tarif_type: "event", tarif_netto: 489, zeitraum: "06.11.2026 - 08.11.2026",
    kosten_uebersicht: { netto: 1467, positionen: [{ label: "x", betrag: 1467 }] } };
  const a = { rate_type: "daily", rate_value: 489, start_date: "2026-11-06", end_date: "2026-11-08", commission_pct: 25 };
  assertEquals(offer.bindingAcceptanceAllowed(job, a), true);
  assertEquals(offer.bindingAcceptanceAllowed(job, { ...a, commission_pct: 20 }), false);
  assertEquals(offer.bindingAcceptanceAllowed(job, { ...a, end_date: "2026-11-09" }), false); // Zeitraum passt nicht
  assertEquals(offer.bindingAcceptanceAllowed({ ...job, kosten_uebersicht: null }, a), false);
  assertEquals(offer.bindingAcceptanceAllowed(job, null), false);
});
Deno.test("Andere Tarife: Annahmeregel und Provision unverändert", () => {
  for (const t of ["lkw_ce", "lkw_ce_woche", "fernfahrer", "baumaschine", "ueberfuehrung", undefined]) {
    assertEquals(offer.bindingAcceptanceAllowed({ tarif_type: t, kosten_uebersicht: null }, { commission_pct: 20 }), true);
  }
});

Deno.test("Event-Angebot: Bezeichnung Agenturprovision; andere Tarife wörtlich unverändert", () => {
  const job = { tarif_type: "event", tarif_netto: 489, zeitraum: "06.11.2026 - 08.11.2026",
    kosten_uebersicht: { netto: 1467, positionen: [{ label: "x", betrag: 1467 }] } };
  const a = { rate_type: "daily", rate_value: 489, start_date: "2026-11-06", end_date: "2026-11-08", commission_pct: 25 };
  const m = new Map(offer.buildCompleteOfferLines(job, a));
  assertEquals(m.get("Nettoauftragswert"), "1.467,00 €");
  assertEquals(m.get("Agenturprovision Fahrerexpress (25 %)"), "366,75 € netto");
  assertEquals(m.get("Nettovergütung des selbstständigen Fahrers"), "1.100,25 €");
  assert(![...m.keys()].some((k) => k.startsWith("Vermittlungsanteil")));
  const r = new Map(offer.buildCompleteOfferLines({ ...job, tarif_type: "baumaschine" }, { ...a, commission_pct: 20 }));
  assert(r.has("Vermittlungsanteil 20 %"));
  assert(!r.has("Agenturprovision Fahrerexpress (20 %)"));
});
