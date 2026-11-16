// Vollständiger Nachweis mit Original-Versandhandler und Original-Annahme-Loader.
// Aufruf: PROOF_OUT=/tmp/fahrerproof deno run -A --node-modules-dir=auto supabase/functions/send-driver-confirmation/proof_mock.ts
// Ausschließlich TEST-Daten, Mock-Datenbank und Mock-Resend. Kein echter Versand und keine echte Buchung.
import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { agreementNote } from '../_shared/offer-readiness.ts';
import { handleBinding } from '../respond-invite/binding.ts';

const OUT = Deno.env.get('PROOF_OUT');
assert(OUT, 'PROOF_OUT fehlt');
await Deno.mkdir(OUT, { recursive: true });

const job: any = {
  id: 'TEST-JOB-CE-WOCHE', status: 'assigned',
  company: 'TEST Timberpak Muster GmbH', customer_name: 'TEST Thomas Beispiel',
  customer_phone: '+49 000 123456', customer_email: 'test-kunde@example.invalid',
  customer_street: 'TEST Kundenstraße', customer_house_number: '99', customer_postal_code: '66333', customer_city: 'Völklingen',
  einsatzort: 'TEST Hafenstraße 12, Tor 3, 66333 Völklingen',
  zeitraum: 'vom 11.01.2027 bis 12.02.2027 (5 Wochen, jeweils Montag bis Freitag)',
  fahrzeugtyp: 'TEST LKW CE – Wochenpreis', fuehrerscheinklasse: 'CE',
  nachricht: 'TEST – Abrollkipper mit oder ohne Anhänger, zu festen Kunden',
  besonderheiten: 'TEST – keine produktiven Daten', maschinenbedienung: '', tarif_type: 'lkw_ce_woche',
  tarif_label: 'LKW CE Wochenpreis', tarif_netto: 1645, tarif_unit: '5 Einsatztage Montag bis Freitag',
  tarif_mehrstunde_netto: 45, tarif_needs_review: false,
  kosten_uebersicht: { netto: 8225, ust: 1562.75, brutto: 9787.75, positionen: [{ label: '5 Kundenwochen × 1.645 €', betrag: 8225 }] },
  unterkunft_option: 'keine', unterkunft_obergrenze: null,
};
const assignment: any = {
  id: 'TEST-ASSIGNMENT-CE-WOCHE', job_id: job.id, driver_id: 'TEST-DRIVER-ALEXANDER', status: 'assigned',
  rate_type: 'weekly', rate_value: 1400, commission_pct: 20,
  start_date: '2027-01-11T00:00:00.000Z', end_date: '2027-02-12T00:00:00.000Z', times_entered: null,
  updated_at: '2026-11-16T10:00:00.000Z', job_requests: job,
  fahrer_profile: { id: 'TEST-DRIVER-ALEXANDER', vorname: 'TEST Alexander', nachname: 'Beispiel', email: 'test-fahrer@example.invalid', telefon: '+49 000 654321' },
};
assignment.admin_note = agreementNote('TEST – keine produktive Zuteilung', {
  rate: 1400, unit: 'weekly', units: 5, place: job.einsatzort,
  remunerationConfirmed: true, placeConfirmed: true,
});

const sends: any[] = [];
const inserts: { table: string; value: any }[] = [];
let capturedInvite: any = null;
const fakeClient = {
  from(table: string) {
    const q: any = {
      select() { return q; }, eq() { return q; }, order() { return q; }, not() { return q; }, gte() { return q; },
      maybeSingle() { return Promise.resolve({ data: table === 'job_assignments' ? assignment : null, error: null }); },
      limit() { return Promise.resolve({ data: [], error: null }); },
      insert(value: any) {
        const stored = structuredClone(value);
        inserts.push({ table, value: stored });
        if (table === 'assignment_invites') capturedInvite = { ...stored, id: 'TEST-INVITE-CE-WOCHE', created_at: new Date().toISOString() };
        return Promise.resolve({ error: null });
      },
    };
    return q;
  },
};

