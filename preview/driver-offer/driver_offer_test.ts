// Nur künstliche Daten; kein Versand, keine Datenbank.
import { assertEquals, assert } from 'jsr:@std/assert@1';
import { buildDriverOfferView, renderDriverOfferEmail, driverOfferPagePayload } from './driver-offer.ts';
import { escapeOffer } from '../../supabase/functions/_shared/binding-offer.ts';

const job = { tarif_type: 'lkw_ce', tarif_netto: 349, tarif_label: 'LKW CE', fahrzeugtyp: 'Sattelzug', einsatzort: 'Testort', zeitraum: '02.11.2026 - 04.11.2026',
  tarif_needs_review: false, kosten_uebersicht: { netto: 1047, positionen: [{ label: '3 Tage', betrag: 1047 }] } };
const a = { rate_type: 'daily', rate_value: 349, start_date: '2026-11-02T00:00:00Z', end_date: '2026-11-04T00:00:00Z', commission_pct: 20 };
const val = (v: ReturnType<typeof buildDriverOfferView>, k: string) => v.lines.find(([l]) => l.startsWith(k))?.[1];

Deno.test('vollständige Konditionen: verbindlich, Honorar/Provision/Netto', () => {
  const v = buildDriverOfferView(job, a);
  assertEquals(v.mode, 'binding');
  assertEquals(val(v, 'Fahrzeugart'), 'Sattelzug');
  assert(val(v, 'Vergütete Einsatztage')!.startsWith('3'));
  assert(val(v, 'Fahrerhonorar netto')!.includes('1.047,00'));
  assert(val(v, 'Vermittlungsprovision')!.includes('20 % = 209,40'));
  assert(val(v, 'Verbleibende Nettovergütung')!.includes('837,60'));
});
Deno.test('fehlende Provision: keine Annahme von 20 %, keine Zahlen', () => {
  const v = buildDriverOfferView(job, { ...a, commission_pct: null });
  assertEquals(v.mode, 'interest');
  assert(!v.lines.some(([, x]) => /209,40|837,60|1\.047,00 €$/.test(x) && !x.includes('Kalk')));
  assert(val(v, 'Antwortart')!.includes('Interessenbekundung'));
});
Deno.test('abweichender Satz: Kundenkalkulation wird nicht als Honorar übernommen', () => {
  const v = buildDriverOfferView(job, { ...a, rate_value: 300 });
  assertEquals(v.mode, 'interest');
  assertEquals(val(v, 'Fahrerhonorar netto'), 'Nicht bestimmt – keine Zahl angegeben');
});
Deno.test('Event nur mit festgelegten 25 %', () => {
  const ev = { ...job, tarif_type: 'event', tarif_netto: 489, kosten_uebersicht: { netto: 1467, positionen: [{ label: '3', betrag: 1467 }] } };
  assertEquals(buildDriverOfferView(ev, { ...a, rate_value: 489, commission_pct: 20 }).mode, 'interest');
  const ok = buildDriverOfferView(ev, { ...a, rate_value: 489, commission_pct: 25 });
  assertEquals(ok.mode, 'binding');
  assert(val(ok, 'Vermittlungsprovision')!.includes('25 % = 366,75'));
});
Deno.test('E-Mail und Bestätigungsseite zeigen identische Zeilen', () => {
  const v = buildDriverOfferView(job, a);
  const page = driverOfferPagePayload(v);
  const html = renderDriverOfferEmail(v);
  for (const [l, x] of page.job_lines) assert(html.includes(escapeOffer(l)) && html.includes(escapeOffer(x)));
  assertEquals(page.can_accept_binding, true);
});
