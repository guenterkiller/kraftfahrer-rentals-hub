import { renderAsync } from './render-email.ts';
import * as React from 'npm:react@18.3.1';
import { CustomerBookingConfirmation } from './email-templates/customer-booking-confirmation.tsx';
import { AdminBookingNotification } from './email-templates/admin-booking-notification.tsx';
import { resolveTarif } from './tarif-zuordnung.ts';
import { berechneKostenUebersicht, FERNFAHRER_PREIS_HINWEIS, FERNFAHRER_WOCHENENDRUHE_HINWEIS } from './kosten-uebersicht.ts';

const assert = (c: boolean, m: string) => { if (!c) throw new Error(m); };
const decode = (h: string) => h.replace(/<[^>]*>/g, '').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

Deno.test('Server: CE-Wochenpreis + Fernverkehr wird Fernfahrer-Pauschale, 8 Tage mit rabattiertem Wochenpreis', () => {
  const tarif = resolveTarif({ kategorie: 'LKW CE Wochenpreis', maschinenbedienung: '', longDistance: true });
  assert(tarif.tarif === 'fernfahrer' && tarif.netto === 450, 'Fernfahrer-Vorrang fehlt');
  const k = berechneKostenUebersicht('fernfahrer', '2026-11-16', '2026-11-23');
  assert(k?.netto === 3471.06 && k?.brutto === 4130.56, `falsche Summe ${k?.netto}/${k?.brutto}`);
  assert(berechneKostenUebersicht('lkw_ce_woche', '2026-11-16', '2026-11-23')?.netto === 2933.75, 'Wochenpreis verändert');
});

Deno.test('Kunden-/Adminmail Fernfahrer: Preis-/Ruhetagshinweis, kein Zuschlags- oder Mehrstundenabschnitt', async () => {
  const tarif = resolveTarif({ kategorie: 'LKW CE Wochenpreis', maschinenbedienung: '', longDistance: true });
  const kostenUebersicht = berechneKostenUebersicht('fernfahrer', '2026-11-16', '2026-11-23');
  const common = { customerName: 'TEST', driverType: tarif.label, timeframe: 'Testzeitraum', message: 'Test', tarif, isFernfahrerTarif: true, kostenUebersicht };
  const customer = decode(await renderAsync(React.createElement(CustomerBookingConfirmation, { ...common, location: 'Testort' })));
  const admin = decode(await renderAsync(React.createElement(AdminBookingNotification, { ...common, address: 'Testort', email: 'test@example.invalid', phone: '000', billingModel: 'agency', jobId: 'test' })));
  assert(customer.includes('450,00 € netto je tatsächlichem Fernverkehrs-Einsatztag'), 'Kundenpreis fehlt');
  assert(customer.includes('Keine Samstags-, Sonntags- oder Feiertagszuschläge'), 'Zuschlagsausschluss fehlt');
  for (const text of [customer, admin]) {
    assert(text.includes(FERNFAHRER_WOCHENENDRUHE_HINWEIS), 'Ruhetagshinweis fehlt');
    assert(text.includes('3.471,06 €') && text.includes('4.130,56 €'), 'Summen fehlen');
  }
  for (const text of [admin]) {
    assert(text.includes(FERNFAHRER_PREIS_HINWEIS), 'Preishinweis fehlt');
    assert(!text.includes('1.645'), 'Wochenpreis darf nicht erscheinen');
  }
  assert(!customer.includes('Wochenend- und Feiertagszuschläge'), 'Zuschlagsabschnitt darf nicht erscheinen');
  assert(!customer.includes('1.645'), 'CE-Wochenpreis darf nicht erscheinen');
  assert(!customer.includes('Einsatzzeit und Mehrstunden'), 'Mehrstundenabschnitt darf nicht erscheinen');
});
