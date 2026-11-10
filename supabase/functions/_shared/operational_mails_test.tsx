// Rendert alle operativen Kunden-/Fahrermails mit TEST-Daten (kein Versand) und prüft die Kurzfassungs-Regeln.
// Mit OVERVIEW_OUT=<pfad> wird zusätzlich eine druckbare Kurzübersicht als HTML geschrieben.
import React from 'npm:react@18.3.1';
import { assert } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { renderAsync } from './render-email.ts';
import { CustomerBookingConfirmation } from './email-templates/customer-booking-confirmation.tsx';
import { NoShowNotice } from './email-templates/no-show-notice.tsx';
import { berechneKostenUebersicht } from './kosten-uebersicht.ts';
import { resolveTarif } from './tarif-zuordnung.ts';
import { createOfferSnapshot } from './binding-offer.ts';
import { shortOfferLines, renderShortOffer, NET_LABEL } from './short-offer.ts';
import { wrapDriverEmailHtml } from './email-templates/driver-html-shell.ts';
import { buildCustomerAssignmentNotice } from '../send-customer-assignment-notice/notice.ts';
import { cancellationMail } from '../admin-cancel-job/cancellation.ts';
import { confirmationHtml } from '../respond-invite/binding.ts';

type Mail = { nr: string; titel: string; empfaenger: string; ausloeser: string; betreff: string; html: string };
const mails: Mail[] = [];
const text = (h: string) => h.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const INTERN = /provision|commission|vermittlungsanteil|fahrerhonorar|fahrersatz|nettovergütung|rate_value|\b20 %|\b25 % (?!netto)/i;
const LANG = /Haftung für mittelbare|Folgeschäden|entgangenen Gewinn|Arbeitnehmerüberlassung und stellt|Stornierung unter 24 Stunden|Ersatzgestellung/;
const KUNDE = { company: 'TEST-Firma Muster GmbH', customer_name: 'TEST Erika Beispiel' };

const job = (tarif_type: string) => ({ ...KUNDE, customer_phone: '+49 000 TEST', einsatzort: 'TEST-Ort 12345 Musterstadt', fahrzeugtyp: 'LKW CE (Sattelzug)', nachricht: 'TEST – Fernverkehr mit Sattelzug', tarif_type, kosten_uebersicht: { netto: 9999 } });
const asg = (o: Record<string, unknown> = {}) => ({ rate_type: 'daily', rate_value: 450, start_date: '2026-11-16T00:00:00Z', end_date: '2026-11-20T00:00:00Z', times_entered: null, ...o });

async function kundenmail(nr: string, titel: string, tarifKey: string, kategorie: string, longDistance: boolean, extra: Record<string, unknown> = {}) {
  const tarif = tarifKey === 'ueberfuehrung' ? { tarif: 'ueberfuehrung', label: 'LKW-Überführung', netto: null, einheit: '', mehrstunde: null, needsReview: false, reason: '' } : resolveTarif({ kategorie, maschinenbedienung: '', longDistance });
  const k = tarifKey === 'ueberfuehrung' ? null : berechneKostenUebersicht(tarif.tarif as any, '2026-11-16', '2026-11-20');
  const html = await renderAsync(React.createElement(CustomerBookingConfirmation as any, {
    customerName: KUNDE.customer_name, companyName: KUNDE.company, driverType: kategorie, timeframe: '16.11.2026 – 20.11.2026', location: 'TEST-Ort 12345 Musterstadt',
    message: 'TEST – Auslieferung mit Sattelzug', tarif, isFernfahrerTarif: tarif.tarif === 'fernfahrer', kostenUebersicht: k, isUeberfuehrung: tarifKey === 'ueberfuehrung', ...extra,
  }));
  mails.push({ nr, titel, empfaenger: 'Auftraggeber', ausloeser: 'Absenden des Buchungsformulars', betreff: 'Ihre Fahrerbuchung bei der Fahrerexpress-Agentur', html });
  return { tarif, t: text(html) };
}

