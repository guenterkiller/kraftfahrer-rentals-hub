import { assert, assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildInterestOfferPreview, interestSurchargeText } from "./interest-offer-preview.ts";
import { interestRemuneration } from "./driver-job-offers.ts";

const voelklingen = {
  id: "TEST-VOELKLINGEN",
  customer_name: "TEST Kundenkontakt",
  company: "Timberpak GmbH",
  einsatzort: "Völklingen",
  zeitraum: "17.11.2026 bis 23.12.2026",
  fahrzeugtyp: "LKW CE",
  fuehrerscheinklasse: "CE",
  besonderheiten: null,
  nachricht: "TEST Fahrertätigkeit",
  tarif_type: "lkw_ce_woche",
  tarif_netto: 1645,
  tarif_unit: "je Woche (5 Einsatztage, bis 9 Stunden je Einsatztag)",
  tarif_needs_review: false,
  weekend_days: [],
  holiday_days: null,
  kosten_uebersicht: {
    netto: 8883,
    ust: 1687.77,
    brutto: 10570.77,
    positionen: [
      { label: "LKW-Fahrer CE – Wochenpreis: 5 Wochen (Mo–Fr) × 1.645,00 €", betrag: 8225 },
      { label: "2 Einsatztage (Mo–Fr) × 329,00 €", betrag: 658 },
    ],
  },
};

Deno.test("Interessen-Seite: Völklingen zeigt exakt die Mailvergütung von 7.106,40 € netto", () => {
  const mailPay = interestRemuneration(voelklingen);
  assert(mailPay.ok);
  const preview = buildInterestOfferPreview(voelklingen);
  assert(preview.job_lines);
  assertEquals(preview.job_lines[0], mailPay.lines[0]);
  assertEquals(preview.job_lines[0][1], "7.106,40 €");
  assertEquals(preview.job?.surcharge_text, null);
});

Deno.test("Interessen-Seite: Serverantwort enthält weder Kundenidentität noch Kundenpreis oder Provision", () => {
  const preview = buildInterestOfferPreview(voelklingen);
  const serialized = JSON.stringify(preview);
  assert(!("customer_name" in (preview.job ?? {})));
  assert(!("company" in (preview.job ?? {})));
  assert(!serialized.includes("Timberpak"));
  assert(!serialized.includes("TEST Kundenkontakt"));
  assert(!serialized.includes("8.883,00"));
  assert(!serialized.includes("1.645,00"));
  assert(!serialized.includes("10.570,77"));
  assert(!serialized.includes("20 %"));
  assert(!serialized.includes("Vermittlungsprovision"));
  assert(!serialized.includes("Fahrerhonorar netto vor Provision"));
  assertStringIncludes(serialized, "7.106,40 €");
});

Deno.test("Interessen-Seite: ohne gebuchte Wochenend- oder Feiertagstage erscheint kein Zuschlagstext", () => {
  assertEquals(interestSurchargeText(voelklingen), null);
  assertEquals(interestSurchargeText({ ...voelklingen, weekend_days: null, holiday_days: [] }), null);
});

Deno.test("Interessen-Seite: ausdrücklich gebuchte Wochenendarbeit zeigt die bestehenden Satzregeln", () => {
  assertEquals(interestSurchargeText({ ...voelklingen, besonderheiten: "CE, Wochenendarbeit" }), "Samstag 25 %, Sonntag 50 %");
  assertEquals(interestSurchargeText({ ...voelklingen, weekend_days: ["2026-11-21"] }), "Samstag 25 %, Sonntag 50 %");
});

Deno.test("Interessen-Seite: gebuchte Feiertage und Pauschaltarife bleiben sachlich getrennt", () => {
  assertEquals(interestSurchargeText({ ...voelklingen, holiday_days: ["2026-12-25"] }), "Gesetzliche Feiertage 50 %");
  assertEquals(
    interestSurchargeText({ ...voelklingen, weekend_days: ["2026-11-21"], holiday_days: ["2026-12-25"] }),
    "Samstag 25 %, Sonn- und Feiertag 50 %",
  );
  assertStringIncludes(interestSurchargeText({ ...voelklingen, tarif_type: "fernfahrer" }) ?? "", "ohne Samstags-, Sonntags- oder Feiertagszuschläge");
  assertStringIncludes(interestSurchargeText({ ...voelklingen, tarif_type: "event" }) ?? "", "ohne Mehrstunden und ohne Wochenend-/Feiertagszuschläge");
});

Deno.test("Interessen-Seite: unvollständige Kalkulation erzeugt keinen erfundenen Betrag", () => {
  const preview = buildInterestOfferPreview({ ...voelklingen, kosten_uebersicht: null });
  assertEquals(preview.job_lines, null);
  assert(!JSON.stringify(preview).includes("7.106,40"));
});
