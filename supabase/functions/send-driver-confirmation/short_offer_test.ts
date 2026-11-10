import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { createOfferSnapshot } from '../_shared/binding-offer.ts';
import { shortOfferLines, renderShortOffer, NET_LABEL } from './short-offer.ts';

const job = { company: 'TEST-Firma Muster GmbH', customer_name: 'TEST Kontakt', customer_phone: '0000 TEST', einsatzort: 'TEST-Ort 12345', fahrzeugtyp: 'LKW CE', nachricht: 'TEST Aufgabe', tarif_type: 'fernfahrer', tarif_netto: 450, kosten_uebersicht: { netto: 9999, positionen: [{ label: 'Kundenpreis', betrag: 9999 }] } };
const a = (o: Record<string, unknown> = {}) => ({ rate_type: 'daily', rate_value: 450, commission_pct: 20, start_date: '2026-11-16T00:00:00Z', end_date: '2026-11-23T00:00:00Z', times_entered: null, ...o });
const html = (j: any, as: any) => { const s = createOfferSnapshot(j, as); return renderShortOffer(shortOfferLines(s.job_lines!, s.binding_allowed === true, '16.11.2026 – 23.11.2026')); };
const FORBIDDEN = /Provision\b(?! \))|Vermittlungsanteil|vor Provision|je Einsatztag|450,00|9\.999|Kundenpreis|20 %|25 %/;

Deno.test('Kurzmail Fernverkehr: einziger Preis ist die Nettovergütung 1.800,00 € (450 € × 5 vergütete Tage − 20 %)', () => {
  const out = html(job, a({ end_date: '2026-11-20T00:00:00Z' }));
  assert(out.includes(`${NET_LABEL}:</strong> 1.800,00 €`));
  assertEquals((out.match(/€/g) ?? []).length, 1);
  assert(!FORBIDDEN.test(out.replace(NET_LABEL, '')), out);
  assert(out.includes('nicht bestätigt'));
});
Deno.test('MIAG-Konstellation: CE-Wochentarif + Tagessatz über Wochenende → kein Betrag, nicht verbindlich', () => {
  const s = createOfferSnapshot({ ...job, tarif_type: 'lkw_ce_woche' }, a());
  assertEquals(s.binding_allowed, false);
  const out = renderShortOffer(shortOfferLines(s.job_lines!, false, 'x'));
  assert(!out.includes('€'));
});
Deno.test('Fernverkehr 8 Kalendertage inkl. Wochenende (MIAG Mailand): Kalendertage nicht automatisch vergütet → kein Betrag', () => {
  const s = createOfferSnapshot(job, a());
  assertEquals(s.binding_allowed, false);
  assert(!renderShortOffer(shortOfferLines(s.job_lines!, false, 'x')).includes('€'));
});
Deno.test('450 € Fernverkehrssatz auf CE-Wochentarif Mo–Fr: Tarifkonflikt → nicht verbindlich', () => {
  const s = createOfferSnapshot({ ...job, tarif_type: 'lkw_ce_woche' }, a({ end_date: '2026-11-20T00:00:00Z' }));
  assertEquals(s.binding_allowed, false);
});
Deno.test('CE-Tagestarif 349 € bleibt separat berechenbar (5 Tage → 1.396,00 €)', () => {
  const s = createOfferSnapshot({ ...job, tarif_type: 'lkw_ce' }, a({ rate_value: 349, end_date: '2026-11-20T00:00:00Z' }));
  assertEquals(s.binding_allowed, true);
  assert(renderShortOffer(shortOfferLines(s.job_lines!, true, 'x')).includes('1.396,00 €'));
});