Deno.test('Kunden-Eingangsbestätigung: kurz, Kundenpreis, Status Anfrage, keine internen Daten', async () => {
  const ce = await kundenmail('1a', 'Eingangsbestätigung – LKW CE Tag', 'lkw_ce', 'LKW CE', false, { weekendHolidayAffected: true });
  assert(ce.t.includes('349,00 € netto je tatsächlichem Einsatztag') && ce.t.includes('Samstag 25 %'));
  const wo = await kundenmail('1b', 'Eingangsbestätigung – CE Wochenpreis', 'lkw_ce_woche', 'LKW CE Wochenpreis', false);
  assert(wo.t.includes('1.645,00 € netto für 5 Einsatztage von Montag bis Freitag'));
  const ff = await kundenmail('1c', 'Eingangsbestätigung – Fernfahrer (Fernverkehr)', 'fernfahrer', 'LKW CE', true, { unterkunftOption: 'keine' });
  assert(ff.t.includes('450,00 € netto je tatsächlichem Fernverkehrs-Einsatztag') && ff.t.includes('Keine Samstags-, Sonntags- oder Feiertagszuschläge') && !ff.t.includes('Samstag 25 %'));
  const bm = await kundenmail('1d', 'Eingangsbestätigung – Baumaschinenführer/Spezialfahrzeuge, Hotelbudget 75 €', 'baumaschine', 'Baumaschinenführer', false, { unterkunftOption: 'fahrer_organisiert', unterkunftObergrenze: 75 });
  assert(bm.t.includes('489,00 € netto je tatsächlichem Einsatztag') && bm.t.includes('75,00 €') && !bm.t.includes('90,00'));
  const ue = await kundenmail('1e', 'Eingangsbestätigung – LKW-Überführung', 'ueberfuehrung', 'LKW-Überführung', false);
  for (const m of [ce, wo, ff, bm, ue]) {
    assert(!INTERN.test(m.t), `intern: ${m.t.match(INTERN)?.[0]}`);
    assert(!LANG.test(m.t), `lang: ${m.t.match(LANG)?.[0]}`);
    assert(m.t.includes('noch keine Einsatzbestätigung') && m.t.includes('Vermittlungsbedingungen'));
    assert(m.t.length < 2600, `zu lang: ${m.t.length}`);
  }
});

Deno.test('Kunden-Zuteilungsmitteilung: Fahrer, Einsatz, Kundenpreis, kurz', () => {
  for (const [nr, t, label] of [['2a', 'fernfahrer', 'Fernfahrer'], ['2b', 'lkw_ce', 'LKW CE Tag']]) {
    const m = buildCustomerAssignmentNotice({ job: job(t), driverName: 'TEST Max Mustermann', driverPhone: '+49 000 FAHRER', driverEmail: 'fahrer@example.invalid', zeitraum: '16.11.2026 – 20.11.2026', einsatzort: 'TEST-Ort 12345 Musterstadt' });
    mails.push({ nr, titel: `Zuteilungsmitteilung an Auftraggeber – ${label}`, empfaenger: 'Auftraggeber', ausloeser: 'Verwaltung → Fahrer zuteilen → Kunde informieren', betreff: m.subject, html: m.html });
    const x = text(m.html);
    assert(!INTERN.test(x) && !LANG.test(x) && x.includes('TEST Max Mustermann') && x.includes(t === 'fernfahrer' ? '450,00 €' : '349,00 €'));
    assert(!x.includes('9.999'));
  }
});

