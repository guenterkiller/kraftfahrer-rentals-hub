// Echter admin-assign-driver Handler mit Mock-Datenbank und simuliertem internen Kundenversand.
// Kein echter Auftrag, keine echte Datenbank, keine E-Mail.
import { assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { agreementNote } from '../_shared/offer-readiness.ts';

const OUT = Deno.env.get('PROOF_OUT');
const realFetch = globalThis.fetch;
const calls: any[] = [];
let customerCalls = 0;

Deno.env.set('SUPABASE_URL', 'http://mock-db.invalid');
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'mock-key');

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'content-type': 'application/json' },
});

globalThis.fetch = async (input: any, init?: any) => {
  const url = String(input?.url ?? input);
  const method = String(init?.method ?? input?.method ?? 'GET').toUpperCase();
  if (url === 'http://mock-db.invalid/functions/v1/send-customer-assignment-notice') {
    customerCalls += 1;
    calls.push({ method, path: '/functions/v1/send-customer-assignment-notice', body: JSON.parse(init.body) });
    return json({ success: true, emailId: 'mock-customer-notice-1' });
  }
  if (url.startsWith('http://mock-db.invalid')) {
    const path = new URL(url).pathname;
    const body = init?.body ? JSON.parse(init.body) : null;
    calls.push({ method, path, body });
    if (path === '/auth/v1/user') return json({ id: 'admin-test-0001', email: 'test-admin@example.invalid' });
    if (path === '/rest/v1/user_roles') return json({ role: 'admin' });
    if (path === '/rest/v1/job_requests' && method === 'GET') return json({
      id: 'job-test-0001', status: 'approved', tarif_type: 'lkw_ce', tarif_needs_review: false,
      einsatzort: 'Hafenstraße 12, 12345 Musterstadt',
    });
    if (path === '/rest/v1/fahrer_profile') return json({ id: 'driver-test-0001', status: 'approved' });
    if (path === '/rest/v1/job_assignments' && method === 'GET') return json(null);
    if (path === '/rest/v1/job_assignments' && method === 'POST') return json([body], 201);
    if (path === '/rest/v1/job_requests' && method === 'PATCH') return json([], 200);
    if (path === '/rest/v1/admin_actions' && method === 'POST') return json([body], 201);
    return json({ message: `Unerwarteter Mock-Zugriff: ${method} ${path}` }, 500);
  }
  return realFetch(input, init);
};

await import('./index.ts');

const place = 'Hafenstraße 12, 12345 Musterstadt';
const input = {
  jobId: 'job-test-0001',
  driverId: 'driver-test-0001',
  rateType: 'daily',
  rateValue: 300,
  startDate: '2026-11-16',
  endDate: '2026-11-20',
  note: agreementNote('TEST', {
    rate: 300, unit: 'daily', units: 5, place,
    remunerationConfirmed: true, placeConfirmed: true,
  }),
};

try {
  const response = await realFetch('http://localhost:8000/', {
    method: 'POST',
    headers: { authorization: 'Bearer mock-admin-token', 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  const result = await response.json();
  assert(response.status === 200 && result.success === true, JSON.stringify(result));
  assert(result.customerNotice?.attempted === true && result.customerNotice?.sent === true);
  assert(customerCalls === 1, `Kundenaufrufe: ${customerCalls}`);
  const customerCall = calls.find((c) => c.path === '/functions/v1/send-customer-assignment-notice');
  assert(customerCall?.body?.assignment_id === result.assignmentId);
  const assignmentInsert = calls.find((c) => c.path === '/rest/v1/job_assignments' && c.method === 'POST');
  const jobUpdateIndex = calls.findIndex((c) => c.path === '/rest/v1/job_requests' && c.method === 'PATCH');
  const customerIndex = calls.indexOf(customerCall);
  assert(assignmentInsert?.body?.status === 'assigned');
  assert(jobUpdateIndex >= 0 && customerIndex > jobUpdateIndex, 'Kundenmail erst nach Zuweisung und Auftragsstatus');
  assert(!calls.some((c) => /job_driver_acceptances|assignment_invites/.test(c.path)), 'keine Fahrerannahme erforderlich');

  if (OUT) {
    await Deno.writeTextFile(`${OUT}/zuweisung-trigger-input-output.json`, JSON.stringify({
      input: { ...input, note: '[FAHRERANGEBOT_V1 – TEST-Nachweis]' },
      output: result,
      call_order: calls,
      assertions: {
        assignment_before_customer_notice: true,
        no_driver_acceptance_required: true,
        real_email_sent: false,
        real_database_used: false,
      },
    }, null, 2));
  }
  console.log('EINGANG: Admin-Zuweisung ohne Fahrerannahme | AUSGANG: HTTP 200, Zuweisung gespeichert, 1 interner Kundenversand');
  console.log('REIHENFOLGE: Zuweisung → Auftragsstatus assigned → send-customer-assignment-notice');
  console.log('ERGEBNIS: PASS – serverseitiger Zuweisungsauslöser bestätigt');
  Deno.exit(0);
} catch (error) {
  console.log('ERGEBNIS: FAIL –', error?.message ?? error);
  Deno.exit(1);
}
