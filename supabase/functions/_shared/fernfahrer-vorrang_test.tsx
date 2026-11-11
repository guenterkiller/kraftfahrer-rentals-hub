import { renderAsync } from './render-email.ts';
import * as React from 'npm:react@18.3.1';
import { CustomerBookingConfirmation, FERNVERKEHR_OHNE_GESAMTPREIS, fernverkehrZeitraumMitWochenende } from './email-templates/customer-booking-confirmation.tsx';
import { AdminBookingNotification } from './email-templates/admin-booking-notification.tsx';
import { resolveTarif } from './tarif-zuordnung.ts';
import { berechneKostenUebersicht, FERNFAHRER_PREIS_HINWEIS, FERNFAHRER_WOCHENENDRUHE_HINWEIS } from './kosten-uebersicht.ts';

const assert = (c: boolean, m: string) => { if (!c) throw new Error(m); };
const decode = (h: string) => h.replace(/<[^>]*>/g, '').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

Deno.test('Datumszugriff bleibt bei leeren, einzelnen und mehreren Datumswerten unverändert', () => {
  assert(fernverkehrZeitraumMitWochenende('') === null, 'kein Datum');
  assert(fernverkehrZeitraumMitWochenende('16.11.2026') === false, 'ein Werktag');
  assert(fernverkehrZeitraumMitWochenende('21.11.2026') === true, 'ein Samstag');
  assert(fernverkehrZeitraumMitWochenende('16.11.2026 – 20.11.2026') === false, 'Mo–Fr');
  assert(fernverkehrZeitraumMitWochenende('16.11.2026 – 23.11.2026') === true, 'Wochenende');
  assert(fernverkehrZeitraumMitWochenende('23.11.2026 – 16.11.2026') === null, 'umgekehrt');
});

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
  // Interne Adminmail: vollständige Vorkalkulation mit Ruhetagshinweis.
  assert(admin.includes(FERNFAHRER_WOCHENENDRUHE_HINWEIS), 'Ruhetagshinweis fehlt');
  assert(admin.includes('3.471,06 €') && admin.includes('4.130,56 €'), 'Summen fehlen');
  // Kundenmail: Ruhetage offen → kein aus Kalendertagen erfundener Gesamtbetrag.
  assert(customer.includes(FERNVERKEHR_OHNE_GESAMTPREIS) && !customer.includes('3.471,06 €'), 'Kundenmail darf ohne geklärte Ruhetage keinen Gesamtbetrag nennen');
  for (const text of [admin]) {
    assert(text.includes(FERNFAHRER_PREIS_HINWEIS), 'Preishinweis fehlt');
    assert(!text.includes('1.645'), 'Wochenpreis darf nicht erscheinen');
  }
  assert(!customer.includes('Wochenend- und Feiertagszuschläge'), 'Zuschlagsabschnitt darf nicht erscheinen');
  assert(!customer.includes('1.645'), 'CE-Wochenpreis darf nicht erscheinen');
  assert(!customer.includes('Einsatzzeit und Mehrstunden'), 'Mehrstundenabschnitt darf nicht erscheinen');
});
