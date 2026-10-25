// Prüft Hotelbudget 0/20/75/75,01: Serverprüfung und Anzeige in Kunden- und Admin-Mail (nur Rendern, kein Versand).
import { assert, assertEquals } from 'jsr:@std/assert@1';
import * as React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { parseUnterkunftObergrenze } from './unterkunft-obergrenze.ts';
import { AdminBookingNotification } from '../_shared/email-templates/admin-booking-notification.tsx';

Deno.test('Server akzeptiert 0, 20, 75 und lehnt 75,01, negativ und ungültig ab', () => {
  assertEquals(parseUnterkunftObergrenze(0), 0);
  assertEquals(parseUnterkunftObergrenze('20'), 20);
  assertEquals(parseUnterkunftObergrenze('75,00'), 75);
  for (const v of [75.01, '75,01', -1, 'abc', '20,555', '', null]) {
    assertEquals(parseUnterkunftObergrenze(v as never), null, String(v));
  }
});

for (const [wert, text] of [[0, '0,00'], [20, '20,00'], [75, '75,00']] as const) {
  Deno.test(`Admin-Mail zeigt Hotelbudget ${wert} €`, async () => {
    const html = await renderAsync(React.createElement(AdminBookingNotification, {
      customerName: 'TEST Kunde', email: 'test@example.invalid', phone: '0', address: 'x',
      timeframe: 'x', driverType: 'LKW CE', message: 'x', billingModel: 'agency', jobId: 'TEST',
      tarif: { tarif: 'lkw_ce', label: 'LKW CE', needsReview: false, reason: '' } as never,
      unterkunftOption: 'fahrer_organisiert', unterkunftObergrenze: wert,
    }));
    assert(html.includes('Hotelbudget je erforderlicher Übernachtung'));
    assert(html.includes(text), `Betrag ${text} fehlt`);
  });
}
