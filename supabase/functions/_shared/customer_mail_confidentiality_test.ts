// Kundenadressierte Mails dürfen nie Fahrerhonorar, Fahrersatz, Provision oder interne Kalkulation zeigen.
import React from 'npm:react@18.3.1';
import { assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { renderAsync } from './render-email.ts';
import { CustomerBookingConfirmation } from './email-templates/customer-booking-confirmation.tsx';
import { berechneKostenUebersicht } from './kosten-uebersicht.ts';

const FORBIDDEN = /provision|commission|vermittlungsanteil|fahrerhonorar|fahrersatz|fahrervergütung|nettovergütung|rate_value/i;
const strip = (h: string) => h.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');

Deno.test('Kundenbuchungsbestätigung: alle Tarif- und Unterkunftsvarianten ohne interne Fahrerdaten', async () => {
  for (const tarif of ['lkw_ce', 'lkw_ce_woche', 'fernfahrer', 'baumaschine', 'event', 'individuell']) {
    for (const unterkunftOption of ['keine', 'gestellt', 'budget', 'auftraggeber_stellt', 'fahrer_organisiert', 'im_fahrzeug']) {
      const kosten = berechneKostenUebersicht(tarif as any, '2026-11-16', '2026-11-20');
      const html = await renderAsync(React.createElement(CustomerBookingConfirmation as any, {
        customerName: 'TEST Kunde', companyName: 'TEST GmbH', driverType: 'LKW CE', timeframe: '16.11.2026–20.11.2026', location: 'TEST-Ort', message: 'TEST',
        selectedActivity: 'TEST', isFernfahrerTarif: tarif === 'fernfahrer', unterkunftOption, unterkunftObergrenze: 75, kostenUebersicht: kosten,
        tarif: { tarif, label: `TEST ${tarif}`, netto: 349, einheit: 'Tag', mehrstunde: 45, needsReview: tarif === 'individuell', reason: 'TEST' },
      }));
      const text = strip(html);
      assert(!FORBIDDEN.test(text), `${tarif}/${unterkunftOption}: ${text.match(FORBIDDEN)?.[0]}`);
    }
  }
});

Deno.test('Kundenadressierte Versandfunktionen enthalten keine Fahrerhonorar-/Provisionsquellen', async () => {
  for (const f of ['../send-customer-assignment-notice/index.ts', '../send-customer-newsletter/index.ts', '../send-fahrer-anfrage-email/index.ts', './email-templates/customer-booking-confirmation.tsx', './email-templates/overnight-cost-notice.tsx', './customer-confirmation.ts']) {
    const src = await Deno.readTextFile(new URL(f, import.meta.url));
    assert(!/provision|commission|rate_value|fahrerhonorar|vermittlungsanteil|driver-offer-remuneration|binding-offer/i.test(src), f);
  }
});
