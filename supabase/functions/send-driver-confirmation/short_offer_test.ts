import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { createOfferSnapshot } from '../_shared/binding-offer.ts';
import { agreementNote } from '../_shared/offer-readiness.ts';
import { shortOfferLines, renderShortOffer, renderDriverCompensationBox, NET_LABEL } from './short-offer.ts';

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
Deno.test('Fernverkehr 8 vereinbarte Tage inkl. Wochenende: verbindlich, einziger Preis 2.880,00 €', () => {
  const s = createOfferSnapshot(job, a());
  assertEquals(s.binding_allowed, true);
  const out = renderShortOffer(shortOfferLines(s.job_lines!, true, 'x'));
  assert(out.includes(`${NET_LABEL}:</strong> 2.880,00 €`)); assertEquals((out.match(/€/g) ?? []).length, 1);
});
Deno.test('Fernverkehr ohne Fahrersatz: Endbetrag ungeklärt → kein Betrag, nicht verbindlich', () => {
  const s = createOfferSnapshot(job, a({ rate_value: null }));
  assertEquals(s.binding_allowed, false);
  assert(!renderShortOffer(shortOfferLines(s.job_lines!, false, 'x')).includes('€'));
});
Deno.test('Fehlende Einsatzanschrift wird nicht erfunden', () => {
  const s = createOfferSnapshot({ ...job, einsatzort: null }, a());
  const l = shortOfferLines(s.job_lines!, true, 'x').find(([k]) => k.startsWith('Einsatzort'));
  assertEquals(l?.[1], 'Nicht erfasst – vor Einsatz abstimmen');
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

Deno.test('Vergütungsbox CE-Woche: gespeicherter Fahrersatz 1.400 €, niemals Kundenpreis 1.645 € oder Beispiel 1.316 €', () => {
  const weeklyJob = {
    ...job,
    tarif_type: 'lkw_ce_woche', tarif_netto: 1645, tarif_label: 'LKW CE Wochenpreis',
    fahrzeugtyp: 'TEST LKW CE', fuehrerscheinklasse: 'CE', nachricht: 'TEST Abrollkipper mit oder ohne Anhänger',
    einsatzort: 'TEST Hafenstraße 12, 66333 Völklingen',
    kosten_uebersicht: { netto: 8225, positionen: [{ label: '5 Kundenwochen', betrag: 8225 }] },
  };
  const s = createOfferSnapshot(weeklyJob, a({
    rate_type: 'weekly', rate_value: 1400,
    start_date: '2026-11-16T00:00:00Z', end_date: '2026-12-18T00:00:00Z',
  }));
  const box = renderDriverCompensationBox(s.job_lines!, true);
  assertEquals(s.binding_allowed, true);
  for (const expected of ['Ihre Vergütung für diesen Auftrag', '5.600,00 €', '1.120,00 €', '5 Wochen à 5 Einsatztage (Montag bis Freitag)', 'netto je Woche (5 Einsatztage, Mo–Fr)', '16.11.2026 – 18.12.2026', 'CE', 'TEST Abrollkipper mit oder ohne Anhänger', 'TEST Hafenstraße 12, 66333 Völklingen']) assert(box.includes(expected), expected);
  assert(!/1\.645|8\.225|1\.316|1\.400,00|7\.000|20 %|25 %|Kundenpreis|Vermittlungsprovision/.test(box), box);
});

Deno.test('Vergütungsbox fehlt vollständig, wenn kein gespeicherter Endbetrag vorliegt', () => {
  const s = createOfferSnapshot(job, a({ rate_value: null }));
  assertEquals(renderDriverCompensationBox(s.job_lines!, s.binding_allowed === true), '');
});

const CE_PLACE = 'TEST August-Clüsserath-Weg 1, 66333 Völklingen';
const ceJob = {
  ...job,
  tarif_type: 'lkw_ce_woche', tarif_netto: 1645, tarif_label: 'LKW CE Wochenpreis',
  einsatzort: CE_PLACE, besonderheiten: '', weekend_days: [], holiday_days: [],
};
const ceAssignment = (units: number, endDate: string) => a({
  rate_value: 329,
  start_date: '2026-11-24T00:00:00Z', end_date: endDate,
  admin_note: agreementNote('TEST', {
    rate: 329, unit: 'daily', units, place: CE_PLACE,
    remunerationConfirmed: true, placeConfirmed: true,
  }),
});
const PROGNOSE_HINWEIS = 'Hinweis zur Vergütung:</strong> Der ausgewiesene Gesamtbetrag ist eine Prognose für die vollständige Durchführung des vorgesehenen Einsatzes. Die endgültige Vergütung richtet sich nach den tatsächlich erbrachten sowie den nach den vertraglichen und gesetzlichen Regelungen vergütungspflichtigen Leistungen. Bei einer Änderung oder vorzeitigen Beendigung des Einsatzes erfolgt die Abrechnung nach den geltenden Vereinbarungen.';

Deno.test('Verbindliche Zuweisungsmail: 22 geplante Tage, Prognosehinweis und exakt 5.790,40 € / 263,20 €', () => {
  const s = createOfferSnapshot(ceJob, ceAssignment(22, '2026-12-23T00:00:00Z'));
  assertEquals(s.binding_allowed, true);
  const box = renderDriverCompensationBox(s.job_lines!, true, true);
  assert(box.includes('voraussichtliches Nettohonorar für den geplanten Gesamteinsatz'));
  assert(box.includes('Berechnungsgrundlage:</strong> 22 geplante Einsatztage'));
  assertEquals((box.match(/5\.790,40 €/g) ?? []).length, 1);
  assertEquals((box.match(/263,20 €/g) ?? []).length, 1);
  assert(box.includes(PROGNOSE_HINWEIS));
  assert(/<\/table><p[^>]*><strong>Hinweis zur Vergütung:<\/strong>/.test(box), 'Hinweis steht direkt unter dem Vergütungsblock');
  assert(!box.includes('netto für den Gesamteinsatz'));
  assert(!box.includes('Abrechnung:</strong> 22 vergütete Einsatztage'));
});

Deno.test('Verbindliche Zuweisungsmail: dynamisch 5 geplante Tage und exakt 1.316,00 € / 263,20 €', () => {
  const s = createOfferSnapshot(ceJob, ceAssignment(5, '2026-11-30T00:00:00Z'));
  assertEquals(s.binding_allowed, true);
  const box = renderDriverCompensationBox(s.job_lines!, true, true);
  assert(box.includes('Berechnungsgrundlage:</strong> 5 geplante Einsatztage'));
  assert(!box.includes('22 geplante Einsatztage'));
  assertEquals((box.match(/1\.316,00 €/g) ?? []).length, 1);
  assertEquals((box.match(/263,20 €/g) ?? []).length, 1);
  assert(box.includes(PROGNOSE_HINWEIS));
});
