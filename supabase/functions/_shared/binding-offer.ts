// Private driver offers only. Never import into customer mail/booking paths.
import { formatAssignmentPeriod } from './berlin-time.ts';
import { normalizeCommissionPct } from './driver-contract-terms.ts';
import { formatEuro, UNTERKUNFT_OPTIONEN, UNTERKUNFT_GRUNDSATZ, type UnterkunftOption } from './kosten-uebersicht.ts';
import { TRAVEL_COSTS, overnightParagraphs } from './overnight-costs.ts';

export type OfferData = Record<string, any>;
export type OfferSnapshot = { version: number; job: OfferData; assignment: OfferData; job_lines?: [string, string][] };
export const escapeOffer = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const known = (value: unknown, missing = 'Nicht erfasst – vor Einsatz abstimmen') => String(value ?? '').trim() || missing;
const day = (value: unknown) => typeof value === 'string' && !isNaN(Date.parse(value)) ? value.slice(0, 10) : '';

/** Reuse the stored customer calculation only if it describes this exact agreed service rate and period. */
export function remuneration(job: OfferData, assignment: OfferData) {
  const dates = String(job.zeitraum ?? '').match(/\d{2}\.\d{2}\.\d{4}/g) ?? [];
  const iso = (d: string) => d.split('.').reverse().join('-');
  const start = day(assignment.start_date), end = day(assignment.end_date);
  const count = start && end ? Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1 : null;
  const samePeriod = dates.length >= 2 && iso(dates[0] ?? '') === start && iso(dates[1] ?? '') === end;
  const sameRate = Number(assignment.rate_value) === job.tarif_netto &&
    ((assignment.rate_type === 'daily' && ['lkw_ce', 'fernfahrer', 'baumaschine'].includes(job.tarif_type)) ||
      (assignment.rate_type === 'weekly' && job.tarif_type === 'lkw_ce_woche'));
  const costs = job.kosten_uebersicht;
  const valid = samePeriod && sameRate && !job.tarif_needs_review && costs &&
    typeof costs.netto === 'number' && Number.isFinite(costs.netto) && costs.netto > 0 &&
    Array.isArray(costs.positionen) && costs.positionen.length > 0 &&
    costs.positionen.every((p: any) => typeof p.label === 'string' && typeof p.betrag === 'number' && Number.isFinite(p.betrag)) &&
    Math.round(costs.positionen.reduce((sum: number, p: any) => sum + p.betrag * 100, 0)) === Math.round(costs.netto * 100);
  const pct = normalizeCommissionPct(assignment.commission_pct);
  const serviceCents = valid ? Math.round(costs.netto * 100) : null;
  const commissionCents = serviceCents === null ? null : Math.round(serviceCents * pct / 100);
  return { days: count && count > 0 ? count : null, pct, serviceCents, commissionCents,
    driverCents: serviceCents === null || commissionCents === null ? null : serviceCents - commissionCents,
    positions: valid ? costs.positionen as { label: string; betrag: number }[] : [] };
}

