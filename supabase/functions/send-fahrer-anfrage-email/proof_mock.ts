// Aufruf: PROOF_OUT=/tmp/proof deno run -A --no-check send-fahrer-anfrage-email/proof_mock.ts
// Nachweis: echter Handler von send-fahrer-anfrage-email mit Mock-Versand (Resend) und Mock-Datenbank. Kein echter Versand.
import { assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { resolveTarif } from '../_shared/tarif-zuordnung.ts';
import { berechneKostenUebersicht, gebuchteZuschlagstage, wochenendarbeitGebucht } from '../_shared/kosten-uebersicht.ts';
import { listSurchargeDays } from '../_shared/german-holidays.ts';

const OUT = Deno.env.get('PROOF_OUT');
const captured: { resend: any[]; db: any[] } = { resend: [], db: [] };
const realFetch = globalThis.fetch;
Deno.env.set('RESEND_API_KEY', 're_mock'); Deno.env.set('INTERNAL_FN_SECRET', 'mock-secret');
Deno.env.set('SUPABASE_URL', 'http://mock-db.invalid'); Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'mock-key');
globalThis.fetch = async (input: any, init?: any) => {
  const url = String(input?.url ?? input);
  if (url.includes('api.resend.com')) { captured.resend.push(JSON.parse(init.body)); return new Response(JSON.stringify({ id: `mock-resend-${captured.resend.length}` }), { status: 200, headers: { 'content-type': 'application/json' } }); }
  if (url.startsWith('http://mock-db.invalid')) { captured.db.push({ url, body: JSON.parse(init.body) }); return new Response('[]', { status: 201, headers: { 'content-type': 'application/json' } }); }
  return realFetch(input, init);
};
await import('./index.ts'); // startet serve(handler) auf Port 8000

async function run(name: string, anforderungen: string[]) {
  const tarif = resolveTarif({ kategorie: 'LKW CE Wochenpreis', maschinenbedienung: '', longDistance: false, beschreibung: 'TEST Abrollkipper', leistung: '' });
  const we = wochenendarbeitGebucht(anforderungen);
  const k = berechneKostenUebersicht(tarif.tarif, '2026-11-17', '2026-12-23', { wochenendarbeit: we });
  const sd = gebuchteZuschlagstage(listSurchargeDays('2026-11-17', '2026-12-23'), we);
  const body = { vorname: 'TEST Erika', nachname: 'Beispiel', email: 'test-kunde@example.invalid', phone: '+49 000 TEST', company: 'TEST-Firma GmbH', message: 'TEST – Abrollkipper mit oder ohne Anhänger', einsatzbeginn: '2026-11-17', einsatzdauer: 'vom 17.11.2026 bis 23.12.2026 (37 Kalendertage)', einsatzende: '2026-12-23', fahrzeugtyp: 'LKW CE Wochenpreis', anforderungen, einsatzort: '66333 Völklingen', customer_postal_code: '66333', customer_city: 'Völklingen', tarif, surcharge_days: sd, weekend_holiday_affected: sd.length > 0, weekend_holiday_acknowledged: sd.length > 0, unterkunft_option: 'keine', kosten_uebersicht: k, job_id: '00000000-0000-0000-0000-000000000001' };
  const n = captured.resend.length;
  const r = await realFetch('http://localhost:8000/', { method: 'POST', headers: { 'x-internal-secret': 'mock-secret', 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const resp = await r.json();
  const mail = captured.resend[n];
  const snap = captured.db.find((d) => d.url.includes('customer_email_snapshots') && d.body.provider_message_id === resp.data?.id)?.body;
  if (OUT) { await Deno.writeTextFile(`${OUT}/${name}.html`, mail.html); await Deno.writeTextFile(`${OUT}/${name}-snapshot.json`, JSON.stringify({ ...snap, html: `[${snap.html.length} Zeichen, identisch mit versendetem HTML: ${snap.html === mail.html}]` }, null, 2)); await Deno.writeTextFile(`${OUT}/${name}-input-output.json`, JSON.stringify({ input: { zeitraum: '2026-11-17 – 2026-12-23', tarif: tarif.tarif, anforderungen }, output: k }, null, 2)); }
  const t = mail.html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ');
  return { k, mail, snap, t, resp };
}

try {
  const a = await run('ohne-wochenendarbeit', []);
  assert(a.k!.netto === 8883, `netto ${a.k!.netto}`);
  assert(a.t.includes('5 Wochen (Mo–Fr) × 1.645,00 €') && a.t.includes('2 Einsatztage (Mo–Fr) × 329,00 €') && a.t.includes('8.883,00 €') && a.t.includes('10.570,77 €'));
  assert(!/\b(Sa|So), \d{2}\.\d{2}\.2026/.test(a.t), 'keine Wochenendpositionen');
  assert(!a.t.includes('Wochenendarbeit angefragt') && !a.t.includes('Ihr Zeitraum enthält einen Samstag'), 'kein Wochenendhinweis');
  assert(!/(?<![Uu]n)verbindliche Anfrage/.test(a.t) && a.t.includes('Ihre unverbindliche Fahreranfrage ist eingegangen'));
  assert(a.snap.html === a.mail.html && a.snap.subject === a.mail.subject && a.snap.recipient === 'test-kunde@example.invalid' && a.snap.status === 'sent' && a.snap.provider_message_id === 'mock-resend-1' && a.snap.job_id === '00000000-0000-0000-0000-000000000001');
  const b = await run('mit-wochenendarbeit', ['Wochenendarbeit']);
  assert(b.k!.netto === 13681.75, `netto ${b.k!.netto}`);
  assert(b.t.includes('13.681,75 €') && b.t.includes('16.281,28 €') && b.t.includes('Sa, 21.11.2026') && b.t.includes('Sie haben Wochenendarbeit angefragt'));
  assert(b.snap.html === b.mail.html && b.snap.status === 'sent');
  console.log('BETREFF:', a.mail.subject, '| VON:', a.mail.from, '| AN:', a.mail.to);
  console.log('ERGEBNIS: PASS – alle Prüfungen bestanden');
  Deno.exit(0);
} catch (e) { console.log('ERGEBNIS: FAIL –', e?.message ?? e); Deno.exit(1); }
