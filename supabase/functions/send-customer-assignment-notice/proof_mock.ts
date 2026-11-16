// Aufruf: PROOF_OUT=/tmp/proof deno run -A --no-check send-customer-assignment-notice/proof_mock.ts
// Echter produktiver Handler, Mock-Admin, Mock-Datenbank und Mock-Resend. Kein echter Versand/DB-Zugriff.
import { assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';

const OUT = Deno.env.get('PROOF_OUT');
const captured: { resend: any[]; db: any[] } = { resend: [], db: [] };
const realFetch = globalThis.fetch;
let assignmentStatus = 'confirmed';
let jobStatus = 'assigned';

Deno.env.set('RESEND_API_KEY', 're_mock');
Deno.env.set('SUPABASE_URL', 'http://mock-db.invalid');
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'mock-key');

const assignment = () => ({
  id: 'assignment-test-0001',
  job_id: 'job-test-0001',
  driver_id: 'driver-test-0001',
  status: assignmentStatus,
  start_date: '2026-11-17T00:00:00.000Z',
  end_date: '2026-12-23T00:00:00.000Z',
  times_entered: null,
  job_requests: {
    id: 'job-test-0001',
    status: jobStatus,
    customer_email: 'test-kunde@example.invalid',
    customer_name: 'TEST Erika Beispiel',
    company: 'TEST-Firma GmbH',
    einsatzort: '66333 Völklingen',
    tarif_type: 'lkw_ce_woche',
    tarif_needs_review: false,
  },
  fahrer_profile: {
    vorname: 'TEST Arlind',
    nachname: 'Beispielfahrer',
    telefon: '+49 000 TEST-FAHRER',
    email: 'test-fahrer@example.invalid',
  },
});

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'content-type': 'application/json' },
});

globalThis.fetch = async (input: any, init?: any) => {
  const url = String(input?.url ?? input);
  const method = String(init?.method ?? input?.method ?? 'GET').toUpperCase();
  if (url.includes('api.resend.com')) {
    captured.resend.push(JSON.parse(init.body));
    return json({ id: `mock-resend-assignment-${captured.resend.length}` });
  }
  if (url.startsWith('http://mock-db.invalid')) {
    const path = new URL(url).pathname;
    const rawBody = init?.body ? JSON.parse(init.body) : null;
    captured.db.push({ method, url, body: rawBody });
    if (path === '/auth/v1/user') {
      return json({ id: 'admin-test-0001', email: 'test-admin@example.invalid', role: 'authenticated' });
    }
    if (path === '/rest/v1/user_roles') return json({ role: 'admin' });
    if (path === '/rest/v1/email_log' && method === 'GET') return json([]);
    if (path === '/rest/v1/job_assignments' && method === 'GET') return json(assignment());
    if ((path === '/rest/v1/customer_email_snapshots' || path === '/rest/v1/email_log') && method === 'POST') {
      return json([rawBody], 201);
    }
    return json({ message: `Unerwarteter Mock-Zugriff: ${method} ${path}` }, 500);
  }
  return realFetch(input, init);
};

await import('./index.ts'); // startet den produktiven serve(handler) auf Port 8000

async function invoke(authorization = 'Bearer mock-admin-token') {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (authorization) headers.authorization = authorization;
  return await realFetch('http://localhost:8000/', {
    method: 'POST',
    headers,
    body: JSON.stringify({ assignment_id: 'assignment-test-0001' }),
  });
}

const textOf = (html: string) => html
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ');

try {
  const unauth = await invoke('');
  assert(unauth.status === 401, `ohne Admin: ${unauth.status}`);

  const response = await invoke();
  const result = await response.json();
  assert(response.status === 200 && result.success === true, JSON.stringify(result));
  assert(captured.resend.length === 1, 'genau eine simulierte Kundenmail');
  const mail = captured.resend[0];
  const text = textOf(mail.html);
  assert(mail.subject.startsWith('Einsatzbestätigung durch Fahrerexpress'));
  assert(text.includes('Status: Einsatzbestätigung durch Fahrerexpress – der Fahrer ist verbindlich zugewiesen.'));
  assert(text.includes('Fahrerexpress hat') && text.includes('vereinbarten Konditionen'));
  assert(text.includes('TEST Arlind Beispielfahrer') && text.includes('1.645,00 €'));
  assert(!/Annahme durch einen Fahrer|Fahrer (hat )?(angenommen|abgelehnt)|Interessenanfrage|Kandidaten|Einsatzbereitschaft|Provision|Fahrerhonorar/.test(text));

  const snapshotRow = captured.db.find((d) => d.url.includes('customer_email_snapshots'))?.body;
  assert(snapshotRow && snapshotRow.html === mail.html && snapshotRow.subject === mail.subject);
  assert(snapshotRow.job_id === 'job-test-0001' && snapshotRow.assignment_id === 'assignment-test-0001');
  assert(snapshotRow.status === 'sent' && snapshotRow.provider_message_id === 'mock-resend-assignment-1');
  assert(!captured.db.some((d) => /job_driver_acceptances|assignment_invites/.test(d.url)), 'keine Fahrerannahme abgefragt oder benötigt');

  if (OUT) {
    await Deno.writeTextFile(`${OUT}/einsatzbestaetigung.html`, mail.html);
    await Deno.writeTextFile(`${OUT}/einsatzbestaetigung.txt`, mail.text);
    await Deno.writeTextFile(`${OUT}/einsatzbestaetigung-snapshot.json`, JSON.stringify({
      ...snapshotRow,
      html: `[${snapshotRow.html.length} Zeichen, identisch mit versendetem HTML: ${snapshotRow.html === mail.html}]`,
    }, null, 2));
    await Deno.writeTextFile(`${OUT}/einsatzbestaetigung-input-output.json`, JSON.stringify({
      input: { assignment: assignment(), driver_acceptance: 'nicht vorhanden und nicht abgefragt' },
      output: { status: response.status, response: result, provider_payload: { ...mail, html: `[${mail.html.length} Zeichen]` } },
      database_requests: captured.db.map((d) => ({ method: d.method, path: new URL(d.url).pathname, query: new URL(d.url).search })),
    }, null, 2));
  }

  assignmentStatus = 'cancelled';
  jobStatus = 'cancelled';
  const cancelled = await invoke();
  const cancelledResult = await cancelled.json();
  assert(cancelled.status === 409 && cancelledResult.success === false, JSON.stringify(cancelledResult));
  assert(captured.resend.length === 1, 'stornierte Zuweisung: keine weitere Mail');

  console.log('EINGANG: aktive Admin-Zuweisung, keine Fahrerannahme | AUSGANG: HTTP 200, 1 simulierte Kundenmail, Snapshot exakt');
  console.log('EINGANG: stornierte Zuweisung | AUSGANG: HTTP 409, keine weitere Mail');
  console.log('ERGEBNIS: PASS – Zuweisung löst Bestätigung aus; Fahrerannahme irrelevant; Storno gesperrt');
  Deno.exit(0);
} catch (error) {
  console.log('ERGEBNIS: FAIL –', error?.message ?? error);
  Deno.exit(1);
}
