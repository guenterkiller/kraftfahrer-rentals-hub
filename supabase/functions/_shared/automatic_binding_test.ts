// Unveränderliche Angebotskopie der automatischen Zuweisung; nur TEST-Daten, kein Versand.
import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { buildAutomaticAssignment } from './automatic-assignment.ts';
import { agreementNote } from './offer-readiness.ts';
import { createOfferSnapshot } from './binding-offer.ts';
import { shortOfferLines, renderDriverCompensationBox } from './short-offer.ts';

const job = {
  company: 'TEST Firma', customer_name: 'TEST Kontakt', customer_phone: 'TEST',
  tarif_type: 'lkw_ce_woche', tarif_netto: 1645, tarif_needs_review: false,
  zeitraum: '16.11.2026 – 20.11.2026', einsatzort: 'TEST Hafenstraße 12, Tor 3, 12345 Musterstadt', besonderheiten: '',
  kosten_uebersicht: { netto: 1645, positionen: [{ label: 'LKW-Fahrer CE – Wochenpreis: 1 Woche (Mo–Fr) × 1.645,00 €', betrag: 1645 }] },
};

Deno.test('Automatische CE-Woche: Angebotskopie und Kurzmail zeigen 1.316 € ohne Kundenpreis oder doppelte Provision', () => {
  const auto = buildAutomaticAssignment(job, '2026-11-16', '2026-11-20');
  assert(auto.agreement);
  const assignment = { rate_type: auto.rateType, rate_value: auto.rateValue, start_date: '2026-11-16T00:00:00Z', end_date: '2026-11-20T00:00:00Z', admin_note: agreementNote('', auto.agreement) };
  const frozen = JSON.stringify({ job, assignment });
  const snapshot = createOfferSnapshot(job, assignment);
  assertEquals(snapshot.binding_allowed, true);
  assert(snapshot.job_lines?.some(([label]) => label === 'Einsatzort / Treffpunkt (aus den Auftragsdaten übernommen)'));
  const short = shortOfferLines(snapshot.job_lines!, true, '16.11.2026 – 20.11.2026');
  assert(short.some(([label, value]) => label === 'Ihre Nettovergütung für diesen Auftrag' && value === '1.316,00 €'));
  assert(short.some(([label]) => label === 'Einsatzort / Treffpunkt (aus den Auftragsdaten übernommen)'));
  const box = renderDriverCompensationBox(snapshot.job_lines!, true);
  assert(box.includes('1.316,00 €'));
  assert(!box.includes('1.645,00 €'));
  assert(!box.includes('1.052,80 €'));
  assert(!box.includes('Provision'));
  assertEquals(JSON.stringify({ job, assignment }), frozen);
});
