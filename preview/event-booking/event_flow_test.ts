// Draft handlers only; every database and email operation is simulated.
import { assertEquals, assert } from 'jsr:@std/assert@1';
import * as React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { CUSTOMER_TERMS_VERSION } from '../../supabase/functions/_shared/customer-confirmation.ts';
import { createOfferSnapshot } from '../../supabase/functions/_shared/binding-offer.ts';
import { EVENT_TAETIGKEITEN } from '../../src/lib/eventTaetigkeiten.ts';
for (const activity of EVENT_TAETIGKEITEN) {
  const versandFehler = false;
  Deno.test(`Event-Datenfluss mit simuliertem Versand: ${activity}`, async () => {
    const gespeicherteAuftraege: Record<string, unknown>[] = [];
    const logs: Record<string, unknown>[] = [];
    const kundenPayloads: Record<string, unknown>[] = [];
    const adminPayloads: Record<string, unknown>[] = [];
    const sendungen: Record<string, unknown>[] = [];
    const fakeClient = {
      from(table: string) {
        let inserting = false;
        const query = {
          select() { return query; },
          eq() { return query; },
          gte() { return query; },
          limit() { return Promise.resolve({ data: [] }); },
          insert(rows: Record<string, unknown>[] | Record<string, unknown>) {
            inserting = true;
            if (table === 'job_requests') gespeicherteAuftraege.push(...rows as Record<string, unknown>[]);
            else if (table === 'email_log') logs.push(rows as Record<string, unknown>);
            else throw new Error(`Unerwartete Tabelle: ${table}`);
            return query;
          },
          single() {
            if (table === 'admin_settings') return Promise.resolve({ data: { admin_email: 'admin@example.invalid' } });
            assert(inserting);
            return Promise.resolve({ data: { id: 'TEST-JOB', ...gespeicherteAuftraege[0] }, error: null });
          },
        };
        return query;
      },
      functions: {
        invoke(name: string, options: { body: Record<string, unknown> }) {
          assertEquals(name, 'send-fahrer-anfrage-email');
          kundenPayloads.push(options.body);
          return customerHandler(new Request('https://test.invalid', { method: 'POST', headers: { 'x-internal-secret': 'TEST-NOT-A-SECRET' }, body: JSON.stringify(options.body) })).then(async response => { assertEquals(response.status, 200); await response.text(); return { error: null }; });
        },
      },
    };
    let customerHandler: (req: Request) => Promise<Response>;
    const customerSends: Record<string, unknown>[] = [];
    const mocks = {
      createClient: () => fakeClient,
      env: { get: () => 'TEST-NOT-A-SECRET' },
      async render(element: React.ReactElement<Record<string, unknown>>) {
        adminPayloads.push(element.props);
        return await renderAsync(element);
      },
      Resend: class {
        emails = { send(payload: Record<string, unknown>) {
          sendungen.push(payload);
          return Promise.resolve(versandFehler
            ? { error: { message: 'Simulierter Versandfehler' }, data: null }
            : { error: null, data: { id: 'TEST-MAIL-ID' } });
        } };
      },
    };
    const globalKey = '__adminCostPreviewMocks';
    Reflect.set(globalThis, globalKey, mocks);
    try {
      // Originaler Ablauf mit lokal ersetzten Außenverbindungen; kein Serverstart.
      const customerMocksKey = '__eventCustomerMocks';
      Reflect.set(globalThis, customerMocksKey, {
        env: mocks.env,
        Resend: class { emails = { send(payload: Record<string, unknown>) { customerSends.push(payload); return Promise.resolve({ data: { id: 'TEST' }, error: null }); } }; },
        createClient: () => ({ from: () => ({ insert: async () => ({ error: null }) }) }),
      });
      const customerPath = new URL('./send-fahrer-anfrage-email.ts', import.meta.url);
      const customerOriginal = await Deno.readTextFile(customerPath);
      const customerSource = customerOriginal.replace(/^import \{ serve \}.*$/m, '')
        .replace(/^import \{ Resend \}.*$/m, `const { Resend } = globalThis.${customerMocksKey};`)
        .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, (_m,_q,path) => `from '${new URL(path,customerPath).href}'`)
        .replaceAll('Deno.env', `globalThis.${customerMocksKey}.env`)
        .replace('await import("https://esm.sh/@supabase/supabase-js@2.52.0")', `globalThis.${customerMocksKey}`);
      customerHandler = (await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(customerSource)))}#${encodeURIComponent(activity)}`)).handler;
      const original = await Deno.readTextFile(new URL('./submit-fahrer-anfrage.ts', import.meta.url));
      const source = original
        .replace(/^import \{ serve \}.*$/m, '')
        .replace(/^import \{ createClient \}.*$/m, `const { createClient } = globalThis.${globalKey};`)
        .replace(/^import \{ renderAsync \}.*$/m, `const { render: renderAsync } = globalThis.${globalKey};`)
        .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, (_match, _quote, path) => `from '${new URL(path, import.meta.url).href}'`)
        .replaceAll('Deno.env', `globalThis.${globalKey}.env`)
        .replace('await import("npm:resend@2.0.0")', `globalThis.${globalKey}`)
        ;
      const { handler } = await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(source)))}#${encodeURIComponent(activity)}`);
      const response = await handler(new Request('https://test.invalid', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname: 'TEST', nachname: 'Kunde', email: 'kunde@example.invalid', phone: '000',
          customer_street: 'Testweg', customer_house_number: '1', customer_postal_code: '00000', customer_city: 'Teststadt',
          nachricht: 'TEST', fahrzeugtyp: `Baumaschinenführer / Mischmeister – ${activity}`, einsatzbeginn: '2026-11-05', einsatzende: '2026-11-06', einsatzdauer: 'vom 05.11.2026 bis 06.11.2026 (2 Kalendertage)',
          unterkunft_option: 'keine', bedingungen_akzeptiert: true, bedingungen_fassung: CUSTOMER_TERMS_VERSION,
        }),
      }));
      assertEquals(response.status, 200);
      assertEquals(gespeicherteAuftraege.length, 1);
      const stored = gespeicherteAuftraege[0];
      assertEquals(stored.fahrzeugtyp, `Baumaschinenführer / Mischmeister – ${activity}`);
      assertEquals(stored.tarif_netto, 489);
      assertEquals(adminPayloads[0].selectedActivity, stored.fahrzeugtyp);
      assertEquals(kundenPayloads[0].fahrzeugtyp, stored.fahrzeugtyp);
      assert(String(sendungen[0].html).includes(activity));
      const offer = createOfferSnapshot(stored, { id: 'TEST', rate_type: 'daily', rate_value: 489, commission_pct: 20, start_date: '2026-11-05', end_date: '2026-11-06' });
      assert(offer.job_lines?.some(([k,v]) => k === 'Fahrzeugart' && v.includes(activity)));
      assert(offer.job_lines?.some(([k,v]) => k === 'Tarif' && v === stored.tarif_label));
      const frozen = structuredClone(offer);
      assertEquals(offer, frozen);
      assertEquals(kundenPayloads.length, 1);
      assertEquals(adminPayloads.length, 1);
      assertEquals(sendungen.length, 1);
      // Identische Objektinstanz: keine zweite Berechnung für die Admin-Mail.
      assert(adminPayloads[0].kostenUebersicht === gespeicherteAuftraege[0].kosten_uebersicht);
      assert(kundenPayloads[0].kosten_uebersicht === adminPayloads[0].kostenUebersicht);
      assertEquals(customerSends.length, 1);
      assert(String(customerSends[0].html).includes(activity));
      assert(!String(customerSends[0].html).includes('Verbleibende Fahrervergütung'));
      assert(!String(customerSends[0].html).includes('Vermittlungsanteil 20'));
      const html = String(sendungen[0].html);
      for (const geldbetrag of ['489,00', '978,00', '185,82', '1.163,82']) assert(html.includes(geldbetrag), `${geldbetrag} fehlt im simulierten Versand`);
      assertEquals(logs.length, 1);
      assertEquals(logs[0].status, versandFehler ? 'failed' : 'sent');
      assertEquals(logs[0].template, 'admin_booking_notification');
      if (versandFehler) assertEquals(logs[0].error_message, 'Simulierter Versandfehler');
      else assertEquals(logs[0].message_id, 'TEST-MAIL-ID');
    } finally {
      Reflect.deleteProperty(globalThis, globalKey); Reflect.deleteProperty(globalThis, '__eventCustomerMocks');
    }
  });
}