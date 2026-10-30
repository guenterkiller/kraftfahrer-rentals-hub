// Original handler, all external dependencies replaced locally. No real sends/writes.
import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { createOfferSnapshot } from '../_shared/binding-offer.ts';

for (const scenario of ['new', 'sent', 'accepted', 'error', 'no-id', 'snapshot-error']) {
  Deno.test(`Fahrerangebot: isolierter Original-Versandablauf ${scenario}`, async () => {
    const sends: any[] = [], inserts: { table: string; value: any }[] = [];
    const start = new Date(Date.now() + 10 * 86400000).toISOString().slice(0,10);
    const end = new Date(Date.parse(start) + 86400000).toISOString().slice(0,10);
    const de = (d: string) => d.split('-').reverse().join('.');
    const job = { id: 'TEST-JOB', company: 'TEST GmbH', customer_name: 'TEST Kontakt', nachricht: 'Schubboden Scania', fahrzeugtyp: 'LKW CE', zeitraum: `${de(start)} bis ${de(end)}`, tarif_type: 'lkw_ce', tarif_netto: 349, tarif_unit: 'je Einsatztag bis 9 Stunden', tarif_mehrstunde_netto: 45, kosten_uebersicht: { netto: 698, positionen: [{ label: '2 Tage × 349 €', betrag: 698 }] }, unterkunft_option: 'keine' };
    const assignment = { id: 'TEST-ASSIGNMENT', job_id: job.id, driver_id: 'TEST-DRIVER', status: 'assigned', rate_type: 'daily', rate_value: 349, commission_pct: 20, start_date: `${start}T00:00:00Z`, end_date: `${end}T00:00:00Z`, times_entered: null, job_requests: job, fahrer_profile: { email: 'driver@example.invalid', vorname: 'TEST', nachname: 'Fahrer' } };
    const fakeClient = { from(table: string) {
      const q = { select() { return q; }, eq() { return q; },
        maybeSingle() { return Promise.resolve({ data: table === 'job_assignments' ? assignment : scenario === 'accepted' ? { id: 'TEST-ACCEPTANCE' } : null, error: null }); },
        limit() { return Promise.resolve({ data: scenario === 'sent' ? [{ id: 'OLD-INVITE' }] : [], error: null }); },
        insert(value: any) { inserts.push({ table,value }); return Promise.resolve({ error: table === 'assignment_invites' && scenario === 'snapshot-error' ? { message: 'TEST snapshot error' } : null }); },
      }; return q;
    } };
    const key = '__bindingOfferMocks';
    Reflect.set(globalThis, key, {
      env: { get: () => 'TEST-NOT-SECRET' },
      verifyAdminAuth: async () => ({ success: true, user: { email: 'admin@example.invalid' }, supabase: fakeClient }),
      createCorsHeaders: () => ({}), handleCorsPreflightRequest: () => new Response(),
      createErrorResponse: (message: string, status: number) => new Response(JSON.stringify({ message }), { status }),
      logAdminAction: async () => {},
      Resend: class { emails = { send(payload: any) { sends.push(payload); return Promise.resolve(scenario === 'error' ? { error: { message: 'TEST failure' }, data: null } : scenario === 'no-id' ? { error: null, data: {} } : { error: null, data: { id: 'TEST-MAIL' } }); } }; },
    });
    try {
      const original = await Deno.readTextFile(new URL('./index.ts', import.meta.url));
      const source = original.replace(/^import \{ serve \}.*$/m, '')
        .replace(/^import \{ Resend \}.*$/m, `const { Resend } = globalThis.${key};`)
        .replace(/import \{\s*verifyAdminAuth,[\s\S]*?from "\.\.\/_shared\/admin-auth.ts";/, `const { verifyAdminAuth, createCorsHeaders, handleCorsPreflightRequest, createErrorResponse, logAdminAction } = globalThis.${key};`)
        .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, (_m,_q,p) => `from '${new URL(p,import.meta.url).href}'`)
        .replaceAll('Deno.env', `globalThis.${key}.env`)
        .replace('serve(async (req) => {','export const handler = async (req: Request) => {').replace(/\}\);\s*$/, '};');
      const { handler } = await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(source)))}#${scenario}`);
      const response = await handler(new Request('https://test.invalid', { method:'POST', body:JSON.stringify({ assignment_id: assignment.id }) }));
      await response.text();
      assertEquals(response.status, ['error','no-id','snapshot-error'].includes(scenario) ? 500 : 200);
      assertEquals(sends.length, ['sent','accepted','snapshot-error'].includes(scenario) ? 0 : 1);
      assertEquals(inserts.filter(i => i.table === 'assignment_invites').length, ['sent','accepted'].includes(scenario) ? 0 : 1);
      if (sends.length) {
        assertEquals(sends[0].to, ['driver@example.invalid']);
        const snapshot = inserts.find(i => i.table === 'assignment_invites')?.value.offer_snapshot;
        assertEquals(snapshot.job_lines, createOfferSnapshot(job, assignment).job_lines);
        assert(sends[0].html.includes('558,40'));
        assertEquals(inserts.find(i => i.table === 'email_log')?.value.status, ['error','no-id'].includes(scenario) ? 'error' : 'sent');
      }
    } finally { Reflect.deleteProperty(globalThis,key); }
  });
}