// Actual assignment handler with fake auth/storage; no remote writes or mail.
import { assertEquals, assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { readAgreement } from '../_shared/offer-readiness.ts';
import { buildDriverOfferView } from '../_shared/driver-offer-remuneration.ts';

for (const scenario of ['valid', 'rate-missing', 'calculation-missing', 'place-missing', 'weekend-unbooked', 'duplicate', 'reassignment', 'unauthorized']) {
  Deno.test(`Automatische Zuteilung: ${scenario}`, async () => {
    const writes: any[] = [];
    const place = 'TEST Hafenstraße 12, Tor 3, 12345 Musterstadt';
    const weekly = scenario === 'weekend-unbooked';
    const job = {
      id: 'TEST-JOB', tarif_type: weekly ? 'lkw_ce_woche' : 'fernfahrer', tarif_netto: weekly ? 1645 : 450,
      tarif_needs_review: false, zeitraum: '16.11.2026 – 20.11.2026', besonderheiten: '',
      einsatzort: scenario === 'place-missing' ? '' : place,
      kosten_uebersicht: scenario === 'calculation-missing' ? { netto: 2250, positionen: [] } : weekly
        ? { netto: 2081.25, positionen: [{ label: 'LKW-Woche: 1 Woche × 1.645,00 €', betrag: 1645 }, { label: 'Sa, 21.11.: 349,00 € + 25 % Zuschlag', betrag: 436.25 }] }
        : { netto: 2250, positionen: [{ label: 'LKW CE: 5 Einsatztage × 450,00 €', betrag: 2250 }] },
    };
    if (scenario === 'rate-missing') job.tarif_netto = null as any;
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
    const key = '__assignAutomaticReadiness';
    const originalFetch = globalThis.fetch;
    Reflect.set(globalThis, key, { client, handler: null });
    globalThis.fetch = async () => new Response(JSON.stringify({ success: true, skipped: true }), { status: 200 });
    try {
      const original = await Deno.readTextFile(new URL('./index.ts', import.meta.url));
      const code = original.replace(/^import \{ createClient \}.*$/m, `const createClient = () => globalThis.${key}.client;`)
        .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, (_m, _q, p) => `from '${new URL(p, import.meta.url).href}'`)
        .replace('Deno.serve(', `globalThis.${key}.handler = (`)
        .replace(/Deno.env.get\('[^']+'\)/g, `'TEST-CONFIG'`);
      await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(code)))}#${scenario}`);
      const { handler } = Reflect.get(globalThis, key);
      // Absichtlich falsche Browserwerte: der Server muss sie ignorieren und neu berechnen.
      const body = { jobId: job.id, driverId: 'TEST-DRIVER', rateType: 'hourly', rateValue: 1,
        startDate: '2026-11-16T00:00:00Z', endDate: '2026-11-20T00:00:00Z', note: 'MANIPULIERT' };
      const headers: Record<string, string> = scenario === 'unauthorized' ? {} : { Authorization: 'Bearer TEST' };
      const response = await handler(new Request('https://test.invalid', { method: 'POST', headers, body: JSON.stringify(body) }));
      const expected = ['valid', 'reassignment'].includes(scenario) ? 200 : scenario === 'duplicate' ? 409 : scenario === 'unauthorized' ? 401 : 422;
      assertEquals(response.status, expected, await response.clone().text());
      if (response.status !== 200) assertEquals(writes.length, 0);
      else {
        const inserted = writes.find((write) => write.table === 'job_assignments')?.value;
        assertEquals(inserted.rate_type, 'daily');
        assertEquals(inserted.rate_value, 450);
        assert(!inserted.admin_note.includes('MANIPULIERT'));
        const agreement = readAgreement(inserted);
        assertEquals(agreement?.source, 'booking_calculation_v1');
        assertEquals(agreement?.serviceCents, 225000);
        assertEquals(agreement?.remunerationConfirmed, false);
        assertEquals(agreement?.placeConfirmed, false);
        assertEquals(buildDriverOfferView(job, inserted).lines.find(([label]) => label.startsWith('Verbleibende Nettovergütung'))?.[1], '1.800,00 €');
        const update = writes.find((write) => write.table === 'job_requests' && write.value?.status)?.value;
        assertEquals(update, { status: 'assigned' });
      }
      assertEquals(JSON.stringify(previous), frozen);
    } finally {
      globalThis.fetch = originalFetch;
      Reflect.deleteProperty(globalThis, key);
    }
  });
}
