import { assertEquals, assertStringIncludes } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { eligible, uniqueRecipients, cancellationMail, deliverCancellations, type Driver } from './cancellation.ts';
const driver: Driver = { id: 'd1', vorname: 'Test', nachname: 'Fahrer', email: 'test@example.invalid', status: 'approved', is_blocked: false, is_inactive: false, email_opt_out: false };
const job = { einsatzort: 'Testort', zeitraum: 'Testzeitraum' };

Deno.test('Alle vier Versandbedingungen sind zwingend, auch bei zugeteilten Fahrern', () => {
  assertEquals(eligible(driver), true);
  for (const field of ['is_blocked', 'is_inactive', 'email_opt_out'] as const) {
    assertEquals(eligible({ ...driver, [field]: true }), false);
    assertEquals(eligible({ ...driver, [field]: null }), false);
  }
  for (const status of ['pending', 'rejected', 'inactive', null]) assertEquals(eligible({ ...driver, status }), false);
});
Deno.test('Doppelte IDs/Adressen ausgeschlossen, Zuteilung hat Vorrang', () => {
  const assigned = { ...driver, id: 'd2', email: ' TEST@example.invalid ' };
  assertEquals(uniqueRecipients([driver, driver, assigned], new Set(['d2'])).map(d => d.id), ['d2']);
});
Deno.test('Exakte freigegebene Texte für beide Empfängergruppen, HTML escaped', () => {
  const assigned = cancellationMail(driver, job, true);
  assertEquals(assigned.subject, 'Auftrag storniert – Testort / Testzeitraum');
  assertEquals(assigned.text, 'Hallo Test Fahrer,\n\nder Auftrag in Testort für den Zeitraum Testzeitraum wurde storniert.\n\nDer Einsatz findet nicht statt. Bitte plane diesen Auftrag nicht weiter ein.\n\nFreundliche Grüße\nGünter Killer\nFahrerexpress-Agentur');
  const invited = cancellationMail(driver, job, false);
  assertEquals(invited.subject, 'Auftrag nicht mehr verfügbar – Testort / Testzeitraum');
  assertEquals(invited.text, 'Hallo Test Fahrer,\n\nder zuvor versandte Auftrag in Testort für den Zeitraum Testzeitraum wurde storniert und steht nicht mehr zur Verfügung.\n\nEine Bewerbung bzw. Rückmeldung zu diesem Auftrag ist daher nicht mehr erforderlich.\n\nFreundliche Grüße\nGünter Killer\nFahrerexpress-Agentur');
  assertStringIncludes(cancellationMail({ ...driver, vorname: '<script>' }, job, false).html, '&lt;script&gt;');
});
Deno.test('Aktuelle Sperre nach Empfängerermittlung verhindert Versand', async () => {
  let sent = 0;
  let refreshes = 0;
  const result = await deliverCancellations([driver], new Set(['d1']), job, {
    refresh: async () => ++refreshes === 1 ? driver : { ...driver, is_blocked: true },
    alreadySent: async () => false,
    send: async () => { sent++; return 'fake'; }, log: async () => {}, pause: async () => {},
  });
  assertEquals(sent, 0);
  assertEquals(result.skipped, 1);
});
Deno.test('Bereits versendete Absage wird nicht erneut versandt', async () => {
  let sent = 0;
  const result = await deliverCancellations([driver], new Set(), job, {
    refresh: async () => driver, alreadySent: async () => true,
    send: async () => { sent++; return 'fake'; }, log: async () => {}, pause: async () => {},
  });
  assertEquals(sent, 0); assertEquals(result.alreadySent, 1);
});
Deno.test('Erfolgs- und Fehlerpfad nur mit simuliertem Versand', async () => {
  const logs: string[] = [];
  const result = await deliverCancellations([driver, { ...driver, id: 'd2', email: 'other@example.invalid' }], new Set(['d1']), job, {
    refresh: async id => id === 'd1' ? driver : { ...driver, id, email: 'other@example.invalid' },
    alreadySent: async () => false,
    send: async d => { if (d.id === 'd2') throw new Error('Simulierter Fehler'); return 'fake'; },
    log: async (_d, _m, status) => { logs.push(status); }, pause: async () => {},
  });
  assertEquals(result.sent, 1); assertEquals(result.failed, 1); assertEquals(logs, ['sent', 'failed']);
});