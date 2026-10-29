// Ausschließlich lokale Testdaten und simulierte Dienste; keine Netzwerk-/Datenbankzugriffe.
import { assertEquals, assert } from 'jsr:@std/assert@1';
import { berechneKostenUebersicht } from '../_shared/kosten-uebersicht.ts';
import { CUSTOMER_TERMS_VERSION } from '../_shared/customer-confirmation.ts';
import * as React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';

Deno.test('Serverberechnung: zwei CE-Einsatztage zu 349 € ergeben 698 / 132,62 / 830,62 €', () => {
  const kosten = berechneKostenUebersicht('lkw_ce', '2026-11-05', '2026-11-06');
  assert(kosten);
  assertEquals(kosten.positionen, [{ label: 'LKW-Fahrer CE: 2 Einsatztage × 349,00 €', betrag: 698 }]);
  assertEquals(kosten.netto, 698);
  assertEquals(kosten.ust, 132.62);
  assertEquals(kosten.brutto, 830.62);
});

for (const versandFehler of [false, true]) {
  Deno.test(`Administrator-Versand mit identischer Kostenvorschau: ${versandFehler ? 'simulierter Fehler' : 'simulierter Erfolg'}`, async () => {
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
          return Promise.resolve({ error: null });
        },
      },
    };
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
      const original = await Deno.readTextFile(new URL('./index.ts', import.meta.url));
      const source = original
        .replace(/^import \{ serve \}.*$/m, '')
        .replace(/^import \{ createClient \}.*$/m, `const { createClient } = globalThis.${globalKey};`)
        .replace(/^import \{ renderAsync \}.*$/m, `const { render: renderAsync } = globalThis.${globalKey};`)
        .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, (_match, _quote, path) => `from '${new URL(path, import.meta.url).href}'`)
        .replaceAll('Deno.env', `globalThis.${globalKey}.env`)
        .replace('await import("npm:resend@2.0.0")', `globalThis.${globalKey}`)
        .replace('serve(handler);', 'export { handler };');
      const { handler } = await import(`data:application/typescript;base64,${btoa(unescape(encodeURIComponent(source)))}#${versandFehler}`);
      const response = await handler(new Request('https://test.invalid', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname: 'TEST', nachname: 'Kunde', email: 'kunde@example.invalid', phone: '000',
          customer_street: 'Testweg', customer_house_number: '1', customer_postal_code: '00000', customer_city: 'Teststadt',
          nachricht: 'TEST', fahrzeugtyp: 'lkw', einsatzbeginn: '2026-11-05', einsatzende: '2026-11-06',
          unterkunft_option: 'keine', bedingungen_akzeptiert: true, bedingungen_fassung: CUSTOMER_TERMS_VERSION,
        }),
      }));
      assertEquals(response.status, 200);
      assertEquals(gespeicherteAuftraege.length, 1);
      assertEquals(kundenPayloads.length, 1);
      assertEquals(adminPayloads.length, 1);
      assertEquals(sendungen.length, 1);
      // Identische Objektinstanz: keine zweite Berechnung für die Admin-Mail.
      assert(adminPayloads[0].kostenUebersicht === gespeicherteAuftraege[0].kosten_uebersicht);
      assert(kundenPayloads[0].kosten_uebersicht === adminPayloads[0].kostenUebersicht);
      const html = String(sendungen[0].html);
      for (const geldbetrag of ['349,00', '698,00', '132,62', '830,62']) assert(html.includes(geldbetrag), `${geldbetrag} fehlt im simulierten Versand`);
      assertEquals(logs.length, 1);
      assertEquals(logs[0].status, versandFehler ? 'failed' : 'sent');
      assertEquals(logs[0].template, 'admin_booking_notification');
      if (versandFehler) assertEquals(logs[0].error_message, 'Simulierter Versandfehler');
      else assertEquals(logs[0].message_id, 'TEST-MAIL-ID');
    } finally {
      Reflect.deleteProperty(globalThis, globalKey);
    }
  });
}