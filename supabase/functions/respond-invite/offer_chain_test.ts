// Gesamtkette mit künstlichen TEST-Daten: Zuteilung → Angebotskopie → E-Mail-Zeilen → Bestätigungsseite → Annahmeprüfung.
// Kein Versand, keine Datenbank, keine echten Buchungen.
import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { handleBinding } from './binding.ts';
import { createOfferSnapshot, renderOfferLines, escapeOffer } from '../_shared/binding-offer.ts';
import { buildDriverOfferView, driverSurchargeText } from '../_shared/driver-offer-remuneration.ts';

const val = (lines: [string, string][], k: string) => lines.find(([l]) => l.startsWith(k))?.[1];
const base = { id: 'TEST-A', job_id: 'TEST-J', driver_id: 'TEST-D', status: 'assigned', times_entered: null, updated_at: '2099-01-01T00:00:00Z' };

async function run(job: any, assignment: any, intent: string | null, action: string | null) {
  const snapshot = createOfferSnapshot(job, assignment);
  const invite = { purpose: 'binding', assignment_id: assignment.id, driver_id: assignment.driver_id, status: 'pending', created_at: '2099-01-01T00:00:00Z', token_expires_at: '2099-12-31T00:00:00Z', offer_snapshot: snapshot, job };
  let updates = 0;
  const q: any = { select() { return q; }, eq() { return q; }, update() { updates++; return q; }, maybeSingle() { return Promise.resolve({ data: assignment }); } };
  const r = await handleBinding({ supabase: { from() { return q; } }, invite, intent, action, consentConfirmed: true, checkboxText: 'x', ip: '', userAgent: '', json: (d: any) => new Response(JSON.stringify(d)) });
  return { snapshot, data: await r.json(), updates };
}

Deno.test('Fernfahrer: Mail, Seite und Annahme ohne Sa-/So-/Feiertagszuschlag', async () => {
  const job = { tarif_type: 'fernfahrer', fahrzeugtyp: 'TEST Sattelzug', einsatzort: 'TEST' };
  const a = { ...base, rate_type: 'daily', rate_value: 360, start_date: '2099-11-16T00:00:00Z', end_date: '2099-11-18T00:00:00Z', commission_pct: 20 };
  const { snapshot, data } = await run(job, a, 'load', null);
  const html = renderOfferLines(snapshot.job_lines!);
  assert(!html.includes('Samstag 25') && !JSON.stringify(data.job_lines).includes('Samstag 25'));
  assertEquals(val(snapshot.job_lines!, 'Zuschläge'), driverSurchargeText('fernfahrer'));
  assert(!val(snapshot.job_lines!, 'Mögliche Zusatzkosten')!.includes('Zuschläge sind provisionspflichtig'));
  assertEquals([data.status, data.commission_pct], ['ready', 20]);
  assertEquals(data.job_lines, snapshot.job_lines);
  assertEquals(val(data.job_lines, 'Vermittlungsprovision'), '20 % = 216,00 € netto');
  for (const [l, v] of snapshot.job_lines!) assert(html.includes(escapeOffer(l)) && html.includes(escapeOffer(v)));
});

Deno.test('Andere Tarife behalten die bestehende Zuschlagsregel', () => {
  for (const t of ['lkw_ce', 'lkw_ce_woche', 'baumaschine', 'ueberfuehrung']) assertEquals(driverSurchargeText(t), 'Samstag 25 %, Sonn- und Feiertag 50 %');
  assert(driverSurchargeText('event').startsWith('Keine'));
});

Deno.test('CE-Woche über 2 volle Wochen Mo–Fr: verbindlich, Wochenenden nicht vergütet angesetzt', async () => {
  const job = { tarif_type: 'lkw_ce_woche', fahrzeugtyp: 'TEST', einsatzort: 'TEST' };
  // 16.11.2099 ist Montag, 27.11.2099 Freitag; keine bundesweiten Feiertage dazwischen.
  const a = { ...base, rate_type: 'weekly', rate_value: 1400, start_date: '2099-11-16T00:00:00Z', end_date: '2099-11-27T00:00:00Z', commission_pct: 20 };
  const { data, snapshot } = await run(job, a, 'load', null);
  assertEquals([data.status, snapshot.binding_allowed], ['ready', true]);
  assert(val(snapshot.job_lines!, 'Fahrerhonorar netto')!.endsWith('1.400,00 € je Woche × 2 = 2.800,00 €'));
  assertEquals(val(snapshot.job_lines!, 'Vermittlungsprovision'), '20 % = 560,00 € netto');
  assertEquals(val(snapshot.job_lines!, 'Verbleibende Nettovergütung'), '2.240,00 €');
  assert(val(snapshot.job_lines!, 'Stand-/Ruhetage')!.includes('kein Fahrer-Tagessatz vereinbart'));
});

Deno.test('CE-Woche mit Rest-/Wochenendtagen oder Feiertag Mo–Fr: keine verbindliche Annahme, keine Zahlen', async () => {
  const job = { tarif_type: 'lkw_ce_woche', einsatzort: 'TEST' };
  const cases = [
    ['2099-11-16', '2099-11-23'], // Mo–Mo (Resttag)
    ['2099-11-16', '2099-11-21'], // Mo–Sa
    ['2099-11-18', '2099-11-24'], // Mi–Di
    ['2099-12-21', '2099-12-25'], // Woche mit 1. Weihnachtstag (Fr)
  ];
  for (const [s, e] of cases) {
    const a = { ...base, rate_type: 'weekly', rate_value: 1400, start_date: `${s}T00:00:00Z`, end_date: `${e}T00:00:00Z`, commission_pct: 20 };
    const v = buildDriverOfferView(job, a);
    assertEquals(v.mode, 'interest', `${s}–${e}`);
    const { data, updates } = await run(job, a, null, 'accept');
    assertEquals([data.status, updates], ['remuneration_incomplete', 0]);
    assertEquals(val(data.job_lines, 'Fahrerhonorar netto'), 'Nicht bestimmt – keine Zahl angegeben');
  }
});

Deno.test('Provision 25 % nur vom Fahrerhonorar bei Spezialfahrzeug/Event/Überführung', async () => {
  for (const t of ['baumaschine', 'event', 'ueberfuehrung']) {
    const job = { tarif_type: t, einsatzort: 'TEST', kosten_uebersicht: { netto: 9999 } };
    const a = { ...base, rate_type: 'daily', rate_value: 400, start_date: '2099-11-16T00:00:00Z', end_date: '2099-11-17T00:00:00Z', commission_pct: 20 };
    const { data } = await run(job, a, 'load', null);
    assertEquals([data.status, data.commission_pct], ['ready', 25]);
    assertEquals(val(data.job_lines, 'Vermittlungsprovision'), '25 % = 200,00 € netto');
    assert(!JSON.stringify(data.job_lines).includes('9.999'));
  }
});