const key = '__driverOfferProofMocks';
Reflect.set(globalThis, key, {
  env: { get: () => 'TEST-NOT-SECRET' },
  verifyAdminAuth: async () => ({ success: true, user: { email: 'test-admin@example.invalid' }, supabase: fakeClient }),
  createCorsHeaders: () => ({}), handleCorsPreflightRequest: () => new Response(),
  createErrorResponse: (message: string, status: number) => new Response(JSON.stringify({ message }), { status }),
  logAdminAction: async () => {},
  Resend: class {
    fetchRequest(_path: string, options: any) {
      sends.push(JSON.parse(options.body));
      return Promise.resolve({ error: null, data: { id: 'TEST-RESEND-ID-NICHT-VERSENDET' } });
    }
  },
});

const json = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), {
  status, headers: { 'content-type': 'application/json' },
});
const textOf = (html: string) => html
  .replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

try {
  const original = await Deno.readTextFile(new URL('./index.ts', import.meta.url));
  const source = original.replace(/^import \{ serve \}.*$/m, '')
    .replace(/^import \{ Resend \}.*$/m, `const { Resend } = globalThis.${key};`)
    .replace(/import \{\s*verifyAdminAuth,[\s\S]*?from "\.\.\/_shared\/admin-auth.ts";/, `const { verifyAdminAuth, createCorsHeaders, handleCorsPreflightRequest, createErrorResponse, logAdminAction } = globalThis.${key};`)
    .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, (_m, _q, p) => `from '${new URL(p, import.meta.url).href}'`)
    .replaceAll('Deno.env', `globalThis.${key}.env`)
    .replace('serve(async (req) => {', 'export const handler = async (req: Request) => {')
    .replace(/\}\);\s*$/, '};');
  const { handler } = await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(source)))}#proof`);
  const response = await handler(new Request('https://test.invalid', {
    method: 'POST', body: JSON.stringify({ assignment_id: assignment.id }),
  }));
  const responseBody = await response.json();
  console.log('ORIGINALHANDLER-ANTWORT:', response.status, JSON.stringify(responseBody));
  assertEquals(response.status, 200);
  assertEquals(sends.length, 1);
  assert(capturedInvite?.offer_snapshot?.version === 3);
  const providerPayload = sends[0];
  const html = providerPayload.html;
  const text = textOf(html);
  for (const expected of [
    'Ihre Vergütung für diesen Auftrag', '5.600,00 €', '1.120,00 €',
    '5 Wochen à 5 Einsatztage (Montag bis Freitag)', 'netto je Woche (5 Einsatztage, Mo–Fr)',
    '11.01.2027 – 12.02.2027', 'CE', 'TEST – Abrollkipper mit oder ohne Anhänger, zu festen Kunden',
    'TEST Hafenstraße 12, Tor 3, 66333 Völklingen',
    'Bitte prüfen Sie jetzt die vollständigen Einsatzdaten und Vertragsbedingungen.',
    'Auftrag verbindlich annehmen', 'Fahrerexpress-Agentur', '01577 1442285',
  ]) assert(text.includes(expected), `Mailtext fehlt: ${expected}`);
  assert(!/1\.645|8\.225|9\.787|1\.316|1\.400,00|7\.000|20 %|25 %|Kundenpreis|Vermittlungsprovision|Marge/.test(text), text);

  const snapshot = capturedInvite.offer_snapshot;
  const storedNet = snapshot.job_lines.find(([label]: [string, string]) => label.startsWith('Verbleibende Nettovergütung'))?.[1];
  assertEquals(storedNet, '5.600,00 €');
  assertEquals(snapshot.assignment.rate_value, 1400);
  assertEquals(snapshot.assignment.rate_type, 'weekly');
  assertEquals(snapshot.job.tarif_netto, 1645);
  assert(snapshot.assignment.admin_note.includes('"units":5'));

  const driver = { vorname: 'TEST Alexander', nachname: 'Beispiel', email: 'test-fahrer@example.invalid', status: 'approved', is_blocked: false, is_inactive: false };
  const bindingInvite = { ...capturedInvite, driver, job };
  const bindingClient = { from() {
    const q: any = { select() { return q; }, eq() { return q; }, maybeSingle() { return Promise.resolve({ data: assignment }); } };
    return q;
  } };
  const pageResponse = await handleBinding({
    supabase: bindingClient, invite: bindingInvite, intent: 'load', action: null,
    consentConfirmed: false, checkboxText: null, ip: '', userAgent: '', json,
  });
  const pageData = await pageResponse.json();
  assertEquals(pageData.status, 'ready');
  assertEquals(pageData.job_lines, snapshot.job_lines);
  assert(pageData.contract_sections.length > 0);
  assert(pageData.job_lines.some(([label, value]: [string, string]) => label === 'Kalendertage im vereinbarten Zeitraum' && value === '33'));
  assert(pageData.job_lines.some(([label, value]: [string, string]) => label === 'Vergütete Einheiten' && value.startsWith('5 Wochen')));

  const incompleteAssignment = { ...assignment, rate_value: null, admin_note: null };
  const { createOfferSnapshot } = await import('../_shared/binding-offer.ts');
  const incompleteSnapshot = createOfferSnapshot(job, incompleteAssignment);
  const incompleteInvite = { ...bindingInvite, offer_snapshot: incompleteSnapshot };
  const incompleteResponse = await handleBinding({
    supabase: { from() {
      const q: any = { select() { return q; }, eq() { return q; }, maybeSingle() { return Promise.resolve({ data: incompleteAssignment }); } };
      return q;
    } },
    invite: incompleteInvite, intent: 'load', action: null,
    consentConfirmed: false, checkboxText: null, ip: '', userAgent: '', json,
  });
  const incompleteData = await incompleteResponse.json();
  assertEquals(incompleteData.status, 'remuneration_incomplete');

  await Deno.writeTextFile(`${OUT}/fahrer-auftragsangebot.html`, html);
  await Deno.writeTextFile(`${OUT}/fahrer-auftragsangebot.txt`, text);
  await Deno.writeTextFile(`${OUT}/fahrer-auftragsangebot-provider-payload.json`, JSON.stringify(providerPayload, null, 2));
  await Deno.writeTextFile(`${OUT}/fahrer-auftragsangebot-input-output.json`, JSON.stringify({
    hinweis: 'TEST – Originalhandler mit Mock-Datenbank und Mock-Resend; keine produktiven Daten, kein Versand',
    eingang: { job, assignment },
    ausgang: { http_status: response.status, response: responseBody, provider_payload: providerPayload },
    gespeicherte_angebotskopie: snapshot,
    mock_db_inserts: inserts,
    verguetungsquelle: 'assignment.rate_type=weekly, rate_value=1400, admin_note bestätigt 5 Einheiten; unveränderliche offer_snapshot.job_lines enthalten 5.600,00 € Gesamt-Nettovergütung',
  }, null, 2));
  await Deno.writeTextFile(`${OUT}/annahmeseite-response.json`, JSON.stringify(pageData, null, 2));
  await Deno.writeTextFile(`${OUT}/annahme-fehlende-verguetung-response.json`, JSON.stringify(incompleteData, null, 2));
  console.log('EINGANG: CE-Testfahrersatz 1.400 € × 5 Wochen; Kundenwoche 1.645 € | AUSGANG: 5.600,00 € gesamt, 1.120,00 € je Woche, HTTP 200, 1 Mock-Versand');
  console.log('EINGANG: fehlende Vergütung | AUSGANG: remuneration_incomplete, keine wirksame Annahme');
  console.log('ERGEBNIS: PASS – Originalhandler und Original-Annahme-Loader; kein echter Versand oder produktiver Schreibzugriff');
} finally {
  Reflect.deleteProperty(globalThis, key);
}