Deno.test('No-Show-Mitteilung: an Auftraggeber, ohne Betrag und ohne leere Platzhalter', async () => {
  const html = await renderAsync(React.createElement(NoShowNotice, { customerName: KUNDE.customer_name, company: KUNDE.company, einsatzort: 'TEST-Ort 12345 Musterstadt', zeitraum: '16.11.2026', fahrzeugtyp: 'LKW CE' }));
  mails.push({ nr: '3', titel: 'No-Show-Mitteilung an Auftraggeber', empfaenger: 'Auftraggeber (Kopie Verwaltung)', ausloeser: 'Verwaltung → No-Show melden', betreff: 'Fahrer nicht erschienen – TEST-Ort 12345 Musterstadt (16.11.2026)', html });
  const x = text(html);
  assert(!x.includes('€') && !x.includes('()') && !INTERN.test(x) && x.includes('Guten Tag TEST Erika Beispiel'));
});

Deno.test('Fahrer-Angebot und Annahmebestätigung: einziger Preis = Nettovergütung nach Provision', () => {
  const variants: [string, string, any, any][] = [
    ['4a', 'Fahrerangebot – Fernverkehr Mo–Fr (verbindlich)', job('fernfahrer'), asg()],
    ['4b', 'Fahrerangebot – CE Tag 349 € (verbindlich)', job('lkw_ce'), asg({ rate_value: 349 })],
    ['4c', 'Fahrerangebot – Baumaschine 489 € (25 %, verbindlich)', job('baumaschine'), asg({ rate_value: 489, end_date: '2026-11-17T00:00:00Z' })],
    ['4d', 'Fahrerangebot – Fernverkehr inkl. Wochenende (unverbindlich, kein Betrag)', job('fernfahrer'), asg({ end_date: '2026-11-23T00:00:00Z' })],
  ];
  const expected: Record<string, string> = { '4a': '1.800,00 €', '4b': '1.396,00 €', '4c': '733,50 €' };
  for (const [nr, titel, j, a] of variants) {
    const s = createOfferSnapshot(j, a);
    const binding = s.binding_allowed === true;
    const lines = shortOfferLines(s.job_lines!, binding, nr === '4d' ? '16.11.2026 – 23.11.2026' : '16.11.2026 – 20.11.2026');
    const button = binding ? '<p><a href="https://www.kraftfahrer-mieten.com/fahrer-antwort-bestaetigen?action=accept&token=TEST-TOKEN" style="display:inline-block;padding:12px 20px;background:#16a34a;color:#fff;font-weight:700;border-radius:6px;text-decoration:none;">Auftrag verbindlich annehmen</a></p><p style="font-size:13px;">Die vollständigen Vertragsbedingungen werden auf Ihrer persönlichen Bestätigungsseite vor der verbindlichen Annahme angezeigt.</p>' : '<p><strong>Noch keine verbindliche Annahme möglich:</strong> Vergütung oder wesentliche Auftragsdaten sind noch nicht eindeutig bestimmt. Bitte melden Sie sich bei Interesse telefonisch.</p>';
    const html = wrapDriverEmailHtml(`<h2>${binding ? 'VERBINDLICHES AUFTRAGSANGEBOT' : 'AUFTRAGSANFRAGE (UNVERBINDLICH)'}</h2><p>Hallo TEST Max Mustermann,<br/>Sie wurden für folgenden Einsatz ausgewählt:</p>${renderShortOffer(lines)}${button}`, { subject: 'x', previewText: 'x', showUnsubscribe: false });
    mails.push({ nr, titel, empfaenger: 'Fahrer (Kopie Verwaltung)', ausloeser: 'Verwaltung → Zuteilen → Zuweisen & Bestätigung senden', betreff: `Auftragsangebot – LKW CE (Sattelzug) – TEST-Ort 12345 Musterstadt am …`, html });
    const x = text(html).replace(NET_LABEL, '');
    const euros = x.match(/[\d.]+,\d{2} €/g) ?? [];
    if (expected[nr]) { assert(binding && euros.length === 1 && euros[0] === expected[nr], `${nr}: ${euros}`); }
    else assert(!binding && euros.length === 0, `${nr}: ${euros}`);
    assert(!/450,00|349,00|489,00|9\.999|\b20 %|\b25 %|vor Provision/.test(x), `${nr}: interner Wert sichtbar`);
    if (nr === '4a') {
      const c = confirmationHtml('TEST Max Mustermann', '16.11.2026, 08:00:00', lines, 'TEST-HASH');
      mails.push({ nr: '5', titel: 'Annahmebestätigung an Fahrer (mit PDF-Anhang)', empfaenger: 'Fahrer (Kopie Verwaltung)', ausloeser: 'Fahrer bestätigt auf der Bestätigungsseite', betreff: 'Annahmebestätigung – verbindliche Auftragsannahme – TEST-Ort 12345 Musterstadt', html: c });
      const cx = text(c);
      assert((cx.match(/[\d.]+,\d{2} €/g) ?? []).length === 1 && !/Provisionssatz|\b20 %/.test(cx));
    }
  }
});

