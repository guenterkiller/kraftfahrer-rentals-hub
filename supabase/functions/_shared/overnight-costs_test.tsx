import { renderAsync } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { CustomerBookingConfirmation } from './email-templates/customer-booking-confirmation.tsx';
import { AdminBookingNotification } from './email-templates/admin-booking-notification.tsx';
import { OVERNIGHT_COSTS, overnightParagraphs } from './overnight-costs.ts';

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

for (const key of ['lkw_ce', 'lkw_ce_woche', 'baumaschine', 'fernfahrer', 'ueberfuehrung', 'pruefung']) {
  Deno.test(`Anfragevorlagen: Übernachtungshinweis für ${key}`, async () => {
    const tarif = { tarif: key, label: key, netto: null, einheit: '', mehrstunde: null, needsReview: key === 'pruefung', reason: '' };
    const common = { customerName: 'TEST', driverType: key, timeframe: 'Testzeitraum', message: 'Testtätigkeit', tarif, isFernfahrerTarif: false };
    const customer = await renderAsync(React.createElement(CustomerBookingConfirmation, { ...common, location: 'Testort' }));
    const admin = await renderAsync(React.createElement(AdminBookingNotification, { ...common, address: 'Testort', email: 'test@example.invalid', phone: '000', billingModel: 'agency', jobId: 'test' }));
    for (const html of [customer, admin]) {
      const text = html.replace(/<[^>]*>/g, '').replace(/<!--.*?-->/g, '');
      for (const paragraph of overnightParagraphs(key)) assert(text.includes(paragraph), `Absatz fehlt für ${key}: ${paragraph}`);
      const other = key === 'fernfahrer' ? OVERNIGHT_COSTS.standard : OVERNIGHT_COSTS.fernfahrer;
      for (const paragraph of other) assert(!text.includes(paragraph), `Falsche Tarifregel für ${key}`);
      assert(text.split(OVERNIGHT_COSTS.legal).length === 2, 'Gesetzlicher Hinweis muss genau einmal erscheinen');
    }
  });
}

Deno.test('Tarif hat Vorrang vor altem Fernfahrer-Flag', () => {
  for (const key of ['lkw_ce', 'lkw_ce_woche', 'baumaschine', 'ueberfuehrung', 'pruefung']) {
    assert(overnightParagraphs(key, true)[0] === OVERNIGHT_COSTS.standard[0], `Flag überschreibt ${key}`);
  }
  assert(overnightParagraphs('fernfahrer', false)[0] === OVERNIGHT_COSTS.fernfahrer[0], 'Fernfahrer-Key nicht erkannt');
  assert(overnightParagraphs(undefined, true)[0] === OVERNIGHT_COSTS.fernfahrer[0], 'Legacy-Rückfall fehlt');
});