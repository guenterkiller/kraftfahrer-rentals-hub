// Nur künstliche Daten; kein Versand, keine Datenbank.
import { assertEquals, assert } from 'jsr:@std/assert@1';
import { buildDriverOfferView, commissionPctForTarif, renderDriverOfferEmail, driverOfferPagePayload } from './driver-offer.ts';
import { escapeOffer } from '../../supabase/functions/_shared/binding-offer.ts';

const job = { tarif_type: 'lkw_ce', tarif_netto: 349, tarif_label: 'LKW CE', fahrzeugtyp: 'Sattelzug', einsatzort: 'Testort', zeitraum: '02.11.2026 - 04.11.2026',
  tarif_needs_review: false, kosten_uebersicht: { netto: 1047, positionen: [{ label: '3 Tage', betrag: 1047 }] } };
const a = { rate_type: 'daily', rate_value: 300, start_date: '2026-11-02T00:00:00Z', end_date: '2026-11-04T00:00:00Z', commission_pct: 20 };
const val = (v: ReturnType<typeof buildDriverOfferView>, k: string) => v.lines.find(([l]) => l.startsWith(k))?.[1];

Deno.test('Provisionszuordnung nach Tarifart', () => {
  for (const t of ['lkw_ce', 'lkw_ce_woche', 'fernfahrer']) assertEquals(commissionPctForTarif(t), 20);
  for (const t of ['baumaschine', 'event', 'Überführung', 'ueberfuehrung']) assertEquals(commissionPctForTarif(t), 25);
  assertEquals(commissionPctForTarif('pruefung'), null);
  assertEquals(commissionPctForTarif(undefined), null);
});
Deno.test('CE: Honorar = Fahrersatz × Tage, nicht Kundenpreis', () => {
  const v = buildDriverOfferView(job, a);
  assertEquals(v.mode, 'binding');
  assert(val(v, 'Fahrerhonorar netto')!.endsWith('= 900,00 €'));
  assert(!val(v, 'Fahrerhonorar netto')!.includes('1.047'));
  assert(val(v, 'Vermittlungsprovision')!.includes('20 % = 180,00'));
  assertEquals(val(v, 'Verbleibende Nettovergütung'), '720,00 €');
  assertEquals(val(v, 'Fahrzeugart'), 'Sattelzug');
});
Deno.test('Spezialfahrzeug: automatisch 25 %, nicht pauschal 20 %', () => {
  const v = buildDriverOfferView({ ...job, tarif_type: 'baumaschine' }, { ...a, rate_value: 400, commission_pct: null });
  assertEquals(v.mode, 'binding');
  assert(val(v, 'Vermittlungsprovision')!.includes('25 % = 300,00'));
  assertEquals(val(v, 'Verbleibende Nettovergütung'), '900,00 €');
});
Deno.test('Überführung und Event 25 %; gespeicherte abweichende 20 % → nur Interesse', () => {
  assert(val(buildDriverOfferView({ ...job, tarif_type: 'Überführung' }, { ...a, commission_pct: null }), 'Vermittlungsprovision')!.startsWith('25 %'));
  const ev = buildDriverOfferView({ ...job, tarif_type: 'event' }, { ...a, commission_pct: 20 });
  assertEquals(ev.mode, 'interest');
  assertEquals(val(ev, 'Vermittlungsprovision'), 'Nicht festgelegt – keine Zahl angegeben');
});
Deno.test('Unvollständig: kein Satz, Prüfungstarif, Stunden ohne Stundenzahl → keine Zahlen', () => {
  for (const [j, x] of [[job, { ...a, rate_value: null }], [{ ...job, tarif_type: 'pruefung' }, a], [job, { ...a, rate_type: 'hourly' }],
    [job, { ...a, rate_type: 'weekly' }]] as const) {
    const v = buildDriverOfferView(j, x);
    assertEquals(v.mode, 'interest');
    assertEquals(val(v, 'Fahrerhonorar netto'), 'Nicht bestimmt – keine Zahl angegeben');
    assert(val(v, 'Antwortart')!.includes('Interessenbekundung'));
  }
});
Deno.test('Wochensatz nur bei ganzen Wochen; Stand-/Ruhetage nie erfunden', () => {
  const v = buildDriverOfferView({ ...job, tarif_type: 'lkw_ce_woche' }, { ...a, rate_type: 'weekly', rate_value: 1500, end_date: '2026-11-08T00:00:00Z' });
  assertEquals(v.mode, 'binding');
  assert(val(v, 'Fahrerhonorar netto')!.endsWith('= 1.500,00 €'));
  assertEquals(val(v, 'Stand-/Ruhetage'), 'Nicht gesondert vereinbart – keine zusätzlichen Tage angesetzt');
});
Deno.test('E-Mail und Bestätigungsseite zeigen identische Zeilen', () => {
  for (const x of [a, { ...a, rate_value: null }]) {
    const v = buildDriverOfferView(job, x);
    const page = driverOfferPagePayload(v);
    const html = renderDriverOfferEmail(v);
    for (const [l, y] of page.job_lines) assert(html.includes(escapeOffer(l)) && html.includes(escapeOffer(y)));
    assertEquals(page.can_accept_binding, v.mode === 'binding');
  }
});
