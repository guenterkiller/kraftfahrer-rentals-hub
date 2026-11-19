// Actual assignment handler with fake auth/storage; no remote writes or mail.
import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { agreementNote } from '../_shared/offer-readiness.ts';

for (const scenario of ['valid', 'rate-missing', 'units-missing', 'place-missing', 'place-unconfirmed', 'duplicate', 'reassignment']) {
  Deno.test(`Zuteilung: ${scenario}`, async () => {
    const writes: any[] = [];
    const place = 'TEST Hafenstraße 12, Tor 3, 12345 Musterstadt';
    const job = { id: 'TEST-JOB', tarif_type: 'fernfahrer', einsatzort: scenario === 'place-missing' ? '' : place };
    const previous = { id: 'OLD', status: scenario === 'duplicate' ? 'confirmed' : 'cancelled', rate_value: 300 };
    const frozen = JSON.stringify(previous);
    const client = { auth: { getUser: async () => ({ data: { user: { id: 'TEST-ADMIN' } } }) }, from(table: string) {
      const q: any = { select() { return q; }, eq() { return q; }, in() { return q; },
        single: async () => ({ data: table === 'user_roles' ? { role: 'admin' } : table === 'job_requests' ? job : { id: 'TEST-DRIVER', status: 'approved' } }),
        maybeSingle: async () => ({ data: scenario === 'duplicate' ? previous : null }),
        insert: async (value: any) => { writes.push({ table, value }); return { error: null }; },
        update(value: any) { writes.push({ table, value }); return q; },
        then(resolve: any) { resolve({ error: null }); },
      }; return q;
    } };
    const key = '__assignReadiness';
    Reflect.set(globalThis, key, { client, handler: null });
    try {
      const original = await Deno.readTextFile(new URL('./index.ts', import.meta.url));
      const code = original.replace(/^import \{ createClient \}.*$/m, `const createClient = () => globalThis.${key}.client;`)
        .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, (_m, _q, p) => `from '${new URL(p, import.meta.url).href}'`)
        .replace('Deno.serve(', `globalThis.${key}.handler = (`)
        .replace(/Deno.env.get\('[^']+'\)/g, `'TEST-CONFIG'`);
      await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(code)))}#${scenario}`);
      const { handler } = Reflect.get(globalThis, key);
      const body = { jobId: job.id, driverId: 'TEST-DRIVER', rateType: 'daily', rateValue: scenario === 'rate-missing' ? null : 450,
        startDate: '2026-11-16T00:00:00Z', endDate: '2026-11-23T00:00:00Z',
        note: agreementNote('TEST', { rate: 450, unit: 'daily', units: scenario === 'units-missing' ? 0 : 6, place, remunerationConfirmed: true, placeConfirmed: scenario !== 'place-unconfirmed' }),
      };
      const response = await handler(new Request('https://test.invalid', { method: 'POST', headers: { Authorization: 'Bearer TEST' }, body: JSON.stringify(body) }));
      assertEquals(response.status, ['valid', 'reassignment'].includes(scenario) ? 200 : scenario === 'duplicate' ? 409 : 422);
      if (response.status !== 200) assertEquals(writes.length, 0);
      else { assertEquals(writes[0].value.rate_value, 450); assert(writes[0].value.admin_note.includes('"units":6')); }
      assertEquals(JSON.stringify(previous), frozen);
    } finally { Reflect.deleteProperty(globalThis, key); }
  });
}