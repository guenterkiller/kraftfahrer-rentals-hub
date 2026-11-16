// Kurze Fahrer-Angebotsmail (Standard für alle neuen verbindlichen Angebote).
// Liest nur Zeilen der unveränderlichen Angebotskopie; einziger Preis = gespeicherte Nettovergütung nach Provision.
// Gemeinsam genutzt von send-driver-confirmation (Angebotsmail) und respond-invite (Annahmebestätigung).
// Filterregeln identisch zu src/lib/driverAcceptanceNet.ts (Annahmeseite).
import { escapeOffer } from './binding-offer.ts';
import { getDriverCompensation } from './driver-compensation.ts';

export const NET_LABEL = 'Ihre Nettovergütung für diesen Auftrag';
const NET_SOURCE = /^(Verbleibende Nettovergütung|Verbleibende Fahrervergütung netto|Nettovergütung des selbstständigen Fahrers)/;
const EURO_AMOUNT = /^-?[\d.]+,\d{2}\s?€$/;
const MISSING = /^Nicht (erfasst|gesondert erfasst)/;

const pick = (lines: [string, string][], prefix: string) => lines.find(([l]) => l.startsWith(prefix))?.[1]?.trim() ?? '';
const shorten = (v: string, max = 300) => v.length > max ? `${v.slice(0, max).trimEnd()} …` : v;

/** Nettobetrag nur, wenn verbindlich erlaubt und als exakter Eurobetrag gespeichert – nie neu berechnet. */
export function shortOfferNet(lines: [string, string][], bindingAllowed: boolean): string | null {
  const raw = lines.find(([l]) => NET_SOURCE.test(l))?.[1]?.trim().replace(/\u00a0/g, ' ') ?? '';
  return bindingAllowed && EURO_AMOUNT.test(raw) ? raw : null;
}

export function shortOfferLines(lines: [string, string][], bindingAllowed: boolean, period: string): [string, string][] {
  const place = pick(lines, 'Einsatzort / Treffpunkt');
  const out: [string, string][] = [
    ['Auftraggeber / Firma', pick(lines, 'Auftraggeber / Firma')],
    ['Ansprechpartner', pick(lines, 'Ansprechpartner')],
    ['Telefon', pick(lines, 'Telefon')],
    [lines.some(([label]) => label === 'Einsatzort / Treffpunkt (vom Auftraggeber bestätigt)') ? 'Einsatzort / Treffpunkt (vom Auftraggeber bestätigt)' : 'Einsatzort / Treffpunkt (nicht bestätigt – genaue Einsatzanschrift vor Einsatz mit dem Auftraggeber abstimmen)', place && !MISSING.test(place) ? place : 'Nicht erfasst – vor Einsatz abstimmen'],
    ['Einsatzzeitraum', period],
    ['Fahrzeugart', pick(lines, 'Fahrzeugart')],
    ['Aufgabe', shorten(pick(lines, 'Einsatzbeschreibung'))],
  ].filter(([, v]) => v) as [string, string][];
  const net = shortOfferNet(lines, bindingAllowed);
  if (net) out.push([NET_LABEL, net]);
  return out;
}

export function renderShortOffer(lines: [string, string][]) {
  return lines.map(([l, v]) => `<p class="body-text" style="margin:6px 0;font-size:14px;line-height:1.55;white-space:pre-line"><strong>${escapeOffer(l)}:</strong> ${escapeOffer(v)}</p>`).join('');
}

/** Auffällige Vergütungsbox für das persönliche Angebot; liest keine Kundenkalkulation. */
export function renderDriverCompensationBox(lines: [string, string][], bindingAllowed: boolean): string {
  const c = getDriverCompensation(lines, bindingAllowed);
  if (!c) return '';
  const row = (label: string, value: string | null) => value
    ? `<p class="body-text" style="margin:5px 0;font-size:14px;line-height:1.5;color:#1f2937;"><strong>${escapeOffer(label)}:</strong> ${escapeOffer(value)}</p>`
    : '';
  return `<table data-testid="driver-compensation-box" role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f0fdf4" style="background-color:#f0fdf4;border:2px solid #16a34a;border-radius:10px;border-collapse:separate;margin:0 0 16px 0;"><tr><td style="padding:18px 20px;">
    <h3 class="body-text" style="margin:0 0 10px 0;font-size:18px;line-height:1.3;color:#166534;font-weight:700;">Ihre Vergütung für diesen Auftrag</h3>
    <p class="body-text" style="margin:0;font-size:28px;line-height:1.2;color:#14532d;font-weight:800;">${escapeOffer(c.totalNet)}</p>
    <p class="body-text" style="margin:3px 0 8px 0;font-size:14px;line-height:1.5;color:#166534;font-weight:600;">netto für den Gesamteinsatz</p>
    ${c.unitNet && c.unitNetLabel ? `<p class="body-text" style="margin:0 0 12px 0;font-size:16px;line-height:1.5;color:#14532d;"><strong>${escapeOffer(c.unitNet)}</strong> ${escapeOffer(c.unitNetLabel)}</p>` : ''}
    ${row('Abrechnung', c.billing)}
    ${row('Einsatzzeitraum', c.period)}
    ${row('Führerschein', c.license)}
    ${row('Fahrzeugart', c.vehicle)}
    ${row('Tätigkeit', c.activity)}
    ${row('Einsatzort / Treffpunkt', c.place)}
  </td></tr></table>`;
}