Deno.test('Stornierung an Fahrer: freigegebene Kurztexte', () => {
  const d = { id: 'T', vorname: 'TEST Max', nachname: 'Mustermann', email: 'fahrer@example.invalid', status: 'approved', is_blocked: false, is_inactive: false, email_opt_out: false } as any;
  for (const [nr, assigned] of [['6a', true], ['6b', false]] as const) {
    const m = cancellationMail(d, { einsatzort: 'TEST-Ort', zeitraum: '16.11.2026 – 20.11.2026' }, assigned);
    mails.push({ nr, titel: assigned ? 'Stornierung an zugeteilten Fahrer' : 'Stornierung an informierte Fahrer', empfaenger: 'Fahrer', ausloeser: 'Verwaltung → Auftrag stornieren', betreff: m.subject, html: m.html });
    assert(!text(m.html).includes('€'));
  }
});

Deno.test({ name: 'Kurzübersicht schreiben (nur mit OVERVIEW_OUT)', ignore: !Deno.env.get('OVERVIEW_OUT'), fn: async () => {
  const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const body = mails.sort((a, b) => a.nr.localeCompare(b.nr, 'de', { numeric: true })).map((m) => `<section><h2>${esc(m.nr)}. ${esc(m.titel)}</h2><p class="meta"><b>Empfänger:</b> ${esc(m.empfaenger)} · <b>Auslöser:</b> ${esc(m.ausloeser)}<br/><b>Betreff:</b> ${esc(m.betreff)}</p><iframe srcdoc="${m.html.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"></iframe></section>`).join('');
  await Deno.writeTextFile(Deno.env.get('OVERVIEW_OUT')!, `<!doctype html><html lang="de"><meta charset="utf-8"><title>Fahrerexpress – Kurzübersicht operative E-Mails</title><style>@page{size:A4;margin:12mm}body{font:10pt Arial,sans-serif;color:#182b3b}section{break-inside:avoid;break-after:page}h2{font-size:14pt;margin:0 0 6px}.meta{background:#edf2f5;padding:8px;border-left:4px solid #276176}iframe{width:100%;height:900px;border:1px solid #cbd5df}</style><body><h1>Fahrerexpress – Kurzübersicht operative E-Mails</h1><p>Prüfexemplar · TEST-Daten · nicht versendet · Stand 10.11.2026. Alle Beispiele sind mit dem tatsächlichen Vorlagencode gerendert.</p><p><b>Regeln:</b> Kundenmails zeigen nur Kundenpreise (LKW CE 349 €/Tag bis 9 h · CE-Woche 1.645 € Mo–Fr · Fernfahrer 450 € je Fernverkehrs-Einsatztag · Baumaschine/Spezial 489 €/Tag bis 8 h), nie Fahrerhonorar oder Provision. Fahrermails zeigen als einzigen Preis die Nettovergütung nach Provision. Weitere Konditionen über Links auf die Vermittlungsbedingungen bzw. die Bestätigungsseite.</p>${body}</body></html>`);
}});
