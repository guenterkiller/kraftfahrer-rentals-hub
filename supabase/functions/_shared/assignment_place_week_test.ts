import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { agreementErrors, agreementNote, resolvedPlace } from './offer-readiness.ts';
import { buildDriverOfferView } from './driver-offer-remuneration.ts';
import { createOfferSnapshot } from './binding-offer.ts';

const job = { tarif_type: 'lkw_ce_woche', tarif_needs_review: false, einsatzort: 'Völklingen, 66333', company: 'Timberpak GmbH', customer_name: 'Thomas Brandenburg',
  customer_street: 'August-Clüsserath-Weg', customer_house_number: '1', customer_postal_code: '66333', customer_city: 'Völklingen', besonderheiten: '', weekend_days: [], holiday_days: [] };
const FULL = 'Timberpak GmbH, Thomas Brandenburg, August-Clüsserath-Weg 1, 66333 Völklingen';
const asg = (note: string, units: number, extra: Record<string, unknown> = {}, j: any = job) => {
  const place = resolvedPlace(j, { admin_note: note })?.place ?? '';
  return { rate_type: 'daily', rate_value: 329, start_date: '2026-11-24T00:00:00.000Z', end_date: '2026-12-23T00:00:00.000Z',
    admin_note: agreementNote(note, { rate: 329, unit: 'daily', units, place, remunerationConfirmed: true, placeConfirmed: !!place }), ...extra };
};
const issues = (j: any, a: any) => [...agreementErrors(j, a), ...buildDriverOfferView(j, a).missing];

Deno.test('Vollständige Auftraggeberanschrift ist Standard-Treffpunkt', () => {
  const a = asg('', 22);
  assertEquals(resolvedPlace(job, a)?.place, FULL);
  assertEquals(issues(job, a), []);
  const snap = createOfferSnapshot(job, a);
  assert(snap.job_lines!.some(([l, v]: [string, string]) => l === 'Einsatzort / Treffpunkt (vom Auftraggeber bestätigt)' && v === FULL));
});

Deno.test('Abweichender Treffpunkt aus Notiz geht in verbindlichen Text', () => {
  const note = 'Treffpunkt Tor 3, Industriestraße 12, 66333 Völklingen';
  const a = asg(note, 22);
  assertEquals(issues(job, a), []);
  const snap = createOfferSnapshot(job, a);
  assert(snap.job_lines!.some(([l, v]: [string, string]) => l.startsWith('Einsatzort / Treffpunkt') && v === note));
  assert(!snap.job_lines!.some(([, v]: [string, string]) => v === FULL));
});

Deno.test('Ohne vollständige Anschrift und ohne Treffpunkt bleibt Sperre', () => {
  const j = { ...job, customer_house_number: '' };
  const a = asg('Bitte pünktlich sein', 22, {}, j);
  assert(agreementErrors(j, a).some((e) => e.startsWith('Konkrete Einsatzanschrift')));
});

Deno.test('Manipulierter Ort in Vereinbarung wird abgelehnt', () => {
  const a = asg('', 22);
  a.admin_note = agreementNote('', { rate: 329, unit: 'daily', units: 22, place: 'Erfundene Straße 9, 12345 Irgendwo', remunerationConfirmed: true, placeConfirmed: true });
  assert(agreementErrors(job, a).length > 0);
});

Deno.test('22 Mo–Fr-Tage über Wochenenden: 5.790,40 € netto, Provision einmal', () => {
  const v = buildDriverOfferView(job, asg('', 22));
  assertEquals(v.missing, []);
  const text = v.lines.map(([l, x]) => `${l}: ${x}`).join('\n');
  assert(text.includes('5.790,40'), text);
  assert(text.includes('1.447,60'), text);
});

Deno.test('Sonderfälle bleiben gesperrt', () => {
  const blocked = (j: any, a: any) => buildDriverOfferView(j, a).missing.length > 0;
  assert(blocked(job, asg('', 30)), 'Kalendertage statt Einsatztage');
  assert(blocked(job, asg('', 22, { rate_value: 349 })), 'regulärer Tagessatz 349');
  assert(blocked({ ...job, weekend_days: ['2026-11-28'] }, asg('', 22)), 'gebuchtes Wochenende');
  assert(blocked({ ...job, besonderheiten: 'Wochenendarbeit' }, asg('', 22)), 'Wochenendarbeit');
  assert(blocked(job, asg('', 26, { end_date: '2026-12-29T00:00:00.000Z' })), 'Feiertage im Zeitraum');
  assert(blocked(job, asg('', 22, { start_date: '2026-11-22T00:00:00.000Z' })), 'Beginn Sonntag');
});
