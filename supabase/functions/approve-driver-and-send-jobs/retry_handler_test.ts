import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';

for (const scenario of ['retry', 'failed', 'no-id', 'throw', 'accepted', 'rejected', 'sent', 'expired', 'blocked', 'lookup-error']) {
  Deno.test(`Vertragsmail: tatsächlicher isolierter Wiederholweg ${scenario}`, async () => {
    const writes: { table: string; value: any }[] = [], sends: any[] = [];
    const invite = { id: 'TEST-INVITE', token: 'SAME-TOKEN', expires_at: new Date(Date.now() + 86400000).toISOString(), created_at: '2026-10-30T12:00:00Z' };
    const fakeClient = { from(table: string) {
      let acceptOnly = false;
      const q = { select() { return q; }, eq(k: string, v: string) { if (k === 'decision' && v === 'accept') acceptOnly = true; return q; },
        is() { return q; }, gt() { return q; }, gte() { return q; }, not() { return q; }, order() { return q; }, limit() { return q; },
        single() { return Promise.resolve({ data: { id: 'TEST-DRIVER', email: 'test@example.invalid', vorname: 'TEST', nachname: 'Fahrer', status: 'approved', is_blocked: scenario === 'blocked' }, error: null }); },
        maybeSingle() { return Promise.resolve({ data: table === 'driver_contract_decisions' ? (scenario === 'accepted' || (!acceptOnly && scenario === 'rejected') ? { id: 'DECISION' } : null) : table === 'driver_contract_invites' ? (scenario === 'expired' ? null : invite) : scenario === 'sent' ? { id: 'SENT' } : null, error: scenario === 'lookup-error' ? { message: 'TEST lookup error' } : null }); },
        update(value: any) { writes.push({ table, value }); return q; },
        insert(value: any) { writes.push({ table, value }); return Promise.resolve({ error: null }); },
      }; return q;
    } };
    const key = '__contractRetryMocks';
    Reflect.set(globalThis, key, {
      env: { get: () => undefined }, React: { createElement: () => 'TEST HTML' }, renderAsync: async () => 'TEST HTML',
      verifyAdminAuth: async () => ({ success: true, user: { email: 'admin@example.invalid' }, supabase: fakeClient }),
      createCorsHeaders: () => ({}), handleCorsPreflightRequest: () => new Response(),
      createErrorResponse: (error: string, status: number) => new Response(JSON.stringify({ error }), { status }), logAdminAction: async () => {},
      Resend: class { headers = new Headers(); emails = { send(payload: any, options: any) {
        sends.push({ payload, options });
        if (scenario === 'throw') throw new Error('TEST network');
        return Promise.resolve(scenario === 'failed' ? { error: { message: 'TEST rejected' } } : scenario === 'no-id' ? { data: {} } : { data: { id: 'TEST-MAIL' } });
      } }; },
    });
    try {
      const original = await Deno.readTextFile(new URL('./index.ts', import.meta.url));
      const source = original.replace(/^import \{ serve \}.*$/m, '')
        .replace(/^import \{ Resend \}.*$/m, `const { Resend } = globalThis.${key};`)
        .replace(/^import React.*$/m, `const { React } = globalThis.${key};`)
        .replace(/^import \{ renderAsync \}.*$/m, `const { renderAsync } = globalThis.${key};`)
        .replace(/^import \{ (Driver\w+|AdminDriverApprovalNotification) \}.*$/gm, 'const $1 = () => null;')
        .replace(/import \{\s*verifyAdminAuth,[\s\S]*?from "\.\.\/_shared\/admin-auth.ts";/, `const { verifyAdminAuth, createCorsHeaders, handleCorsPreflightRequest, createErrorResponse, logAdminAction } = globalThis.${key};`)
        .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, (_m,_q,p) => `from '${new URL(p,import.meta.url).href}'`)
        .replaceAll('Deno.env', `globalThis.${key}.env`)
        .replace('serve(async (req) => {', 'export const handler = async (req: Request) => {').replace(/\}\);\s*$/, '};');
      const { handler } = await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(source)))}#${scenario}`);
      const response = await handler(new Request('https://test.invalid', { method: 'POST', body: JSON.stringify({ driverId: 'TEST-DRIVER', action: 'retry_contract_email' }) }));
      const result = await response.json();
      const shouldSend = ['retry','failed','no-id','throw'].includes(scenario);
      assertEquals(sends.length, shouldSend ? 1 : 0);
      assertEquals(writes.filter(x => x.table !== 'email_log').length, 0);
      if (shouldSend) {
        assertEquals(sends[0].payload.to, ['test@example.invalid']);
        assertEquals(sends[0].options.headers.get('Idempotency-Key'), 'driver-contract/SAME-TOKEN');
        assertEquals(result.contractEmailSent, scenario === 'retry');
        assertEquals(result.contractEmailStatus, scenario === 'retry' ? 'sent' : 'failed');
        assertEquals(writes[0].value.status, scenario === 'retry' ? 'sent' : 'failed');
        assertEquals(result.contractExpiresAt, invite.expires_at);
      } else assert(response.status === 400 || response.status === 500 || result.skipped || result.contractEmailStatus === 'skipped_existing');
    } finally { Reflect.deleteProperty(globalThis, key); }
  });
}