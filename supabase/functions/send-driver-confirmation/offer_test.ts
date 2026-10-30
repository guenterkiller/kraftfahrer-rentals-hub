import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { createOfferSnapshot, remuneration } from '../_shared/binding-offer.ts';
export const job = { company: 'TEST GmbH', customer_name: 'TEST Kontakt', zeitraum: 'vom 05.11.2026 bis 06.11.2026 (2 Kalendertage)', fahrzeugtyp: 'LKW CE', nachricht: 'Schubbodenauflieger mit Scania-Zugmaschine', tarif_type: 'lkw_ce', tarif_netto: 349, tarif_unit: 'je Einsatztag bis 9 Stunden', tarif_mehrstunde_netto: 45, unterkunft_option: 'keine', kosten_uebersicht: { netto: 698, ust: 132.62, brutto: 830.62, positionen: [{ label: '2 Einsatztage × 349,00 €', betrag: 698 }] } };
export const assignment = { id: 'TEST-ASSIGNMENT', job_id: 'TEST-JOB', driver_id: 'TEST-DRIVER', rate_type: 'daily', rate_value: 349, commission_pct: 20, start_date: '2026-11-05T00:00:00Z', end_date: '2026-11-06T00:00:00Z', times_entered: null };
Deno.test('Vereinbarte 698 € ergeben exakt 139,60 € Provision und 558,40 € Fahrervergütung', () => {
  const result = remuneration(job, assignment);
  assertEquals(result.serviceCents, 69800); assertEquals(result.commissionCents, 13960); assertEquals(result.driverCents, 55840); assertEquals(result.days, 2);
});
Deno.test('Abweichender vereinbarter Satz verwendet keine Kundenpreis-Vermutung', () => {
  assertEquals(remuneration(job, { ...assignment, rate_value: 300 }).serviceCents, null);
});
Deno.test('Abweichender Zeitraum verwendet keine fremde Kostenvorschau', () => {
  assertEquals(remuneration(job, { ...assignment, end_date: '2026-11-07T00:00:00Z' }).serviceCents, null);
});
Deno.test('Fehlender Gesamtwert wird nicht aus einem Tagessatz erfunden', () => {
  assertEquals(remuneration({ ...job, kosten_uebersicht: null }, assignment).driverCents, null);
});
Deno.test('Versandkopie bleibt trotz später geänderter Auftragsdaten unverändert', () => {
  const mutable = structuredClone(job);
  const snapshot = createOfferSnapshot(mutable, assignment);
  mutable.company = 'GEÄNDERT'; mutable.kosten_uebersicht.netto = 1;
  assertEquals(snapshot.job.company, 'TEST GmbH'); assertEquals(snapshot.job.kosten_uebersicht.netto, 698);
  assert(snapshot.job_lines?.some(([k,v]) => k.includes('Fahrervergütung') && v === '558,40 €'));
});
Deno.test('Nicht vereinbarte Fahrtkosten verändern Provisionsbasis und Vergütung nicht', () => {
  const result = remuneration({ ...job, unterkunft_obergrenze: 75 }, assignment);
  assertEquals(result.serviceCents, 69800); assertEquals(result.commissionCents, 13960); assertEquals(result.driverCents, 55840);
});