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
