// Kurze Fahrer-Angebotsmail (Standard für alle neuen verbindlichen Angebote).
// Liest nur Zeilen der unveränderlichen Angebotskopie; einziger Preis = gespeicherte Nettovergütung nach Provision.
// Gemeinsam genutzt von send-driver-confirmation (Angebotsmail) und respond-invite (Annahmebestätigung).
// Filterregeln identisch zu src/lib/driverAcceptanceNet.ts (Annahmeseite).
import { escapeOffer } from './binding-offer.ts';

export const NET_LABEL = 'Ihre Nettovergütung für diesen Auftrag (nach Abzug der Vermittlungsprovision)';
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
    ['Einsatzort / Treffpunkt (nicht bestätigt – genaue Einsatzanschrift vor Einsatz mit dem Auftraggeber abstimmen)', place && !MISSING.test(place) ? place : 'Nicht erfasst – vor Einsatz abstimmen'],
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