export function buildCompleteOfferLines(job: OfferData, assignment: OfferData): [string, string][] {
  const pay = remuneration(job, assignment);
  const unit = assignment.rate_type === 'daily' ? 'Einsatztag' : assignment.rate_type === 'weekly' ? 'Woche' : assignment.rate_type === 'hourly' ? 'Stunde' : 'Auftrag';
  const address = [job.customer_street, job.customer_house_number, job.customer_postal_code, job.customer_city].filter(Boolean).join(' ');
  const option = job.unterkunft_option as UnterkunftOption;
  const lines: [string, string][] = [
    ['Auftraggeber / Firma', known(job.company)],
    ['Ansprechpartner', known(job.customer_name)],
    ['Auftraggeberanschrift (nicht automatisch Einsatzanschrift)', known(address)],
    ['Telefon', known(job.customer_phone)], ['E-Mail', known(job.customer_email)],
    ['Einsatzort / Treffpunkt (gespeicherte Angabe)', known(job.einsatzort)],
    ['Einsatzanschrift', 'Nicht gesondert erfasst – genauen Treffpunkt vor Einsatz abstimmen; Auftraggeberanschrift nicht als Einsatzanschrift vorausgesetzt'],
    ['Einsatzzeitraum', formatAssignmentPeriod(assignment.start_date, assignment.end_date, assignment.times_entered) || known(job.zeitraum)],
    ['Einsatztage im vereinbarten Zeitraum', pay.days === null ? 'Nicht eindeutig erfasst' : String(pay.days)],
    ['Konkrete tägliche Einsatzzeiten', assignment.times_entered === true ? 'Erfasste Beginn-/Endzeiten siehe Einsatzzeitraum' : 'Nicht erfasst – zwischen Auftraggeber und Fahrer abstimmen'],
    ['Fahrzeugart', known(job.fahrzeugtyp)], ['Führerscheinklasse', known(job.fuehrerscheinklasse)],
    ['Einsatzbeschreibung / Kundenanforderungen', known(job.nachricht)],
    ['Weitere Anforderungen', known(job.besonderheiten, 'Keine weiteren Angaben gespeichert')],
    ['Maschinenbedienung', known(job.maschinenbedienung, 'Keine Angabe gespeichert')],
    ['Tarif', known(job.tarif_label, 'Individuell vereinbarter Satz')],
    ['Vereinbarter Satz netto', Number(assignment.rate_value) > 0 ? `${formatEuro(Number(assignment.rate_value))} je ${unit}` : 'Nicht vereinbart'],
    ['Enthaltene Einsatzzeit / Tarifeinheit', known(job.tarif_unit)],
    ['Mehrstundenpreis netto', typeof job.tarif_mehrstunde_netto === 'number' ? `${formatEuro(job.tarif_mehrstunde_netto)} je angefangene Mehrstunde` : job.tarif_type === 'fernfahrer' ? 'Pauschaltarif ohne Mehrstundenabrechnung' : 'Nicht gespeichert / nicht vereinbart'],
  ];
  for (const p of pay.positions) lines.push([`Fahrleistung: ${p.label}`, `${formatEuro(p.betrag)} netto`]);
  lines.push(
    ['Gesamtwert Fahrerdienstleistung netto (vor weiteren Zusatzkosten)', pay.serviceCents === null ? 'Nicht eindeutig aus den gespeicherten, vereinbarten Konditionen bezifferbar – vor Annahme klären' : formatEuro(pay.serviceCents / 100)],
    [`Vermittlungsanteil ${pay.pct} %`, pay.commissionCents === null ? 'Eurobetrag mangels eindeutigen Gesamtwerts offen' : `${formatEuro(pay.commissionCents / 100)} netto`],
    ['Verbleibende Fahrervergütung netto (vor weiteren Zusatzkosten)', pay.driverCents === null ? 'Noch nicht bezifferbar – vor Annahme klären' : formatEuro(pay.driverCents / 100)],
    ['An- und Abfahrtskosten (provisionsfrei)', `Kein vereinbarter Betrag gespeichert – nicht als 0 € angesetzt. ${TRAVEL_COSTS.short}. Vor Einsatz abstimmen.`],
    ['Unterkunftsauswahl', option && option in UNTERKUNFT_OPTIONEN ? UNTERKUNFT_OPTIONEN[option] : 'Keine Angabe gespeichert'],
  );
  if (typeof job.unterkunft_obergrenze === 'number') lines.push(['Kostenobergrenze je Nacht (€ netto)', `${formatEuro(job.unterkunft_obergrenze)} – Budget, keine automatische Kostenpauschale`]);
  lines.push(['Unterkunftsregelung', [UNTERKUNFT_GRUNDSATZ, ...overnightParagraphs(job.tarif_type)].join('\n')],
    ['Mögliche Zusatzkosten', 'Tatsächlich anfallende Mehrstunden und einsatzbezogene Zuschläge sind provisionspflichtig; An- und Abfahrtskosten sind provisionsfrei. Nicht bezifferte Kosten wurden nicht hinzugerechnet.'],
    ['Zuschläge', 'Samstag 25 %, Sonn- und Feiertag 50 %']);
  return lines;
}

export function createOfferSnapshot(job: OfferData, assignment: OfferData): OfferSnapshot {
  const copy = JSON.parse(JSON.stringify({ version: 2, job, assignment })) as OfferSnapshot;
  copy.job_lines = buildCompleteOfferLines(copy.job, copy.assignment);
  return copy;
}

export function renderOfferLines(lines: [string, string][]) {
  return lines.map(([label, value]) => `<p class="body-text" style="margin:6px 0;font-size:14px;line-height:1.55;white-space:pre-line"><strong>${escapeOffer(label)}:</strong> ${escapeOffer(value)}</p>`).join('');
}