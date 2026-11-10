// Nur künstliche Daten; kein Versand, keine Datenbank.
import { assertEquals, assert } from 'jsr:@std/assert@1';
import { buildDriverOfferView, commissionPctForTarif } from './driver-offer-remuneration.ts';
import { createOfferSnapshot, renderOfferLines, escapeOffer } from './binding-offer.ts';
import { commissionPctForTarif as frontendPct } from '../../../src/lib/driverOfferCommission.ts';

const job = { tarif_type: 'lkw_ce', tarif_netto: 349, tarif_label: 'LKW CE', fahrzeugtyp: 'Sattelzug', einsatzort: 'Testort', zeitraum: '02.11.2026 - 04.11.2026',
  tarif_needs_review: false, kosten_uebersicht: { netto: 1047, positionen: [{ label: '3 Tage', betrag: 1047 }] } };
const a = { rate_type: 'daily', rate_value: 300, start_date: '2026-11-02T00:00:00Z', end_date: '2026-11-04T00:00:00Z', commission_pct: 20 };
const val = (lines: [string, string][], k: string) => lines.find(([l]) => l.startsWith(k))?.[1];

Deno.test('Provision nach Tarifart; Frontend identisch', () => {
  const all = ['lkw_ce', 'lkw_ce_woche', 'fernfahrer', 'baumaschine', 'event', 'Überführung', 'ueberfuehrung', 'pruefung', '', undefined];
  for (const t of ['lkw_ce', 'lkw_ce_woche', 'fernfahrer']) assertEquals(commissionPctForTarif(t), 20);
  for (const t of ['baumaschine', 'event', 'Überführung', 'ueberfuehrung']) assertEquals(commissionPctForTarif(t), 25);
  assertEquals(commissionPctForTarif('pruefung'), null);
  for (const t of all) assertEquals(frontendPct(t), commissionPctForTarif(t));
});
Deno.test('CE Tag: Honorar = Fahrersatz × Tage, nie Kundenpreis', () => {
  const s = createOfferSnapshot(job, a);
  assertEquals([s.version, s.binding_allowed, s.commission_pct], [3, true, 20]);
  assert(val(s.job_lines!, 'Fahrerhonorar netto')!.endsWith('300,00 € je Einsatztag × 3 = 900,00 €'));
  assert(!s.job_lines!.some(([l, v]) => l.startsWith('Fahrleistung:') || v.includes('1.047')));
  assertEquals(val(s.job_lines!, 'Vermittlungsprovision'), '20 % = 180,00 € netto');
  assertEquals(val(s.job_lines!, 'Verbleibende Nettovergütung'), '720,00 €');
  assertEquals(val(s.job_lines!, 'Fahrzeugart'), 'Sattelzug');
  assert(val(s.job_lines!, 'Unterkunftsregelung'));
});
Deno.test('Spezialfahrzeug/Überführung automatisch 25 %, auch wenn 20 % gespeichert', () => {
  const v = buildDriverOfferView({ ...job, tarif_type: 'baumaschine' }, { ...a, rate_value: 400 });
  assertEquals(v.mode, 'binding');
  assertEquals(val(v.lines, 'Vermittlungsprovision'), '25 % = 300,00 € netto');
  assertEquals(val(v.lines, 'Verbleibende Nettovergütung'), '900,00 €');
  assertEquals(createOfferSnapshot({ ...job, tarif_type: 'Überführung' }, a).commission_pct, 25);
});
Deno.test('Fernfahrer-Wochensatz: je 5 abrechenbare Tage, nicht 7', () => {
  const fj = { ...job, tarif_type: 'fernfahrer' };
  const ten = buildDriverOfferView(fj, { ...a, rate_type: 'weekly', rate_value: 2000, end_date: '2026-11-11T00:00:00Z' });
  assertEquals(ten.mode, 'binding');
  assert(val(ten.lines, 'Fahrerhonorar netto')!.endsWith('× 2 = 4.000,00 €'));
  assertEquals(buildDriverOfferView(fj, { ...a, rate_type: 'weekly', rate_value: 2000, end_date: '2026-11-08T00:00:00Z' }).mode, 'interest');
  // Fernverkehr-Tagessatz: Wochenende sperrt nicht pauschal; vereinbarter Zeitraum = vergütete Tage, ausdrücklich ausgewiesen.
  const we = buildDriverOfferView(fj, { ...a, rate_value: 450, end_date: '2026-11-09T00:00:00Z' });
  assertEquals(we.mode, 'binding'); assertEquals(val(we.lines, 'Verbleibende Nettovergütung'), '2.880,00 €');
  assert(val(we.lines, 'Vergütete Einheiten')!.includes('Samstage/Sonntage sind als vergütete'));
  const day = buildDriverOfferView(fj, { ...a, rate_value: 450, end_date: '2026-11-06T00:00:00Z' });
  assert(val(day.lines, 'Fahrerhonorar netto')!.endsWith('× 5 = 2.250,00 €'));
  assertEquals(val(day.lines, 'Verbleibende Nettovergütung'), '1.800,00 €');
});
Deno.test('CE-Wochensatz nur Montag–Freitag eindeutig', () => {
  const cj = { ...job, tarif_type: 'lkw_ce_woche' };
  const w = buildDriverOfferView(cj, { ...a, rate_type: 'weekly', rate_value: 1500, end_date: '2026-11-06T00:00:00Z' });
  assertEquals(w.mode, 'binding');
  assert(val(w.lines, 'Fahrerhonorar netto')!.endsWith('× 1 = 1.500,00 €'));
  assertEquals(buildDriverOfferView(cj, { ...a, rate_type: 'weekly', rate_value: 1500, end_date: '2026-11-08T00:00:00Z' }).mode, 'interest');
});
Deno.test('Unvollständig → nur Interessenbekundung, keine Zahlen', () => {
  for (const [j, x] of [[job, { ...a, rate_value: null }], [{ ...job, tarif_type: 'pruefung' }, a], [job, { ...a, rate_type: 'hourly' }],
    [job, { ...a, end_date: null }], [{ ...job, tarif_needs_review: true }, a]] as const) {
    const s = createOfferSnapshot(j, x);
    assertEquals(s.binding_allowed, false);
    assertEquals(val(s.job_lines!, 'Fahrerhonorar netto'), 'Nicht bestimmt – keine Zahl angegeben');
    assert(val(s.job_lines!, 'Antwortart')!.includes('Interessenbekundung'));
  }
  assertEquals(val(buildDriverOfferView(job, a).lines, 'Stand-/Ruhetage'), 'Nicht gesondert vereinbart – keine zusätzlichen Tage angesetzt');
});
Deno.test('E-Mail enthält exakt die Zeilen der Bestätigungsseite', () => {
  const s = createOfferSnapshot(job, a);
  const html = renderOfferLines(s.job_lines!);
  for (const [l, v] of s.job_lines!) assert(html.includes(escapeOffer(l)) && html.includes(escapeOffer(v)));
});
